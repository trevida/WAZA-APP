from celery import shared_task
from database import SessionLocal
from models import Workspace, Broadcast, Contact, BroadcastStatus
from services.whatsapp import whatsapp_service
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

@shared_task(name="tasks.send_broadcast")
def send_broadcast_task(broadcast_id: str):
    """
    Send broadcast messages to targeted contacts
    """
    db = SessionLocal()
    try:
        broadcast = db.query(Broadcast).filter(Broadcast.id == broadcast_id).first()
        
        if not broadcast:
            logger.error(f"Broadcast not found: {broadcast_id}")
            return
        
        # Get targeted contacts
        query = db.query(Contact).filter(Contact.workspace_id == broadcast.workspace_id)
        
        if broadcast.target_tags:
            # Filter by tags
            contacts = []
            for contact in query.all():
                if any(tag in contact.tags for tag in broadcast.target_tags):
                    contacts.append(contact)
        else:
            contacts = query.all()
        
        sent_count = 0
        delivered_count = 0
        
        # Send to each contact
        for contact in contacts:
            try:
                result = whatsapp_service.send_message(
                    to=contact.phone_number,
                    message=broadcast.message_template
                )
                sent_count += 1
                delivered_count += 1  # Mock - assume all delivered
                logger.info(f"Broadcast message sent to {contact.phone_number}")
            except Exception as e:
                logger.error(f"Failed to send broadcast to {contact.phone_number}: {e}")
        
        # Update broadcast
        broadcast.status = BroadcastStatus.SENT
        broadcast.sent_at = datetime.now(timezone.utc)
        broadcast.total_sent = sent_count
        broadcast.total_delivered = delivered_count
        
        db.commit()
        
        logger.info(f"Broadcast completed: {sent_count} sent, {delivered_count} delivered")
        
        return {
            "broadcast_id": broadcast_id,
            "sent": sent_count,
            "delivered": delivered_count
        }
        
    except Exception as e:
        logger.error(f"Error sending broadcast: {e}")
        db.rollback()
        raise
    finally:
        db.close()

@shared_task(name="tasks.reset_monthly_counters")
def reset_monthly_counters_task():
    """
    Reset monthly message counters for all workspaces
    (Run on 1st of each month)
    """
    db = SessionLocal()
    try:
        workspaces = db.query(Workspace).all()
        reset_count = 0
        
        for workspace in workspaces:
            workspace.monthly_message_count = 0
            reset_count += 1
        
        db.commit()
        
        logger.info(f"Monthly counters reset for {reset_count} workspaces")
        
        return {"reset_count": reset_count}
        
    except Exception as e:
        logger.error(f"Error resetting monthly counters: {e}")
        db.rollback()
        raise
    finally:
        db.close()
