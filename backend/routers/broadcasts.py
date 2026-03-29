from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models import Broadcast, Workspace, User, Agent, Contact, BroadcastStatus
from schemas.broadcast import BroadcastCreate, BroadcastResponse, BroadcastStats
from utils.dependencies import get_current_active_user
from tasks.broadcast_tasks import send_broadcast_task
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Broadcasts"])

@router.get("/workspaces/{workspace_id}/broadcasts", response_model=List[BroadcastResponse])
async def list_broadcasts(
    workspace_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all broadcasts for a workspace"""
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    broadcasts = db.query(Broadcast).filter(
        Broadcast.workspace_id == workspace_id
    ).order_by(Broadcast.created_at.desc()).all()
    
    return broadcasts

@router.post("/workspaces/{workspace_id}/broadcasts", response_model=BroadcastResponse, status_code=status.HTTP_201_CREATED)
async def create_broadcast(
    workspace_id: str,
    broadcast_data: BroadcastCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new broadcast"""
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    # Verify agent if provided
    if broadcast_data.agent_id:
        agent = db.query(Agent).filter(
            Agent.id == broadcast_data.agent_id,
            Agent.workspace_id == workspace_id
        ).first()
        
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
    
    new_broadcast = Broadcast(
        workspace_id=workspace_id,
        agent_id=broadcast_data.agent_id,
        message_template=broadcast_data.message_template,
        target_tags=broadcast_data.target_tags,
        scheduled_at=broadcast_data.scheduled_at
    )
    
    db.add(new_broadcast)
    db.commit()
    db.refresh(new_broadcast)
    
    logger.info(f"Broadcast created: {new_broadcast.id}")
    
    return new_broadcast

@router.post("/broadcasts/{broadcast_id}/send")
async def send_broadcast(
    broadcast_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send broadcast to targeted contacts"""
    broadcast = db.query(Broadcast).filter(Broadcast.id == broadcast_id).first()
    
    if not broadcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Broadcast not found"
        )
    
    # Verify ownership
    workspace = db.query(Workspace).filter(
        Workspace.id == broadcast.workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if broadcast.status == BroadcastStatus.SENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Broadcast already sent"
        )
    
    # Count targeted contacts
    query = db.query(Contact).filter(Contact.workspace_id == workspace.id)
    
    if broadcast.target_tags:
        total_contacts = sum(
            1 for contact in query.all()
            if any(tag in contact.tags for tag in broadcast.target_tags)
        )
    else:
        total_contacts = query.count()
    
    # Queue broadcast task
    background_tasks.add_task(send_broadcast_task, broadcast_id)
    
    logger.info(f"Broadcast queued: {broadcast_id} to {total_contacts} contacts")
    
    return {
        "message": "Broadcast queued for sending",
        "broadcast_id": broadcast_id,
        "total_contacts": total_contacts
    }

@router.get("/broadcasts/{broadcast_id}/stats", response_model=BroadcastStats)
async def get_broadcast_stats(
    broadcast_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get broadcast statistics"""
    broadcast = db.query(Broadcast).filter(Broadcast.id == broadcast_id).first()
    
    if not broadcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Broadcast not found"
        )
    
    # Verify ownership
    workspace = db.query(Workspace).filter(
        Workspace.id == broadcast.workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    delivery_rate = 0.0
    if broadcast.total_sent > 0:
        delivery_rate = (broadcast.total_delivered / broadcast.total_sent) * 100
    
    return BroadcastStats(
        total_sent=broadcast.total_sent,
        total_delivered=broadcast.total_delivered,
        delivery_rate=round(delivery_rate, 2)
    )
