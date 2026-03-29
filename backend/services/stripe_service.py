import logging
from config import settings
from typing import Dict
import os

logger = logging.getLogger(__name__)

# Try emergentintegrations first (Emergent preview env), fallback to standard stripe SDK
_use_emergent = False
try:
    from emergentintegrations.payments.stripe.checkout import (
        StripeCheckout,
        CheckoutSessionRequest,
        CheckoutSessionResponse,
        CheckoutStatusResponse,
    )
    _use_emergent = True
    logger.info("Using emergentintegrations for Stripe")
except ImportError:
    import stripe
    logger.info("Using standard stripe SDK")


class _CheckoutResult:
    """Lightweight result object matching emergent's CheckoutSessionResponse shape."""
    def __init__(self, session_id: str, url: str):
        self.session_id = session_id
        self.url = url


class _StatusResult:
    """Lightweight result object matching emergent's CheckoutStatusResponse shape."""
    def __init__(self, status: str, payment_status: str, amount_total: int = 0, currency: str = "usd"):
        self.status = status
        self.payment_status = payment_status
        self.amount_total = amount_total
        self.currency = currency


class _WebhookEvent:
    """Lightweight result object for webhook events."""
    def __init__(self, event_type: str, session_id: str = ""):
        self.event_type = event_type
        self.session_id = session_id


class StripeService:
    """Stripe payment service"""

    def __init__(self):
        self.api_key = settings.STRIPE_API_KEY or os.getenv("STRIPE_API_KEY") or os.getenv("STRIPE_SECRET_KEY") or ""
        if not self.api_key:
            logger.warning("STRIPE_API_KEY not found. Stripe payments will fail.")
        if not _use_emergent:
            stripe.api_key = self.api_key
        logger.info("StripeService initialized")

    # ---- emergent helpers ----
    def _get_checkout_instance(self, base_url: str):
        webhook_url = f"{base_url}/api/billing/webhook/stripe"
        return StripeCheckout(api_key=self.api_key, webhook_url=webhook_url)

    # ---- public API ----
    async def create_subscription_checkout(
        self,
        amount: float,
        currency: str,
        success_url: str,
        cancel_url: str,
        metadata: Dict[str, str],
        base_url: str,
    ):
        try:
            if _use_emergent:
                sc = self._get_checkout_instance(base_url)
                req = CheckoutSessionRequest(
                    amount=amount, currency=currency,
                    success_url=success_url, cancel_url=cancel_url,
                    metadata=metadata,
                )
                session = await sc.create_checkout_session(req)
                logger.info(f"Stripe checkout created (emergent): {session.session_id}")
                return session
            else:
                # Standard stripe SDK
                amount_cents = int(amount * 100)
                session = stripe.checkout.Session.create(
                    payment_method_types=["card"],
                    line_items=[{
                        "price_data": {
                            "currency": currency,
                            "product_data": {"name": f"WAZA - {metadata.get('plan', 'subscription')}"},
                            "unit_amount": amount_cents,
                        },
                        "quantity": 1,
                    }],
                    mode="payment",
                    success_url=success_url,
                    cancel_url=cancel_url,
                    metadata=metadata,
                )
                logger.info(f"Stripe checkout created (sdk): {session.id}")
                return _CheckoutResult(session_id=session.id, url=session.url)
        except Exception as e:
            logger.error(f"Error creating Stripe checkout: {e}")
            raise Exception(f"Failed to create Stripe checkout: {str(e)}")

    async def get_session_status(self, session_id: str, base_url: str):
        try:
            if _use_emergent:
                sc = self._get_checkout_instance(base_url)
                status = await sc.get_checkout_status(session_id)
                logger.info(f"Stripe status retrieved (emergent): {session_id}")
                return status
            else:
                session = stripe.checkout.Session.retrieve(session_id)
                payment_status = "paid" if session.payment_status == "paid" else "unpaid"
                logger.info(f"Stripe status retrieved (sdk): {session_id} - {payment_status}")
                return _StatusResult(
                    status=session.status or "unknown",
                    payment_status=payment_status,
                    amount_total=session.amount_total or 0,
                    currency=session.currency or "usd",
                )
        except Exception as e:
            logger.error(f"Error getting Stripe session status: {e}")
            raise Exception(f"Failed to get session status: {str(e)}")

    async def handle_webhook(self, payload: bytes, signature: str, base_url: str):
        try:
            if _use_emergent:
                sc = self._get_checkout_instance(base_url)
                event = await sc.handle_webhook(payload, signature)
                logger.info(f"Stripe webhook handled (emergent): {event.event_type}")
                return event
            else:
                webhook_secret = settings.STRIPE_WEBHOOK_SECRET or os.getenv("STRIPE_WEBHOOK_SECRET") or ""
                if webhook_secret:
                    event = stripe.Webhook.construct_event(payload, signature, webhook_secret)
                else:
                    import json
                    event = json.loads(payload)
                event_type = event.get("type", event.type if hasattr(event, "type") else "unknown")
                session_id = ""
                if hasattr(event, "data"):
                    session_id = event.data.object.get("id", "") if hasattr(event.data.object, "get") else getattr(event.data.object, "id", "")
                logger.info(f"Stripe webhook handled (sdk): {event_type}")
                return _WebhookEvent(event_type=event_type, session_id=session_id)
        except Exception as e:
            logger.error(f"Error handling Stripe webhook: {e}")
            raise Exception(f"Failed to handle webhook: {str(e)}")


# Global instance
stripe_service = StripeService()
