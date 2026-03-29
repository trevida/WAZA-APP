import logging
from typing import Dict
import json

logger = logging.getLogger(__name__)

class CinetPayService:
    """Mock CinetPay payment service for African payments"""
    
    def __init__(self, api_key: str = None, site_id: str = None):
        self.api_key = api_key or "placeholder_cinetpay_api_key"
        self.site_id = site_id or "placeholder_cinetpay_site_id"
        self.base_url = "https://api-checkout.cinetpay.com/v2"
        logger.info(f"CinetPayService initialized (MOCK MODE) with site_id: {self.site_id}")
    
    async def create_payment(self, amount: int, currency: str, transaction_id: str, customer_email: str, customer_name: str, description: str) -> Dict:
        """Create a CinetPay payment (MOCKED)"""
        logger.info(f"[MOCK] Creating CinetPay payment: {amount} {currency} for {customer_email}")
        
        # Mock response
        mock_response = {
            "code": "201",
            "message": "CREATED",
            "data": {
                "payment_url": f"https://checkout.cinetpay.com/mock/{transaction_id}",
                "payment_token": f"mock_token_{transaction_id}",
                "transaction_id": transaction_id
            }
        }
        
        logger.info(f"[MOCK] CinetPay payment created: {transaction_id}")
        return mock_response
    
    async def check_payment_status(self, transaction_id: str) -> Dict:
        """Check CinetPay payment status (MOCKED)"""
        logger.info(f"[MOCK] Checking CinetPay payment status: {transaction_id}")
        
        # Mock response - always returns success for testing
        mock_response = {
            "code": "00",
            "message": "SUCCESSFUL",
            "data": {
                "transaction_id": transaction_id,
                "status": "ACCEPTED",
                "payment_method": "MOBILE_MONEY",
                "amount": 19900,
                "currency": "XOF"
            }
        }
        
        return mock_response
    
    def verify_webhook_signature(self, payload: dict, signature: str) -> bool:
        """Verify CinetPay webhook signature (MOCKED)"""
        logger.info("[MOCK] Verifying CinetPay webhook signature")
        # In production, verify the signature using HMAC
        return True

# Global instance
cinetpay_service = CinetPayService()
