from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.claude_ai import claude_service
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from models import DemoSession
from datetime import datetime, timezone
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/demo", tags=["demo"])

class DemoChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    conversation_history: List[dict] = []

class DemoChatResponse(BaseModel):
    reply: str
    session_id: str

DEMO_SYSTEM_PROMPT = """Tu es WAZA Bot, l'assistant commercial IA de démonstration pour WAZA, une plateforme SaaS d'agents WhatsApp pour les entreprises africaines.

Tu es en mode DÉMO sur le site web de WAZA. Ton rôle est de montrer aux visiteurs comment un agent IA WAZA fonctionne sur WhatsApp.

Comportement :
- Réponds en français par défaut, mais adapte-toi si le visiteur écrit en anglais
- Sois professionnel, chaleureux et convaincant
- Montre comment tu peux aider une entreprise (ventes, rappels, recouvrement, broadcasts)
- Utilise des exemples concrets d'entreprises africaines
- Garde tes réponses courtes (2-4 phrases max) comme sur WhatsApp
- Si on te demande les prix, mentionne les plans WAZA : Free (0 FCFA), Starter (19,900 FCFA), Pro (49,900 FCFA), Business (99,000 FCFA)
- Encourage le visiteur à s'inscrire pour essayer gratuitement

Tu simules un agent commercial IA pour une boutique de mode africaine appelée "AfriStyle". Tu vends des vêtements traditionnels et modernes. Exemples de produits : Boubou premium (25,000 FCFA), Robe Ankara (18,000 FCFA), Chemise Wax (12,000 FCFA).
"""

@router.post("/chat", response_model=DemoChatResponse)
async def demo_chat(request: DemoChatRequest, db: Session = Depends(get_db)):
    """Public demo chat endpoint - no auth required"""
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=422, detail="Le message ne peut pas être vide.")

    try:
        session_id = request.session_id or str(uuid.uuid4())

        # Track demo session
        try:
            existing = db.query(DemoSession).filter(DemoSession.session_id == session_id).first()
            if existing:
                existing.messages_count += 1
                existing.last_activity = datetime.now(timezone.utc)
            else:
                demo_session = DemoSession(
                    session_id=session_id,
                    first_message=request.message[:200],
                    messages_count=1,
                )
                db.add(demo_session)
            db.commit()
        except Exception as e:
            logger.warning(f"Failed to track demo session: {e}")
            db.rollback()

        reply = await claude_service.generate_response(
            system_prompt=DEMO_SYSTEM_PROMPT,
            conversation_history=request.conversation_history,
            user_message=request.message,
            session_id=session_id,
        )

        return DemoChatResponse(reply=reply, session_id=session_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Demo chat error: {e}")
        raise HTTPException(status_code=500, detail="Erreur du service IA. Réessayez.")
