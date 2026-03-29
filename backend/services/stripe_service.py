import logging
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest, CheckoutSessionResponse, CheckoutStatusResponse
from config import settings
from typing import Dict
import os

logger = logging.getLogger(__name__)

class StripeService:
    """Stripe payment service using emergentintegrations"""
    
    def __init__(self):
        self.api_key = settings.STRIPE_API_KEY or os.getenv("STRIPE_API_KEY")
        if not self.api_key:
            logger.warning("STRIPE_API_KEY not found. Stripe payments will fail.")
        logger.info("StripeService initialized")
    
    def get_checkout_instance(self, base_url: str) -> StripeCheckout:
        """Create a StripeCheckout instance with webhook URL"""
        webhook_url = f"{base_url}/api/billing/webhook/stripe"
        return StripeCheckout(api_key=self.api_key, webhook_url=webhook_url)
    
    async def create_subscription_checkout(
        self,
        amount: float,
        currency: str,
        success_url: str,
        cancel_url: str,
        metadata: Dict[str, str],
        base_url: str
    ) -> CheckoutSessionResponse:
        """Create a Stripe checkout session for subscription"""
        try:
            stripe_checkout = self.get_checkout_instance(base_url)
            
            checkout_request = CheckoutSessionRequest(
                amount=amount,
                currency=currency,
                success_url=success_url,
                cancel_url=cancel_url,
                metadata=metadata
            )
            
            session = await stripe_checkout.create_checkout_session(checkout_request)
            logger.info(f"Stripe checkout session created: {session.session_id}")
            return session
            
        except Exception as e:
            logger.error(f"Error creating Stripe checkout: {e}")
            raise Exception(f"Failed to create Stripe checkout: {str(e)}")
    
    async def get_session_status(self, session_id: str, base_url: str) -> CheckoutStatusResponse:
        """Get Stripe checkout session status"""
        try:
            stripe_checkout = self.get_checkout_instance(base_url)
            status = await stripe_checkout.get_checkout_status(session_id)
            logger.info(f"Stripe session status retrieved: {session_id} - {status.payment_status}")
            return status
        except Exception as e:
            logger.error(f"Error getting Stripe session status: {e}")
            raise Exception(f"Failed to get session status: {str(e)}")
    
    async def handle_webhook(self, payload: bytes, signature: str, base_url: str):
        """Handle Stripe webhook"""
        try:
            stripe_checkout = self.get_checkout_instance(base_url)
            event = await stripe_checkout.handle_webhook(payload, signature)
            logger.info(f"Stripe webhook handled: {event.event_type}")
            return event
        except Exception as e:
            logger.error(f"Error handling Stripe webhook: {e}")
            raise Exception(f"Failed to handle webhook: {str(e)}")

# Global instance
stripe_service = StripeService()
