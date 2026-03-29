from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database import get_db
from models import Subscription, User, PaymentTransaction, PaymentProvider, SubscriptionStatus, PlanType
from schemas.subscription import SubscriptionCreate, SubscriptionResponse, PlanInfo
from services.stripe_service import stripe_service
from services.cinetpay import cinetpay_service
from utils.dependencies import get_current_active_user
from config import PLAN_LIMITS
from datetime import datetime, timedelta, timezone
from typing import List
import logging
import json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/billing", tags=["Billing"])

@router.get("/plans", response_model=List[PlanInfo])
async def get_plans():
    """Get available subscription plans"""
    plans = []
    
    plan_features = {
        "free": ["100 messages/mois", "1 agent", "1 workspace", "Support communautaire"],
        "starter": ["1,500 messages/mois", "1 agent", "1 workspace", "Support email"],
        "pro": ["8,000 messages/mois", "5 agents", "3 workspaces", "Support prioritaire", "Analytics avanc\u00e9s"],
        "business": ["Messages illimit\u00e9s", "Agents illimit\u00e9s", "Workspaces illimit\u00e9s", "Support d\u00e9di\u00e9", "White-label", "API access"]
    }
    
    for plan_name, limits in PLAN_LIMITS.items():
        plans.append(PlanInfo(
            name=plan_name,
            price_fcfa=limits["price_fcfa"],
            messages=limits["messages"],
            agents=limits["agents"],
            workspaces=limits["workspaces"],
            features=plan_features.get(plan_name, [])
        ))
    
    return plans

@router.post("/subscribe")
async def create_subscription(
    subscription_data: SubscriptionCreate,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new subscription (initiate payment)"""
    
    # Get plan info
    plan_limits = PLAN_LIMITS.get(subscription_data.plan.value)
    if not plan_limits:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan"
        )
    
    price_fcfa = plan_limits["price_fcfa"]
    
    if price_fcfa == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Free plan doesn't require payment"
        )
    
    # Get base URL from request
    base_url = str(request.base_url).rstrip('/')
    origin = request.headers.get("origin") or base_url
    
    if subscription_data.payment_provider == PaymentProvider.STRIPE:
        try:
            # Convert FCFA to USD (approximate: 1 USD = 600 FCFA)
            amount_usd = round(price_fcfa / 600, 2)
            
            success_url = f"{origin}/billing/success?session_id={{{{CHECKOUT_SESSION_ID}}}}"
            cancel_url = f"{origin}/billing/cancel"
            
            metadata = {
                "user_id": current_user.id,
                "plan": subscription_data.plan.value,
                "price_fcfa": str(price_fcfa)
            }
            
            # Create Stripe checkout session
            session = await stripe_service.create_subscription_checkout(
                amount=amount_usd,
                currency="usd",
                success_url=success_url,
                cancel_url=cancel_url,
                metadata=metadata,
                base_url=base_url
            )
            
            # Create payment transaction record
            transaction = PaymentTransaction(
                user_id=current_user.id,
                session_id=session.session_id,
                amount=price_fcfa,
                currency="XOF",
                payment_provider=PaymentProvider.STRIPE,
                payment_status="pending",
                payment_metadata=json.dumps(metadata)
            )
            db.add(transaction)
            db.commit()
            
            logger.info(f"Stripe checkout created for user {current_user.id}: {session.session_id}")
            
            return {
                "checkout_url": session.url,
                "session_id": session.session_id,
                "provider": "stripe"
            }
            
        except Exception as e:
            logger.error(f"Error creating Stripe checkout: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Payment initialization failed: {str(e)}"
            )
    
    elif subscription_data.payment_provider == PaymentProvider.CINETPAY:
        try:
            import uuid
            transaction_id = str(uuid.uuid4())
            
            payment = await cinetpay_service.create_payment(
                amount=price_fcfa,
                currency="XOF",
                transaction_id=transaction_id,
                customer_email=current_user.email,
                customer_name=current_user.full_name,
                description=f"Abonnement WAZA - {subscription_data.plan.value}"
            )
            
            # Create payment transaction record
            transaction = PaymentTransaction(
                user_id=current_user.id,
                session_id=transaction_id,
                amount=price_fcfa,
                currency="XOF",
                payment_provider=PaymentProvider.CINETPAY,
                payment_status="pending",
                payment_metadata=json.dumps({"plan": subscription_data.plan.value})
            )
            db.add(transaction)
            db.commit()
            
            logger.info(f"CinetPay payment created for user {current_user.id}: {transaction_id}")
            
            return {
                "checkout_url": payment["data"]["payment_url"],
                "transaction_id": transaction_id,
                "provider": "cinetpay"
            }
            
        except Exception as e:
            logger.error(f"Error creating CinetPay payment: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Payment initialization failed: {str(e)}"
            )

@router.get("/subscription", response_model=SubscriptionResponse)
async def get_current_subscription(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user subscription"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    return subscription

@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cancel current subscription"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    subscription.status = SubscriptionStatus.CANCELLED
    db.commit()
    
    # Downgrade user to free plan
    user = current_user
    user.plan = PlanType.FREE
    db.commit()
    
    logger.info(f"Subscription cancelled for user {current_user.id}")
    
    return {"message": "Subscription cancelled successfully"}

@router.get("/checkout/status/{session_id}")
async def check_checkout_status(
    session_id: str,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Check payment checkout status"""
    # Find transaction
    transaction = db.query(PaymentTransaction).filter(
        PaymentTransaction.session_id == session_id,
        PaymentTransaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # If already paid, return success
    if transaction.payment_status == "paid":
        return {
            "status": "paid",
            "payment_status": "paid",
            "message": "Payment already processed"
        }
    
    base_url = str(request.base_url).rstrip('/')
    
    try:
        if transaction.payment_provider == PaymentProvider.STRIPE:
            # Check Stripe session status
            status_response = await stripe_service.get_session_status(session_id, base_url)
            
            # Update transaction
            transaction.payment_status = status_response.payment_status
            
            if status_response.payment_status == "paid":
                # Activate subscription
                metadata = json.loads(transaction.payment_metadata)
                plan = metadata.get("plan", "starter")
                
                # Create subscription
                subscription = Subscription(
                    user_id=current_user.id,
                    plan=PlanType(plan),
                    status=SubscriptionStatus.ACTIVE,
                    price_fcfa=transaction.amount,
                    payment_provider=PaymentProvider.STRIPE,
                    stripe_subscription_id=session_id,
                    current_period_start=datetime.now(timezone.utc),
                    current_period_end=datetime.now(timezone.utc) + timedelta(days=30)
                )
                db.add(subscription)
                
                # Update user plan
                current_user.plan = PlanType(plan)
                
                db.commit()
                
                logger.info(f"Subscription activated for user {current_user.id}: {plan}")
            
            db.commit()
            
            return {
                "status": status_response.status,
                "payment_status": status_response.payment_status,
                "amount_total": status_response.amount_total,
                "currency": status_response.currency
            }
        
        elif transaction.payment_provider == PaymentProvider.CINETPAY:
            # Check CinetPay status (mock)
            status_response = await cinetpay_service.check_payment_status(session_id)
            
            if status_response["code"] == "00":
                transaction.payment_status = "paid"
                
                # Activate subscription
                metadata = json.loads(transaction.payment_metadata)
                plan = metadata.get("plan", "starter")
                
                subscription = Subscription(
                    user_id=current_user.id,
                    plan=PlanType(plan),
                    status=SubscriptionStatus.ACTIVE,
                    price_fcfa=transaction.amount,
                    payment_provider=PaymentProvider.CINETPAY,
                    cinetpay_transaction_id=session_id,
                    current_period_start=datetime.now(timezone.utc),
                    current_period_end=datetime.now(timezone.utc) + timedelta(days=30)
                )
                db.add(subscription)
                
                current_user.plan = PlanType(plan)
                
                db.commit()
                
                logger.info(f"CinetPay subscription activated for user {current_user.id}: {plan}")
            
            return {
                "status": "complete" if status_response["code"] == "00" else "pending",
                "payment_status": "paid" if status_response["code"] == "00" else "pending",
                "provider": "cinetpay"
            }
    
    except Exception as e:
        logger.error(f"Error checking payment status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check payment status: {str(e)}"
        )

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events"""
    try:
        payload = await request.body()
        signature = request.headers.get("Stripe-Signature")
        base_url = str(request.base_url).rstrip('/')
        
        event = await stripe_service.handle_webhook(payload, signature, base_url)
        
        logger.info(f"Stripe webhook received: {event.event_type}")
        
        # Handle different event types
        if event.event_type == "checkout.session.completed":
            # Payment successful
            session_id = event.session_id
            
            transaction = db.query(PaymentTransaction).filter(
                PaymentTransaction.session_id == session_id
            ).first()
            
            if transaction and transaction.payment_status != "paid":
                transaction.payment_status = "paid"
                db.commit()
                logger.info(f"Payment confirmed via webhook: {session_id}")
        
        return {"status": "success"}
    
    except Exception as e:
        logger.error(f"Stripe webhook error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/webhook/cinetpay")
async def cinetpay_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle CinetPay webhook events"""
    try:
        payload = await request.json()
        logger.info(f"CinetPay webhook received: {payload}")
        
        # Verify signature (mocked)
        # In production: cinetpay_service.verify_webhook_signature(payload, signature)
        
        transaction_id = payload.get("cpm_trans_id")
        status_code = payload.get("cpm_result")
        
        if status_code == "00":  # Payment successful
            transaction = db.query(PaymentTransaction).filter(
                PaymentTransaction.session_id == transaction_id
            ).first()
            
            if transaction and transaction.payment_status != "paid":
                transaction.payment_status = "paid"
                db.commit()
                logger.info(f"CinetPay payment confirmed: {transaction_id}")
        
        return {"status": "success"}
    
    except Exception as e:
        logger.error(f"CinetPay webhook error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
