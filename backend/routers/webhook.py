from fastapi import APIRouter, Request, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Workspace, Agent, Contact, Conversation, Message, User, UsageLog, ConversationStatus
from services.whatsapp import whatsapp_service
from services.claude_ai import claude_service
from utils.limits import check_message_limit, get_current_period
from config import settings
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhook", tags=["Webhooks"])

@router.get("/whatsapp")
async def verify_whatsapp_webhook(
    mode: str = Query(..., alias="hub.mode"),
    token: str = Query(..., alias="hub.verify_token"),
    challenge: str = Query(..., alias="hub.challenge")
):
    """
    Verify WhatsApp webhook
    """
    result = whatsapp_service.verify_webhook(
        mode=mode,
        token=token,
        challenge=challenge,
        verify_token=settings.WHATSAPP_VERIFY_TOKEN
    )
    
    if result:
        return int(result)
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Verification failed"
    )

@router.post("/whatsapp")
async def handle_whatsapp_webhook(request: Request):
    """
    Handle incoming WhatsApp messages - CORE AI AGENT LOGIC
    """
    db = SessionLocal()
    try:
        webhook_data = await request.json()
        logger.info(f"Received WhatsApp webhook: {webhook_data}")
        
        # Parse incoming message
        parsed_message = whatsapp_service.parse_webhook_message(webhook_data)
        
        if not parsed_message:
            logger.warning("No valid message found in webhook")
            return {"status": "ok"}
        
        user_phone = parsed_message["from"]
        user_message_text = parsed_message["text"]
        whatsapp_message_id = parsed_message["message_id"]
        
        logger.info(f"Processing message from {user_phone}: {user_message_text[:50]}...")
        
        # TODO: Identify workspace by phone number
        # For now, we'll use the first active workspace (mock)
        workspace = db.query(Workspace).filter(
            Workspace.whatsapp_phone_number_id.isnot(None)
        ).first()
        
        if not workspace:
            logger.error("No workspace with WhatsApp configured")
            return {"status": "no_workspace"}
        
        # Get user for plan checking
        user = db.query(User).filter(User.id == workspace.user_id).first()
        if not user:
            logger.error("User not found for workspace")
            return {"status": "user_not_found"}
        
        # Check message limit
        if not check_message_limit(workspace, user.plan.value):
            # Send upgrade message
            upgrade_message = f"Vous avez atteint la limite de messages pour votre plan {user.plan.value}. Veuillez mettre \u00e0 niveau votre abonnement pour continuer."
            await whatsapp_service.send_message(user_phone, upgrade_message)
            logger.warning(f"Message limit exceeded for workspace {workspace.id}")
            return {"status": "limit_exceeded"}
        
        # Find or create contact
        contact = db.query(Contact).filter(
            Contact.workspace_id == workspace.id,
            Contact.phone_number == user_phone
        ).first()
        
        if not contact:
            contact = Contact(
                workspace_id=workspace.id,
                phone_number=user_phone,
                last_interaction=datetime.now(timezone.utc)
            )
            db.add(contact)
            db.commit()
            db.refresh(contact)
            logger.info(f"New contact created: {contact.id}")
        else:
            contact.last_interaction = datetime.now(timezone.utc)
            db.commit()
        
        # Find active agent for this workspace
        agent = db.query(Agent).filter(
            Agent.workspace_id == workspace.id,
            Agent.is_active == True
        ).first()
        
        if not agent:
            logger.error(f"No active agent found for workspace {workspace.id}")
            await whatsapp_service.send_message(user_phone, "D\u00e9sol\u00e9, aucun agent n'est disponible pour le moment.")
            return {"status": "no_agent"}
        
        # Find or create conversation
        conversation = db.query(Conversation).filter(
            Conversation.workspace_id == workspace.id,
            Conversation.contact_id == contact.id,
            Conversation.status == ConversationStatus.OPEN
        ).first()
        
        if not conversation:
            conversation = Conversation(
                workspace_id=workspace.id,
                agent_id=agent.id,
                contact_id=contact.id,
                status=ConversationStatus.OPEN
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
            logger.info(f"New conversation created: {conversation.id}")
        
        # Save user message
        user_msg = Message(
            conversation_id=conversation.id,
            role="user",
            content=user_message_text,
            whatsapp_message_id=whatsapp_message_id
        )
        db.add(user_msg)
        db.commit()
        
        # Load conversation history (last 20 messages)
        history_messages = db.query(Message).filter(
            Message.conversation_id == conversation.id
        ).order_by(Message.created_at.desc()).limit(20).all()
        
        history_messages.reverse()  # Chronological order
        
        conversation_history = [
            {"role": msg.role, "content": msg.content}
            for msg in history_messages[:-1]  # Exclude the message we just added
        ]
        
        # Generate AI response using Claude
        try:
            ai_response = await claude_service.generate_response(
                system_prompt=agent.system_prompt,
                conversation_history=conversation_history,
                user_message=user_message_text,
                session_id=conversation.id
            )
            
            logger.info(f"AI response generated: {ai_response[:50]}...")
            
            # Send response via WhatsApp
            whatsapp_response = await whatsapp_service.send_message(user_phone, ai_response)
            
            # Save assistant message
            assistant_msg = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=ai_response,
                whatsapp_message_id=whatsapp_response["messages"][0]["id"]
            )
            db.add(assistant_msg)
            
            # Increment message count
            workspace.monthly_message_count += 1
            
            # Update usage log
            current_period = get_current_period()
            usage_log = db.query(UsageLog).filter(
                UsageLog.workspace_id == workspace.id,
                UsageLog.period == current_period
            ).first()
            
            if usage_log:
                usage_log.messages_used += 1
            else:
                usage_log = UsageLog(
                    workspace_id=workspace.id,
                    messages_used=1,
                    period=current_period
                )
                db.add(usage_log)
            
            db.commit()
            
            logger.info(f"Message processed successfully for conversation {conversation.id}")
            
            return {"status": "success", "conversation_id": conversation.id}
            
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            await whatsapp_service.send_message(user_phone, "D\u00e9sol\u00e9, une erreur s'est produite. Veuillez r\u00e9essayer.")
            return {"status": "error", "error": str(e)}
    
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        return {"status": "error", "error": str(e)}
    
    finally:
        db.close()
