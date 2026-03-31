from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case, extract
from database import get_db
from models import (
    User, Workspace, Agent, Contact, Conversation, Message,
    Broadcast, Subscription, PaymentTransaction, UsageLog,
    PlanType, SubscriptionStatus, ConversationStatus, PaymentConfig,
    DemoSession, AuditLog
)
from utils.dependencies import get_current_superadmin
from utils.auth import hash_password
from config import PLAN_LIMITS
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import Optional
from fastapi.responses import StreamingResponse
import logging
import csv
import io

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["Admin"])


# --- Schemas ---
class UserPlanUpdate(BaseModel):
    plan: str

class UserSuspendAction(BaseModel):
    suspend: bool

class PlatformSettings(BaseModel):
    maintenance_mode: Optional[bool] = None
    announcement: Optional[str] = None


# --- Helper ---
def user_to_dict(user):
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "company_name": user.company_name,
        "country": user.country,
        "plan": user.plan.value if user.plan else "free",
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "is_superadmin": getattr(user, 'is_superadmin', False),
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


def log_audit(db: Session, admin_email: str, action: str, target_type: str = None, target_id: str = None, details: str = None, ip: str = None):
    entry = AuditLog(admin_email=admin_email, action=action, target_type=target_type, target_id=target_id, details=details, ip_address=ip)
    db.add(entry)
    db.commit()


# --- Admin Stats ---
@router.get("/stats")
async def get_admin_stats(
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    total_workspaces = db.query(func.count(Workspace.id)).scalar() or 0
    total_agents = db.query(func.count(Agent.id)).scalar() or 0
    total_contacts = db.query(func.count(Contact.id)).scalar() or 0
    total_conversations = db.query(func.count(Conversation.id)).scalar() or 0
    total_messages = db.query(func.count(Message.id)).scalar() or 0

    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    messages_today = db.query(func.count(Message.id)).filter(Message.created_at >= today).scalar() or 0
    signups_today = db.query(func.count(User.id)).filter(User.created_at >= today).scalar() or 0

    active_subscriptions = db.query(func.count(Subscription.id)).filter(
        Subscription.status == SubscriptionStatus.ACTIVE
    ).scalar() or 0

    mrr = 0
    for plan_name, limits in PLAN_LIMITS.items():
        count = db.query(func.count(User.id)).filter(
            User.plan == PlanType(plan_name)
        ).scalar() or 0
        mrr += count * limits["price_fcfa"]

    plan_distribution = {}
    for plan in PlanType:
        count = db.query(func.count(User.id)).filter(User.plan == plan).scalar() or 0
        plan_distribution[plan.value] = count

    return {
        "total_users": total_users,
        "active_users": active_users,
        "signups_today": signups_today,
        "total_workspaces": total_workspaces,
        "total_agents": total_agents,
        "total_contacts": total_contacts,
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "messages_today": messages_today,
        "active_subscriptions": active_subscriptions,
        "mrr_fcfa": mrr,
        "mrr_usd": round(mrr / 600, 2),
        "plan_distribution": plan_distribution,
    }


# --- Users ---
@router.get("/users")
async def list_users(
    search: Optional[str] = None,
    plan: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    query = db.query(User)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (User.full_name.ilike(search_filter)) |
            (User.email.ilike(search_filter))
        )

    if plan:
        try:
            query = query.filter(User.plan == PlanType(plan))
        except ValueError:
            pass

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    users_data = []
    for u in users:
        ud = user_to_dict(u)
        ws_count = db.query(func.count(Workspace.id)).filter(Workspace.user_id == u.id).scalar() or 0
        msg_count = 0
        workspaces = db.query(Workspace).filter(Workspace.user_id == u.id).all()
        for ws in workspaces:
            msg_count += ws.monthly_message_count or 0
        ud["workspaces_count"] = ws_count
        ud["messages_used"] = msg_count
        users_data.append(ud)

    return {
        "users": users_data,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
    }


@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: str,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    ud = user_to_dict(user)
    workspaces = db.query(Workspace).filter(Workspace.user_id == user.id).all()
    ud["workspaces"] = [
        {
            "id": ws.id,
            "name": ws.name,
            "whatsapp_connected": bool(ws.whatsapp_access_token),
            "agents_count": db.query(func.count(Agent.id)).filter(Agent.workspace_id == ws.id).scalar() or 0,
            "contacts_count": db.query(func.count(Contact.id)).filter(Contact.workspace_id == ws.id).scalar() or 0,
            "messages_this_month": ws.monthly_message_count or 0,
        }
        for ws in workspaces
    ]

    payments = db.query(PaymentTransaction).filter(PaymentTransaction.user_id == user.id).order_by(
        PaymentTransaction.created_at.desc()
    ).limit(20).all()
    ud["payments"] = [
        {
            "id": p.id,
            "amount": p.amount,
            "currency": p.currency,
            "provider": p.payment_provider.value if p.payment_provider else None,
            "status": p.payment_status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in payments
    ]

    subscriptions = db.query(Subscription).filter(Subscription.user_id == user.id).order_by(
        Subscription.created_at.desc()
    ).limit(5).all()
    ud["subscriptions"] = [
        {
            "id": s.id,
            "plan": s.plan.value,
            "status": s.status.value if s.status else None,
            "price_fcfa": s.price_fcfa,
            "provider": s.payment_provider.value if s.payment_provider else None,
            "period_start": s.current_period_start.isoformat() if s.current_period_start else None,
            "period_end": s.current_period_end.isoformat() if s.current_period_end else None,
        }
        for s in subscriptions
    ]

    return ud


@router.put("/users/{user_id}/suspend")
async def suspend_user(
    user_id: str,
    body: UserSuspendAction,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_superadmin:
        raise HTTPException(status_code=400, detail="Cannot suspend a superadmin")

    user.is_active = not body.suspend
    db.commit()
    action = "suspended" if body.suspend else "reactivated"
    log_audit(db, admin.email, f"user_{action}", "user", user_id, f"{user.email}")
    logger.info(f"Admin {admin.email} {action} user {user.email}")
    return {"message": f"User {action} successfully", "is_active": user.is_active}


@router.put("/users/{user_id}/plan")
async def change_user_plan(
    user_id: str,
    body: UserPlanUpdate,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        new_plan = PlanType(body.plan)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid plan: {body.plan}")

    old_plan = user.plan.value
    user.plan = new_plan

    limits = PLAN_LIMITS.get(new_plan.value, {})
    for ws in db.query(Workspace).filter(Workspace.user_id == user.id).all():
        ws.message_limit = limits.get("messages", 100)

    db.commit()
    log_audit(db, admin.email, "plan_changed", "user", user_id, f"{user.email}: {old_plan} -> {new_plan.value}")
    logger.info(f"Admin {admin.email} changed user {user.email} plan from {old_plan} to {new_plan.value}")
    return {"message": f"Plan changed from {old_plan} to {new_plan.value}", "plan": new_plan.value}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_superadmin:
        raise HTTPException(status_code=400, detail="Cannot delete a superadmin")

    email = user.email
    db.delete(user)
    db.commit()
    log_audit(db, admin.email, "user_deleted", "user", user_id, email)
    logger.info(f"Admin {admin.email} deleted user {email}")
    return {"message": f"User {email} deleted successfully"}


# --- Revenues ---
@router.get("/revenues")
async def get_revenues(
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    transactions = db.query(PaymentTransaction).order_by(
        PaymentTransaction.created_at.desc()
    ).limit(100).all()

    transactions_data = []
    for t in transactions:
        user = db.query(User).filter(User.id == t.user_id).first()
        transactions_data.append({
            "id": t.id,
            "user_email": user.email if user else "N/A",
            "user_name": user.full_name if user else "N/A",
            "amount": t.amount,
            "currency": t.currency,
            "provider": t.payment_provider.value if t.payment_provider else None,
            "status": t.payment_status,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        })

    mrr = 0
    revenue_by_plan = {}
    for plan_name, limits in PLAN_LIMITS.items():
        count = db.query(func.count(User.id)).filter(
            User.plan == PlanType(plan_name)
        ).scalar() or 0
        plan_mrr = count * limits["price_fcfa"]
        mrr += plan_mrr
        revenue_by_plan[plan_name] = {"users": count, "mrr_fcfa": plan_mrr}

    total_revenue = db.query(func.sum(PaymentTransaction.amount)).filter(
        PaymentTransaction.payment_status == "paid"
    ).scalar() or 0

    return {
        "mrr_fcfa": mrr,
        "mrr_usd": round(mrr / 600, 2),
        "total_revenue_fcfa": total_revenue,
        "revenue_by_plan": revenue_by_plan,
        "transactions": transactions_data,
    }


# --- Workspaces ---
@router.get("/workspaces")
async def list_workspaces(
    whatsapp_connected: Optional[bool] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    query = db.query(Workspace)

    if whatsapp_connected is not None:
        if whatsapp_connected:
            query = query.filter(Workspace.whatsapp_access_token.isnot(None))
        else:
            query = query.filter(Workspace.whatsapp_access_token.is_(None))

    total = query.count()
    workspaces = query.order_by(Workspace.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    workspaces_data = []
    for ws in workspaces:
        owner = db.query(User).filter(User.id == ws.user_id).first()
        agents_count = db.query(func.count(Agent.id)).filter(Agent.workspace_id == ws.id).scalar() or 0
        contacts_count = db.query(func.count(Contact.id)).filter(Contact.workspace_id == ws.id).scalar() or 0

        workspaces_data.append({
            "id": ws.id,
            "name": ws.name,
            "owner_email": owner.email if owner else "N/A",
            "owner_name": owner.full_name if owner else "N/A",
            "whatsapp_connected": bool(ws.whatsapp_access_token),
            "agents_count": agents_count,
            "contacts_count": contacts_count,
            "messages_this_month": ws.monthly_message_count or 0,
            "message_limit": ws.message_limit or 0,
            "created_at": ws.created_at.isoformat() if ws.created_at else None,
        })

    return {
        "workspaces": workspaces_data,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
    }


# --- Messages ---
@router.get("/messages")
async def get_messages_stats(
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    total = db.query(func.count(Message.id)).scalar() or 0
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_count = db.query(func.count(Message.id)).filter(Message.created_at >= today).scalar() or 0

    week_ago = today - timedelta(days=7)
    week_count = db.query(func.count(Message.id)).filter(Message.created_at >= week_ago).scalar() or 0

    month_ago = today - timedelta(days=30)
    month_count = db.query(func.count(Message.id)).filter(Message.created_at >= month_ago).scalar() or 0

    daily_stats = []
    for i in range(30):
        day = today - timedelta(days=29 - i)
        next_day = day + timedelta(days=1)
        count = db.query(func.count(Message.id)).filter(
            Message.created_at >= day,
            Message.created_at < next_day
        ).scalar() or 0
        daily_stats.append({"date": day.strftime("%Y-%m-%d"), "count": count})

    return {
        "total": total,
        "today": today_count,
        "this_week": week_count,
        "this_month": month_count,
        "daily_stats": daily_stats,
    }


# --- Recent signups ---
@router.get("/recent-signups")
async def get_recent_signups(
    limit: int = Query(10, ge=1, le=50),
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).limit(limit).all()
    return [user_to_dict(u) for u in users]


# --- Top workspaces ---
@router.get("/top-workspaces")
async def get_top_workspaces(
    limit: int = Query(5, ge=1, le=20),
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    workspaces = db.query(Workspace).order_by(
        Workspace.monthly_message_count.desc().nullslast()
    ).limit(limit).all()

    result = []
    for ws in workspaces:
        owner = db.query(User).filter(User.id == ws.user_id).first()
        result.append({
            "id": ws.id,
            "name": ws.name,
            "owner": owner.full_name if owner else "N/A",
            "messages_this_month": ws.monthly_message_count or 0,
        })
    return result


# --- Payment Config Schemas ---
class PaymentConfigUpdate(BaseModel):
    stripe_public_key: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None
    stripe_enabled: Optional[bool] = None
    cinetpay_api_key: Optional[str] = None
    cinetpay_site_id: Optional[str] = None
    cinetpay_enabled: Optional[bool] = None
    flutterwave_public_key: Optional[str] = None
    flutterwave_secret_key: Optional[str] = None
    flutterwave_encryption_key: Optional[str] = None
    flutterwave_enabled: Optional[bool] = None
    bank_name: Optional[str] = None
    bank_account_holder: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_iban: Optional[str] = None
    bank_swift: Optional[str] = None
    bank_instructions: Optional[str] = None
    bank_enabled: Optional[bool] = None


def _mask_key(value: str) -> str:
    if not value or len(value) < 8:
        return value
    return value[:4] + "*" * (len(value) - 8) + value[-4:]


def _get_or_create_config(db: Session) -> PaymentConfig:
    config = db.query(PaymentConfig).first()
    if not config:
        config = PaymentConfig()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


@router.get("/payment-config")
async def get_payment_config(
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    config = _get_or_create_config(db)
    return {
        "stripe_public_key": config.stripe_public_key or "",
        "stripe_secret_key": _mask_key(config.stripe_secret_key or ""),
        "stripe_webhook_secret": _mask_key(config.stripe_webhook_secret or ""),
        "stripe_enabled": config.stripe_enabled,
        "cinetpay_api_key": _mask_key(config.cinetpay_api_key or ""),
        "cinetpay_site_id": config.cinetpay_site_id or "",
        "cinetpay_enabled": config.cinetpay_enabled,
        "flutterwave_public_key": _mask_key(config.flutterwave_public_key or ""),
        "flutterwave_secret_key": _mask_key(config.flutterwave_secret_key or ""),
        "flutterwave_encryption_key": _mask_key(config.flutterwave_encryption_key or ""),
        "flutterwave_enabled": config.flutterwave_enabled,
        "bank_name": config.bank_name or "",
        "bank_account_holder": config.bank_account_holder or "",
        "bank_account_number": _mask_key(config.bank_account_number or ""),
        "bank_iban": _mask_key(config.bank_iban or ""),
        "bank_swift": config.bank_swift or "",
        "bank_instructions": config.bank_instructions or "",
        "bank_enabled": config.bank_enabled,
    }


@router.put("/payment-config")
async def update_payment_config(
    body: PaymentConfigUpdate,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    config = _get_or_create_config(db)
    updated_fields = []

    for field, value in body.model_dump(exclude_none=True).items():
        # Skip masked values (user didn't change them)
        if isinstance(value, str) and "*" in value:
            continue
        setattr(config, field, value)
        updated_fields.append(field)

    # Hot-reload payment service env vars if keys changed
    import os
    if body.stripe_secret_key and "*" not in body.stripe_secret_key:
        os.environ["STRIPE_API_KEY"] = body.stripe_secret_key
    if body.stripe_webhook_secret and "*" not in body.stripe_webhook_secret:
        os.environ["STRIPE_WEBHOOK_SECRET"] = body.stripe_webhook_secret
    if body.cinetpay_api_key and "*" not in body.cinetpay_api_key:
        os.environ["CINETPAY_API_KEY"] = body.cinetpay_api_key
    if body.cinetpay_site_id:
        os.environ["CINETPAY_SITE_ID"] = body.cinetpay_site_id
    if body.flutterwave_public_key and "*" not in body.flutterwave_public_key:
        os.environ["FLUTTERWAVE_PUBLIC_KEY"] = body.flutterwave_public_key
    if body.flutterwave_secret_key and "*" not in body.flutterwave_secret_key:
        os.environ["FLUTTERWAVE_SECRET_KEY"] = body.flutterwave_secret_key
    if body.flutterwave_encryption_key and "*" not in body.flutterwave_encryption_key:
        os.environ["FLUTTERWAVE_ENCRYPTION_KEY"] = body.flutterwave_encryption_key

    db.commit()
    log_audit(db, admin.email, "payment_config_updated", "payment_config", config.id, f"Updated: {', '.join(updated_fields)}")
    logger.info(f"Admin {admin.email} updated payment config: {updated_fields}")
    return {"message": "Payment config updated", "updated_fields": updated_fields}


# --- Demo Stats ---
@router.get("/demo-stats")
async def get_demo_stats(
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    total_sessions = db.query(func.count(DemoSession.id)).scalar() or 0
    total_messages = db.query(func.sum(DemoSession.messages_count)).scalar() or 0

    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    sessions_today = db.query(func.count(DemoSession.id)).filter(
        DemoSession.created_at >= today
    ).scalar() or 0

    week_ago = today - timedelta(days=7)
    sessions_this_week = db.query(func.count(DemoSession.id)).filter(
        DemoSession.created_at >= week_ago
    ).scalar() or 0

    # Daily stats for the last 14 days
    daily_stats = []
    for i in range(14):
        day = today - timedelta(days=13 - i)
        next_day = day + timedelta(days=1)
        count = db.query(func.count(DemoSession.id)).filter(
            DemoSession.created_at >= day,
            DemoSession.created_at < next_day
        ).scalar() or 0
        daily_stats.append({"date": day.strftime("%Y-%m-%d"), "demos": count})

    # Average messages per session
    avg_messages = round(total_messages / total_sessions, 1) if total_sessions > 0 else 0

    # Recent demo sessions
    recent = db.query(DemoSession).order_by(DemoSession.created_at.desc()).limit(10).all()
    recent_sessions = [
        {
            "session_id": s.session_id[:8] + "...",
            "first_message": s.first_message or "",
            "messages_count": s.messages_count,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in recent
    ]

    return {
        "total_sessions": total_sessions,
        "total_messages": int(total_messages),
        "sessions_today": sessions_today,
        "sessions_this_week": sessions_this_week,
        "avg_messages_per_session": avg_messages,
        "daily_stats": daily_stats,
        "recent_sessions": recent_sessions,
    }


# --- Advanced Analytics ---
@router.get("/analytics/advanced")
async def get_advanced_analytics(
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    # Signup trend (30 days)
    signup_trend = []
    for i in range(30):
        day = today - timedelta(days=29 - i)
        next_day = day + timedelta(days=1)
        count = db.query(func.count(User.id)).filter(User.created_at >= day, User.created_at < next_day).scalar() or 0
        signup_trend.append({"date": day.strftime("%Y-%m-%d"), "signups": count})

    # Retention: users who logged in this week vs total
    total_users = db.query(func.count(User.id)).scalar() or 0
    week_ago = today - timedelta(days=7)
    active_this_week = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    retention_rate = round((active_this_week / total_users) * 100, 1) if total_users > 0 else 0

    # Plan conversion funnel
    free_count = db.query(func.count(User.id)).filter(User.plan == PlanType.FREE).scalar() or 0
    starter_count = db.query(func.count(User.id)).filter(User.plan == PlanType.STARTER).scalar() or 0
    pro_count = db.query(func.count(User.id)).filter(User.plan == PlanType.PRO).scalar() or 0
    business_count = db.query(func.count(User.id)).filter(User.plan == PlanType.BUSINESS).scalar() or 0
    paid_users = starter_count + pro_count + business_count
    conversion_rate = round((paid_users / total_users) * 100, 1) if total_users > 0 else 0
    conversion_funnel = [
        {"stage": "Free", "count": free_count},
        {"stage": "Starter", "count": starter_count},
        {"stage": "Pro", "count": pro_count},
        {"stage": "Business", "count": business_count},
    ]

    # Top agents by messages
    top_agents = []
    agents_data = db.query(
        Agent.name, Agent.module,
        func.count(Message.id).label("msg_count")
    ).outerjoin(Conversation, Conversation.agent_id == Agent.id
    ).outerjoin(Message, Message.conversation_id == Conversation.id
    ).group_by(Agent.id, Agent.name, Agent.module
    ).order_by(func.count(Message.id).desc()).limit(10).all()
    for a in agents_data:
        top_agents.append({"name": a.name, "module": a.module.value if a.module else "sell", "messages": a.msg_count or 0})

    # Activity heatmap (by hour of day, last 30 days)
    heatmap = [0] * 24
    msgs_by_hour = db.query(
        extract('hour', Message.created_at).label('hour'),
        func.count(Message.id)
    ).filter(Message.created_at >= today - timedelta(days=30)
    ).group_by('hour').all()
    for hour, count in msgs_by_hour:
        if hour is not None:
            heatmap[int(hour)] = count

    # Country distribution
    country_dist = db.query(
        User.country, func.count(User.id).label("count")
    ).group_by(User.country).order_by(func.count(User.id).desc()).limit(10).all()
    countries = [{"country": c or "Unknown", "count": cnt} for c, cnt in country_dist]

    return {
        "signup_trend": signup_trend,
        "retention_rate": retention_rate,
        "conversion_rate": conversion_rate,
        "conversion_funnel": conversion_funnel,
        "top_agents": top_agents,
        "activity_heatmap": heatmap,
        "countries": countries,
        "total_users": total_users,
        "paid_users": paid_users,
    }


# --- Audit Log ---
@router.get("/audit-logs")
async def get_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, le=200),
    action_filter: Optional[str] = None,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if action_filter:
        query = query.filter(AuditLog.action.ilike(f"%{action_filter}%"))

    total = query.count()
    logs = query.order_by(AuditLog.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "logs": [
            {
                "id": log.id,
                "admin_email": log.admin_email,
                "action": log.action,
                "target_type": log.target_type,
                "target_id": log.target_id,
                "details": log.details,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            }
            for log in logs
        ],
    }


# --- PDF Export ---
@router.get("/export/users-pdf")
async def export_users_pdf(
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet

    users = db.query(User).order_by(User.created_at.desc()).limit(500).all()
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("WAZA - Rapport Utilisateurs", styles['Title']))
    elements.append(Paragraph(f"Généré le {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M UTC')}", styles['Normal']))
    elements.append(Spacer(1, 20))

    data = [["Email", "Nom", "Plan", "Actif", "Vérifié", "Inscrit le"]]
    for u in users:
        data.append([
            u.email[:30],
            (u.full_name or "")[:20],
            u.plan.value if u.plan else "free",
            "Oui" if u.is_active else "Non",
            "Oui" if u.is_verified else "Non",
            u.created_at.strftime("%d/%m/%Y") if u.created_at else "",
        ])

    table = Table(data, colWidths=[140, 100, 60, 40, 50, 70])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1A1A2E')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(table)
    doc.build(elements)
    buffer.seek(0)

    log_audit(db, admin.email, "export_users_pdf", "report", None, f"{len(users)} users exported")
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=waza_users_report.pdf"})


@router.get("/export/revenues-pdf")
async def export_revenues_pdf(
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet

    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    # Gather plan distribution + MRR
    plan_counts = {}
    for plan in PlanType:
        cnt = db.query(func.count(User.id)).filter(User.plan == plan).scalar() or 0
        plan_counts[plan.value] = cnt

    plan_prices = {"free": 0, "starter": 19900, "pro": 49900, "business": 99000}
    mrr = sum(plan_counts.get(p, 0) * price for p, price in plan_prices.items())

    # Recent transactions
    txns = db.query(PaymentTransaction).order_by(PaymentTransaction.created_at.desc()).limit(100).all()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("WAZA - Rapport Revenus", styles['Title']))
    elements.append(Paragraph(f"Généré le {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M UTC')}", styles['Normal']))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"MRR actuel: {mrr:,.0f} FCFA", styles['Heading2']))
    elements.append(Spacer(1, 10))

    # Plan distribution table
    plan_data = [["Plan", "Utilisateurs", "Prix/mois", "Revenu"]]
    for plan_name, count in plan_counts.items():
        price = plan_prices.get(plan_name, 0)
        plan_data.append([plan_name.capitalize(), str(count), f"{price:,.0f} FCFA", f"{count * price:,.0f} FCFA"])
    plan_data.append(["Total", str(sum(plan_counts.values())), "", f"{mrr:,.0f} FCFA"])

    t1 = Table(plan_data, colWidths=[80, 80, 100, 120])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1A1A2E')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#F5F5F5')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t1)
    elements.append(Spacer(1, 20))

    if txns:
        elements.append(Paragraph("Dernières transactions", styles['Heading3']))
        elements.append(Spacer(1, 8))
        txn_data = [["Date", "Utilisateur", "Montant", "Statut"]]
        for tx in txns[:50]:
            user = db.query(User).filter(User.id == tx.user_id).first()
            txn_data.append([
                tx.created_at.strftime("%d/%m/%Y") if tx.created_at else "",
                (user.email if user else "")[:25],
                f"{tx.amount:,.0f} FCFA" if tx.amount else "0 FCFA",
                tx.status or "N/A",
            ])
        t2 = Table(txn_data, colWidths=[80, 150, 100, 80])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1A1A2E')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(t2)

    doc.build(elements)
    buffer.seek(0)

    log_audit(db, admin.email, "export_revenues_pdf", "report", None, f"MRR: {mrr} FCFA")
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=waza_revenues_report.pdf"})
