import logging
from typing import Optional, Dict
import json

logger = logging.getLogger(__name__)

class WhatsAppService:
    """Mock WhatsApp Business Cloud API Service"""
    
    def __init__(self, access_token: Optional[str] = None, phone_number_id: Optional[str] = None):
        self.access_token = access_token or "mock_access_token"
        self.phone_number_id = phone_number_id or "mock_phone_number_id"
        self.base_url = "https://graph.facebook.com/v18.0"
        logger.info(f"WhatsAppService initialized (MOCK MODE) with phone_number_id: {self.phone_number_id}")
    
    async def send_message(self, to: str, message: str) -> Dict:
        """Send a WhatsApp message (MOCKED)"""
        logger.info(f"[MOCK] Sending WhatsApp message to {to}: {message[:50]}...")
        
        # Mock response from WhatsApp API
        mock_response = {
            "messaging_product": "whatsapp",
            "contacts": [{"input": to, "wa_id": to}],
            "messages": [{"id": f"wamid.mock_{to}_{hash(message)}"}]
        }
        
        logger.info(f"[MOCK] WhatsApp message sent successfully: {mock_response['messages'][0]['id']}")
        return mock_response
    
    async def send_template_message(self, to: str, template_name: str, language_code: str = "fr", components: list = None) -> Dict:
        """Send a WhatsApp template message (MOCKED)"""
        logger.info(f"[MOCK] Sending WhatsApp template '{template_name}' to {to}")
        
        mock_response = {
            "messaging_product": "whatsapp",
            "contacts": [{"input": to, "wa_id": to}],
            "messages": [{"id": f"wamid.mock_template_{to}_{template_name}"}]
        }
        
        return mock_response
    
    def verify_webhook(self, mode: str, token: str, challenge: str, verify_token: str) -> Optional[str]:
        """Verify WhatsApp webhook"""
        if mode == "subscribe" and token == verify_token:
            logger.info("[MOCK] Webhook verified successfully")
            return challenge
        logger.warning("[MOCK] Webhook verification failed")
        return None
    
    def parse_webhook_message(self, webhook_data: dict) -> Optional[Dict]:
        """Parse incoming WhatsApp webhook message"""
        try:
            entry = webhook_data.get("entry", [])[0]
            changes = entry.get("changes", [])[0]
            value = changes.get("value", {})
            messages = value.get("messages", [])
            
            if not messages:
                return None
            
            message = messages[0]
            return {
                "from": message.get("from"),
                "message_id": message.get("id"),
                "timestamp": message.get("timestamp"),
                "text": message.get("text", {}).get("body", ""),
                "type": message.get("type")
            }
        except (IndexError, KeyError) as e:
            logger.error(f"Error parsing webhook message: {e}")
            return None

# Global instance
whatsapp_service = WhatsAppService()
