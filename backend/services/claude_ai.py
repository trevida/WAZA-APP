import logging
from typing import List, Dict
from config import settings
import os

logger = logging.getLogger(__name__)

# Try emergentintegrations first (Emergent preview env), fallback to standard anthropic SDK
_use_emergent = False
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    _use_emergent = True
    logger.info("Using emergentintegrations for Claude AI")
except ImportError:
    import anthropic
    logger.info("Using standard anthropic SDK for Claude AI")


class ClaudeAIService:
    """Service for Claude AI integration"""

    def __init__(self):
        if _use_emergent:
            self.api_key = settings.EMERGENT_LLM_KEY or os.getenv("EMERGENT_LLM_KEY")
            if not self.api_key:
                logger.warning("EMERGENT_LLM_KEY not found. AI responses will fail.")
        else:
            self.api_key = os.getenv("ANTHROPIC_API_KEY") or settings.EMERGENT_LLM_KEY or ""
            if not self.api_key:
                logger.warning("ANTHROPIC_API_KEY not found. AI responses will fail.")
            self.client = anthropic.Anthropic(api_key=self.api_key)
        logger.info("ClaudeAIService initialized")

    async def generate_response(
        self,
        system_prompt: str,
        conversation_history: List[Dict[str, str]],
        user_message: str,
        session_id: str,
    ) -> str:
        """Generate AI response using Claude Sonnet 4.5"""
        try:
            if _use_emergent:
                return await self._generate_emergent(system_prompt, user_message, session_id)
            else:
                return await self._generate_anthropic(system_prompt, conversation_history, user_message)
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            raise Exception(f"Failed to generate AI response: {str(e)}")

    async def _generate_emergent(self, system_prompt: str, user_message: str, session_id: str) -> str:
        chat = LlmChat(api_key=self.api_key, session_id=session_id, system_message=system_prompt)
        chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
        user_msg = UserMessage(text=user_message)
        response = await chat.send_message(user_msg)
        logger.info(f"AI response generated (emergent) for session {session_id}")
        return response

    async def _generate_anthropic(self, system_prompt: str, conversation_history: List[Dict[str, str]], user_message: str) -> str:
        messages = []
        for msg in conversation_history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": user_message})

        message = self.client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=1024,
            system=system_prompt,
            messages=messages,
        )
        response_text = message.content[0].text
        logger.info("AI response generated (anthropic SDK)")
        return response_text

    def get_default_system_prompt(self, module: str, language: str = "both") -> str:
        """Get default system prompt for a module"""
        prompts = {
            "sell": {
                "fr": "Tu es un assistant commercial professionnel pour une entreprise africaine. Ton r\u00f4le est de qualifier les prospects, r\u00e9pondre aux questions sur les produits, et conduire les clients vers l'achat. Sois courtois, professionnel et persuasif.",
                "en": "You are a professional sales assistant for an African business. Your role is to qualify leads, answer product questions, and drive customers to purchase. Be courteous, professional and persuasive.",
                "both": "You are a bilingual (French/English) professional sales assistant for an African business. Adapt your language to the customer. Your role is to qualify leads, answer product questions, and drive customers to purchase. Be courteous, professional and persuasive.",
            },
            "remind": {
                "fr": "Tu es un assistant de rappel de rendez-vous. Ton r\u00f4le est de confirmer les rendez-vous, envoyer des rappels 24h et 1h avant, et g\u00e9rer les reprogrammations. Sois poli et efficace.",
                "en": "You are an appointment reminder assistant. Your role is to confirm appointments, send reminders 24h and 1h before, and manage rescheduling. Be polite and efficient.",
                "both": "You are a bilingual (French/English) appointment reminder assistant. Adapt your language to the customer. Your role is to confirm appointments, send reminders 24h and 1h before, and manage rescheduling. Be polite and efficient.",
            },
            "collect": {
                "fr": "Tu es un assistant de recouvrement de dettes professionnel et courtois. Ton r\u00f4le est de rappeler les paiements en retard, n\u00e9gocier des plans de paiement, et maintenir de bonnes relations avec les clients. Sois ferme mais respectueux.",
                "en": "You are a professional and courteous debt collection assistant. Your role is to remind about overdue payments, negotiate payment plans, and maintain good customer relationships. Be firm but respectful.",
                "both": "You are a bilingual (French/English) professional debt collection assistant. Adapt your language to the customer. Your role is to remind about overdue payments, negotiate payment plans, and maintain good customer relationships. Be firm but respectful.",
            },
            "broadcast": {
                "fr": "Tu es un assistant de diffusion de messages. R\u00e9ponds aux r\u00e9actions et questions des clients suite aux messages de campagne. Sois accueillant et informatif.",
                "en": "You are a broadcast message assistant. Respond to customer reactions and questions following campaign messages. Be welcoming and informative.",
                "both": "You are a bilingual (French/English) broadcast message assistant. Adapt your language to the customer. Respond to customer reactions and questions following campaign messages. Be welcoming and informative.",
            },
        }
        return prompts.get(module, {}).get(language, prompts["sell"]["both"])


# Global instance
claude_service = ClaudeAIService()
