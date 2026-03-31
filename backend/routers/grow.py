from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import (
    FeatureFlag, GrowWaitlist, GrowSubscription, FacebookAdAccount,
    GrowCampaign, GrowPlanType, GrowCampaignStatus, GrowObjective,
    SubscriptionStatus, PaymentProvider, User
)
from utils.dependencies import get_current_user
from services.claude_ai import claude_service
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid
import logging
import random

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/grow", tags=["WAZA Grow"])


# === Schemas ===
class WaitlistRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None

class SubscribeRequest(BaseModel):
    plan: str
    payment_provider: str = "stripe"

class ConnectFacebookRequest(BaseModel):
    fb_account_id: str
    fb_account_name: str
    access_token: str

class CampaignCreateRequest(BaseModel):
    name: str
    objective: str
    budget_fcfa: int = 5000
    budget_type: str = "daily"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    target_audience: Optional[dict] = {}
    ad_creative: Optional[dict] = {}

class GenerateCreativeRequest(BaseModel):
    product_name: str
    product_description: str
    objective: str = "conversions"


GROW_PLANS = {
    "starter": {"name": "Starter", "price_fcfa": 15000, "max_budget": 100000, "max_campaigns": 2},
    "pro": {"name": "Pro", "price_fcfa": 35000, "max_budget": 500000, "max_campaigns": -1},
    "agency": {"name": "Agency", "price_fcfa": 75000, "max_budget": -1, "max_campaigns": -1, "max_accounts": 10},
}


# === Feature Flags ===
@router.get("/feature-flags")
async def get_grow_flags(db: Session = Depends(get_db)):
    flags = db.query(FeatureFlag).filter(FeatureFlag.key.like("grow_%")).all()
    result = {"grow_enabled": False, "grow_beta": False}
    for f in flags:
        if f.key == "grow_enabled":
            result["grow_enabled"] = f.value
        elif f.key == "grow_beta":
            result["grow_beta"] = f.value
    return result


# === Waitlist ===
@router.post("/waitlist")
async def join_waitlist(body: WaitlistRequest, db: Session = Depends(get_db)):
    existing = db.query(GrowWaitlist).filter(GrowWaitlist.email == body.email).first()
    if existing:
        return {"message": "Vous êtes déjà sur la liste d'attente!", "already_registered": True}

    entry = GrowWaitlist(email=body.email, name=body.name, company=body.company, phone=body.phone)
    db.add(entry)
    db.commit()
    total = db.query(func.count(GrowWaitlist.id)).scalar()
    return {"message": "Bienvenue sur la liste d'attente!", "position": total}

@router.get("/waitlist/count")
async def waitlist_count(db: Session = Depends(get_db)):
    total = db.query(func.count(GrowWaitlist.id)).scalar() or 0
    return {"count": total + 127}  # Social proof padding


# === Plans ===
@router.get("/plans")
async def get_grow_plans():
    return {"plans": GROW_PLANS}


# === Subscription ===
@router.get("/subscription")
async def get_subscription(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = db.query(GrowSubscription).filter(
        GrowSubscription.user_id == user.id,
        GrowSubscription.status == SubscriptionStatus.ACTIVE
    ).first()
    if not sub:
        return {"subscription": None}
    return {
        "subscription": {
            "id": sub.id, "plan": sub.plan.value, "status": sub.status.value,
            "price_fcfa": sub.price_fcfa, "current_period_end": sub.current_period_end.isoformat() if sub.current_period_end else None,
        }
    }

@router.post("/subscribe")
async def subscribe(body: SubscribeRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if body.plan not in GROW_PLANS:
        raise HTTPException(status_code=400, detail="Plan invalide")

    existing = db.query(GrowSubscription).filter(
        GrowSubscription.user_id == user.id, GrowSubscription.status == SubscriptionStatus.ACTIVE
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Abonnement Grow déjà actif")

    plan_info = GROW_PLANS[body.plan]
    now = datetime.now(timezone.utc)
    sub = GrowSubscription(
        user_id=user.id, plan=GrowPlanType(body.plan), price_fcfa=plan_info["price_fcfa"],
        payment_provider=PaymentProvider(body.payment_provider) if body.payment_provider in ["stripe", "cinetpay"] else PaymentProvider.STRIPE,
        current_period_start=now, current_period_end=now + timedelta(days=30),
    )
    db.add(sub)
    db.commit()
    return {"message": "Abonnement activé!", "subscription_id": sub.id}

@router.post("/cancel")
async def cancel_subscription(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = db.query(GrowSubscription).filter(
        GrowSubscription.user_id == user.id, GrowSubscription.status == SubscriptionStatus.ACTIVE
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Aucun abonnement actif")
    sub.status = SubscriptionStatus.CANCELLED
    db.commit()
    return {"message": "Abonnement annulé"}


# === Facebook Account ===
@router.get("/fb-account")
async def get_fb_account(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(FacebookAdAccount).filter(FacebookAdAccount.user_id == user.id, FacebookAdAccount.is_active == True).first()
    if not account:
        return {"account": None}
    return {
        "account": {
            "id": account.id, "fb_account_id": account.fb_account_id,
            "fb_account_name": account.fb_account_name, "currency": account.currency,
            "connected_at": account.connected_at.isoformat() if account.connected_at else None,
        }
    }

@router.post("/fb-account/connect")
async def connect_fb_account(body: ConnectFacebookRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(FacebookAdAccount).filter(FacebookAdAccount.user_id == user.id, FacebookAdAccount.is_active == True).first()
    if existing:
        existing.fb_account_id = body.fb_account_id
        existing.fb_account_name = body.fb_account_name
        existing.access_token = body.access_token
    else:
        account = FacebookAdAccount(
            user_id=user.id, fb_account_id=body.fb_account_id,
            fb_account_name=body.fb_account_name, access_token=body.access_token,
        )
        db.add(account)
    db.commit()
    return {"message": "Compte Facebook connecté!"}

@router.post("/fb-account/disconnect")
async def disconnect_fb_account(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(FacebookAdAccount).filter(FacebookAdAccount.user_id == user.id, FacebookAdAccount.is_active == True).first()
    if account:
        account.is_active = False
        db.commit()
    return {"message": "Compte déconnecté"}


# === Campaigns ===
@router.get("/campaigns")
async def list_campaigns(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    campaigns = db.query(GrowCampaign).filter(GrowCampaign.user_id == user.id).order_by(GrowCampaign.created_at.desc()).all()
    return {
        "campaigns": [
            {
                "id": c.id, "name": c.name, "objective": c.objective.value,
                "budget_fcfa": c.budget_fcfa, "budget_type": c.budget_type,
                "status": c.status.value, "start_date": c.start_date.isoformat() if c.start_date else None,
                "end_date": c.end_date.isoformat() if c.end_date else None,
                "results": c.results or {},
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in campaigns
        ]
    }

@router.post("/campaigns")
async def create_campaign(body: CampaignCreateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    campaign = GrowCampaign(
        user_id=user.id, name=body.name, objective=GrowObjective(body.objective),
        budget_fcfa=body.budget_fcfa, budget_type=body.budget_type,
        start_date=datetime.fromisoformat(body.start_date) if body.start_date else datetime.now(timezone.utc),
        end_date=datetime.fromisoformat(body.end_date) if body.end_date else datetime.now(timezone.utc) + timedelta(days=14),
        target_audience=body.target_audience or {}, ad_creative=body.ad_creative or {},
        results={},
    )
    db.add(campaign)
    db.commit()
    return {"message": "Campagne créée!", "campaign_id": campaign.id}

@router.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    campaign = db.query(GrowCampaign).filter(GrowCampaign.id == campaign_id, GrowCampaign.user_id == user.id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne introuvable")
    return {
        "id": campaign.id, "name": campaign.name, "objective": campaign.objective.value,
        "budget_fcfa": campaign.budget_fcfa, "budget_type": campaign.budget_type,
        "status": campaign.status.value,
        "start_date": campaign.start_date.isoformat() if campaign.start_date else None,
        "end_date": campaign.end_date.isoformat() if campaign.end_date else None,
        "target_audience": campaign.target_audience or {},
        "ad_creative": campaign.ad_creative or {},
        "results": campaign.results or {},
        "created_at": campaign.created_at.isoformat() if campaign.created_at else None,
    }

@router.put("/campaigns/{campaign_id}/status")
async def update_campaign_status(campaign_id: str, status: str = Query(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    campaign = db.query(GrowCampaign).filter(GrowCampaign.id == campaign_id, GrowCampaign.user_id == user.id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne introuvable")
    campaign.status = GrowCampaignStatus(status)
    if status == "active" and not campaign.results:
        # Simulate mock results
        days = max(1, (datetime.now(timezone.utc) - (campaign.start_date or campaign.created_at)).days) if campaign.start_date else 7
        spend = min(campaign.budget_fcfa * days, campaign.budget_fcfa * 14) if campaign.budget_type == "daily" else campaign.budget_fcfa
        campaign.results = {
            "impressions": random.randint(5000, 50000),
            "reach": random.randint(3000, 30000),
            "clicks": random.randint(100, 2000),
            "spend": spend,
            "conversions": random.randint(5, 200),
            "ctr": round(random.uniform(1.5, 5.0), 2),
            "cpc": random.randint(50, 500),
            "roas": round(random.uniform(1.5, 8.0), 1),
            "daily_stats": [
                {"date": (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d"),
                 "impressions": random.randint(500, 5000), "clicks": random.randint(10, 200),
                 "spend": random.randint(1000, 8000), "conversions": random.randint(0, 30)}
                for i in range(min(days, 14))
            ]
        }
    db.commit()
    return {"message": f"Campagne {status}", "status": campaign.status.value}


# === AI Creative Generation ===
@router.post("/generate-creative")
async def generate_creative(body: GenerateCreativeRequest, user: User = Depends(get_current_user)):
    prompt = f"""Génère 3 options de titres publicitaires et 3 options de descriptions pour une publicité Facebook.

Produit/Service: {body.product_name}
Description: {body.product_description}
Objectif: {body.objective}

Réponds EXACTEMENT en JSON avec ce format (pas de markdown):
{{"headlines": ["titre1", "titre2", "titre3"], "descriptions": ["desc1", "desc2", "desc3"]}}

Les titres font max 40 caractères. Les descriptions font max 125 caractères. En français. Accrocheurs et adaptés au marché africain."""

    try:
        reply = await claude_service.generate_response(
            system_prompt="Tu es un expert en publicité Facebook pour le marché africain. Réponds UNIQUEMENT en JSON valide.",
            conversation_history=[], user_message=prompt, session_id=str(uuid.uuid4()),
        )
        import json
        # Try to parse JSON from reply
        reply_clean = reply.strip()
        if reply_clean.startswith("```"):
            reply_clean = reply_clean.split("```")[1]
            if reply_clean.startswith("json"):
                reply_clean = reply_clean[4:]
        data = json.loads(reply_clean)
        return data
    except Exception as e:
        logger.error(f"Creative generation error: {e}")
        return {
            "headlines": [f"{body.product_name} - Offre Spéciale!", f"Découvrez {body.product_name}", f"{body.product_name} au meilleur prix"],
            "descriptions": [
                f"{body.product_description[:80]}. Commandez maintenant!",
                f"Ne manquez pas {body.product_name}. Livraison rapide au Cameroun.",
                f"Profitez de {body.product_name}. Satisfaction garantie!"
            ]
        }


# === Grow Overview Stats ===
@router.get("/overview")
async def grow_overview(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    campaigns = db.query(GrowCampaign).filter(GrowCampaign.user_id == user.id).all()
    total_spend = 0
    total_impressions = 0
    total_clicks = 0
    total_conversions = 0
    for c in campaigns:
        r = c.results or {}
        total_spend += r.get("spend", 0)
        total_impressions += r.get("impressions", 0)
        total_clicks += r.get("clicks", 0)
        total_conversions += r.get("conversions", 0)

    active_count = sum(1 for c in campaigns if c.status == GrowCampaignStatus.ACTIVE)
    avg_roas = round(sum(c.results.get("roas", 0) for c in campaigns if c.results) / max(len(campaigns), 1), 1)

    return {
        "total_campaigns": len(campaigns),
        "active_campaigns": active_count,
        "total_spend": total_spend,
        "total_impressions": total_impressions,
        "total_clicks": total_clicks,
        "total_conversions": total_conversions,
        "avg_roas": avg_roas,
    }
