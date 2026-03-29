import logging
from typing import List, Dict
from emergentintegrations.llm.chat import LlmChat, UserMessage
from config import settings
import os

logger = logging.getLogger(__name__)

class ClaudeAIService:
    """Service for Claude AI integration using emergentintegrations"""
    
    def __init__(self):
        self.api_key = settings.EMERGENT_LLM_KEY or os.getenv("EMERGENT_LLM_KEY")
        if not self.api_key:
            logger.warning("EMERGENT_LLM_KEY not found. AI responses will fail.")
        logger.info("ClaudeAIService initialized with Emergent LLM key")
    
    async def generate_response(
        self,
        system_prompt: str,
        conversation_history: List[Dict[str, str]],
        user_message: str,
        session_id: str
    ) -> str:
        """
        Generate AI response using Claude Sonnet 4.5
        
        Args:
            system_prompt: The agent's system instructions
            conversation_history: List of previous messages [{"role": "user"/"assistant", "content": "..."}]
            user_message: The current user message
            session_id: Unique session identifier
        
        Returns:
            AI-generated response text
        """
        try:
            # Create a new LlmChat instance for this conversation
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=system_prompt
            )
            
            # Use Claude Sonnet 4.5
            chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
            
            # Note: LlmChat manages its own history internally
            # We just send the current user message
            user_msg = UserMessage(text=user_message)
            
            # Generate response
            response = await chat.send_message(user_msg)
            
            logger.info(f"AI response generated for session {session_id}")
            return response
            
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            raise Exception(f"Failed to generate AI response: {str(e)}")
    
    def get_default_system_prompt(self, module: str, language: str = "both") -> str:
        """Get default system prompt for a module"""
        prompts = {
            "sell": {
                "fr": "Tu es un assistant commercial professionnel pour une entreprise africaine. Ton rôle est de qualifier les prospects, répondre aux questions sur les produits, et conduire les clients vers l'achat. Sois courtois, professionnel et persuasif.",
                "en": "You are a professional sales assistant for an African business. Your role is to qualify leads, answer product questions, and drive customers to purchase. Be courteous, professional and persuasive.",
                "both": "You are a bilingual (French/English) professional sales assistant for an African business. Adapt your language to the customer. Your role is to qualify leads, answer product questions, and drive customers to purchase. Be courteous, professional and persuasive."
            },
            "remind": {
                "fr": "Tu es un assistant de rappel de rendez-vous. Ton rôle est de confirmer les rendez-vous, envoyer des rappels 24h et 1h avant, et gérer les reprogrammations. Sois poli et efficace.",
                "en": "You are an appointment reminder assistant. Your role is to confirm appointments, send reminders 24h and 1h before, and manage rescheduling. Be polite and efficient.",
                "both": "You are a bilingual (French/English) appointment reminder assistant. Adapt your language to the customer. Your role is to confirm appointments, send reminders 24h and 1h before, and manage rescheduling. Be polite and efficient."
            },
            "collect": {
                "fr": "Tu es un assistant de recouvrement de dettes professionnel et courtois. Ton rôle est de rappeler les paiements en retard, négocier des plans de paiement, et maintenir de bonnes relations avec les clients. Sois ferme mais respectueux.",
                "en": "You are a professional and courteous debt collection assistant. Your role is to remind about overdue payments, negotiate payment plans, and maintain good customer relationships. Be firm but respectful.",
                "both": "You are a bilingual (French/English) professional debt collection assistant. Adapt your language to the customer. Your role is to remind about overdue payments, negotiate payment plans, and maintain good customer relationships. Be firm but respectful."
            },
            "broadcast": {
                "fr": "Tu es un assistant de diffusion de messages. Réponds aux réactions et questions des clients suite aux messages de campagne. Sois accueillant et informatif.",
                "en": "You are a broadcast message assistant. Respond to customer reactions and questions following campaign messages. Be welcoming and informative.",
                "both": "You are a bilingual (French/English) broadcast message assistant. Adapt your language to the customer. Respond to customer reactions and questions following campaign messages. Be welcoming and informative."
            }
        }
        
        return prompts.get(module, {}).get(language, prompts["sell"]["both"])

# Global instance
claude_service = ClaudeAIService()
