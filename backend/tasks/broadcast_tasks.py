from celery import shared_task
from database import SessionLocal
from models import Workspace, Broadcast, Contact, BroadcastStatus
from services.whatsapp import whatsapp_service
from datetime import datetime, timezone
import logging
import random

logger = logging.getLogger(__name__)

@shared_task(name="tasks.send_broadcast")
def send_broadcast_task(broadcast_id: str):
    db = SessionLocal()
    try:
        broadcast = db.query(Broadcast).filter(Broadcast.id == broadcast_id).first()
        if not broadcast:
            logger.error(f"Broadcast not found: {broadcast_id}")
            return

        broadcast.status = BroadcastStatus.SENDING
        db.commit()

        query = db.query(Contact).filter(Contact.workspace_id == broadcast.workspace_id)
        if broadcast.target_tags:
            contacts = [c for c in query.all() if any(tag in c.tags for tag in broadcast.target_tags)]
        else:
            contacts = query.all()

        random.shuffle(contacts)

        if broadcast.ab_test_enabled and broadcast.variant_b_template:
            # Split contacts 50/50 for A/B test
            midpoint = len(contacts) // 2
            group_a = contacts[:midpoint]
            group_b = contacts[midpoint:]

            a_sent, a_delivered, a_replied = _send_to_group(group_a, broadcast.message_template)
            b_sent, b_delivered, b_replied = _send_to_group(group_b, broadcast.variant_b_template)

            broadcast.variant_a_sent = a_sent
            broadcast.variant_a_delivered = a_delivered
            broadcast.variant_a_replied = a_replied
            broadcast.variant_b_sent = b_sent
            broadcast.variant_b_delivered = b_delivered
            broadcast.variant_b_replied = b_replied
            broadcast.total_sent = a_sent + b_sent
            broadcast.total_delivered = a_delivered + b_delivered

            # Determine winner by reply rate
            a_rate = (a_replied / a_sent * 100) if a_sent > 0 else 0
            b_rate = (b_replied / b_sent * 100) if b_sent > 0 else 0
            if a_rate > b_rate:
                broadcast.winner = "A"
            elif b_rate > a_rate:
                broadcast.winner = "B"
            else:
                broadcast.winner = None  # Tie

            logger.info(f"A/B Test result: A={a_rate:.1f}% vs B={b_rate:.1f}% | Winner: {broadcast.winner}")
        else:
            # Standard send
            sent_count, delivered_count, _ = _send_to_group(contacts, broadcast.message_template)
            broadcast.total_sent = sent_count
            broadcast.total_delivered = delivered_count

        broadcast.status = BroadcastStatus.SENT
        broadcast.sent_at = datetime.now(timezone.utc)
        db.commit()

        logger.info(f"Broadcast completed: {broadcast.total_sent} sent, {broadcast.total_delivered} delivered")
        return {
            "broadcast_id": broadcast_id,
            "sent": broadcast.total_sent,
            "delivered": broadcast.total_delivered,
        }
    except Exception as e:
        logger.error(f"Error sending broadcast: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def _send_to_group(contacts, message_template):
    sent = 0
    delivered = 0
    replied = 0
    for contact in contacts:
        try:
            whatsapp_service.send_message(to=contact.phone_number, message=message_template)
            sent += 1
            delivered += 1  # Mock - assume all delivered
            # Mock reply simulation (~20-40% reply rate)
            if random.random() < random.uniform(0.2, 0.4):
                replied += 1
        except Exception as e:
            logger.error(f"Failed to send to {contact.phone_number}: {e}")
    return sent, delivered, replied


@shared_task(name="tasks.check_scheduled_broadcasts")
def check_scheduled_broadcasts():
    """Check and send scheduled broadcasts whose time has arrived"""
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        pending = db.query(Broadcast).filter(
            Broadcast.status == BroadcastStatus.SCHEDULED,
            Broadcast.scheduled_at <= now,
        ).all()

        for broadcast in pending:
            logger.info(f"Sending scheduled broadcast: {broadcast.id}")
            send_broadcast_task(broadcast.id)

        return {"checked": len(pending)}
    except Exception as e:
        logger.error(f"Error checking scheduled broadcasts: {e}")
    finally:
        db.close()


@shared_task(name="tasks.reset_monthly_counters")
def reset_monthly_counters_task():
    db = SessionLocal()
    try:
        from models import Workspace as WS
        workspaces = db.query(WS).all()
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
