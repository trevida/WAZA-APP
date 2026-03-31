from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models import Broadcast, Workspace, User, Agent, Contact, BroadcastStatus
from schemas.broadcast import BroadcastCreate, BroadcastResponse, BroadcastStats
from utils.dependencies import get_current_active_user
from tasks.broadcast_tasks import send_broadcast_task
from typing import List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Broadcasts"])

@router.get("/workspaces/{workspace_id}/broadcasts", response_model=List[BroadcastResponse])
async def list_broadcasts(
    workspace_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    
    broadcasts = db.query(Broadcast).filter(
        Broadcast.workspace_id == workspace_id
    ).order_by(Broadcast.created_at.desc()).all()
    return broadcasts

@router.post("/workspaces/{workspace_id}/broadcasts", response_model=BroadcastResponse, status_code=status.HTTP_201_CREATED)
async def create_broadcast(
    workspace_id: str,
    broadcast_data: BroadcastCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    
    if broadcast_data.agent_id:
        agent = db.query(Agent).filter(
            Agent.id == broadcast_data.agent_id,
            Agent.workspace_id == workspace_id
        ).first()
        if not agent:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    
    # A/B test validation
    if broadcast_data.ab_test_enabled and not broadcast_data.variant_b_template:
        raise HTTPException(status_code=422, detail="Variante B requise pour le test A/B")
    
    initial_status = BroadcastStatus.DRAFT
    if broadcast_data.scheduled_at:
        if broadcast_data.scheduled_at.replace(tzinfo=timezone.utc) <= datetime.now(timezone.utc):
            raise HTTPException(status_code=422, detail="La date programmee doit etre dans le futur")
        initial_status = BroadcastStatus.SCHEDULED

    new_broadcast = Broadcast(
        workspace_id=workspace_id,
        agent_id=broadcast_data.agent_id,
        message_template=broadcast_data.message_template,
        target_tags=broadcast_data.target_tags,
        scheduled_at=broadcast_data.scheduled_at,
        ab_test_enabled=broadcast_data.ab_test_enabled,
        variant_b_template=broadcast_data.variant_b_template,
        status=initial_status,
    )
    db.add(new_broadcast)
    db.commit()
    db.refresh(new_broadcast)
    
    logger.info(f"Broadcast created: {new_broadcast.id} | A/B: {new_broadcast.ab_test_enabled} | Scheduled: {new_broadcast.scheduled_at}")
    return new_broadcast

@router.post("/broadcasts/{broadcast_id}/send")
async def send_broadcast(
    broadcast_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    broadcast = db.query(Broadcast).filter(Broadcast.id == broadcast_id).first()
    if not broadcast:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Broadcast not found")
    
    workspace = db.query(Workspace).filter(
        Workspace.id == broadcast.workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    if broadcast.status == BroadcastStatus.SENT:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Broadcast already sent")
    
    query = db.query(Contact).filter(Contact.workspace_id == workspace.id)
    if broadcast.target_tags:
        total_contacts = sum(
            1 for contact in query.all()
            if any(tag in contact.tags for tag in broadcast.target_tags)
        )
    else:
        total_contacts = query.count()
    
    background_tasks.add_task(send_broadcast_task, broadcast_id)
    logger.info(f"Broadcast queued: {broadcast_id} to {total_contacts} contacts")
    
    return {
        "message": "Broadcast en cours d'envoi",
        "broadcast_id": broadcast_id,
        "total_contacts": total_contacts,
        "ab_test": broadcast.ab_test_enabled,
    }

@router.get("/broadcasts/{broadcast_id}/stats", response_model=BroadcastStats)
async def get_broadcast_stats(
    broadcast_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    broadcast = db.query(Broadcast).filter(Broadcast.id == broadcast_id).first()
    if not broadcast:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Broadcast not found")
    
    workspace = db.query(Workspace).filter(
        Workspace.id == broadcast.workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    delivery_rate = 0.0
    if broadcast.total_sent > 0:
        delivery_rate = (broadcast.total_delivered / broadcast.total_sent) * 100
    
    ab_test_data = None
    if broadcast.ab_test_enabled:
        a_rate = (broadcast.variant_a_replied / broadcast.variant_a_sent * 100) if broadcast.variant_a_sent > 0 else 0
        b_rate = (broadcast.variant_b_replied / broadcast.variant_b_sent * 100) if broadcast.variant_b_sent > 0 else 0
        ab_test_data = {
            "variant_a": {
                "template": broadcast.message_template,
                "sent": broadcast.variant_a_sent,
                "delivered": broadcast.variant_a_delivered,
                "replied": broadcast.variant_a_replied,
                "reply_rate": round(a_rate, 1),
            },
            "variant_b": {
                "template": broadcast.variant_b_template,
                "sent": broadcast.variant_b_sent,
                "delivered": broadcast.variant_b_delivered,
                "replied": broadcast.variant_b_replied,
                "reply_rate": round(b_rate, 1),
            },
            "winner": broadcast.winner,
        }
    
    return BroadcastStats(
        total_sent=broadcast.total_sent,
        total_delivered=broadcast.total_delivered,
        delivery_rate=round(delivery_rate, 2),
        ab_test=ab_test_data,
    )

@router.delete("/broadcasts/{broadcast_id}")
async def delete_broadcast(
    broadcast_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    broadcast = db.query(Broadcast).filter(Broadcast.id == broadcast_id).first()
    if not broadcast:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Broadcast not found")
    
    workspace = db.query(Workspace).filter(
        Workspace.id == broadcast.workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    if broadcast.status in [BroadcastStatus.SENDING, BroadcastStatus.SENT]:
        raise HTTPException(status_code=400, detail="Impossible de supprimer un broadcast en cours ou deja envoye")
    
    db.delete(broadcast)
    db.commit()
    return {"message": "Broadcast supprime"}

@router.post("/broadcasts/{broadcast_id}/cancel-schedule")
async def cancel_scheduled_broadcast(
    broadcast_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    broadcast = db.query(Broadcast).filter(Broadcast.id == broadcast_id).first()
    if not broadcast:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Broadcast not found")
    
    workspace = db.query(Workspace).filter(
        Workspace.id == broadcast.workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    if broadcast.status != BroadcastStatus.SCHEDULED:
        raise HTTPException(status_code=400, detail="Ce broadcast n'est pas programme")
    
    broadcast.status = BroadcastStatus.DRAFT
    broadcast.scheduled_at = None
    db.commit()
    db.refresh(broadcast)
    
    return {"message": "Programmation annulee", "broadcast_id": broadcast_id}
