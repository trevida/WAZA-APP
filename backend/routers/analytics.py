from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Workspace, User, Conversation, Message, UsageLog, ConversationStatus
from schemas.analytics import AnalyticsOverview, MessageAnalytics, ConversionAnalytics
from utils.dependencies import get_current_active_user
from utils.limits import get_current_period
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/workspaces/{workspace_id}/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(
    workspace_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get workspace analytics overview"""
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    # Total conversations
    total_conversations = db.query(Conversation).filter(
        Conversation.workspace_id == workspace_id
    ).count()
    
    # Active conversations
    active_conversations = db.query(Conversation).filter(
        Conversation.workspace_id == workspace_id,
        Conversation.status == ConversationStatus.OPEN
    ).count()
    
    # Total messages
    total_messages = db.query(Message).join(Conversation).filter(
        Conversation.workspace_id == workspace_id
    ).count()
    
    # Messages this month
    current_period = get_current_period()
    usage_log = db.query(UsageLog).filter(
        UsageLog.workspace_id == workspace_id,
        UsageLog.period == current_period
    ).first()
    
    messages_this_month = usage_log.messages_used if usage_log else 0
    
    # Usage percentage
    usage_percentage = 0.0
    if workspace.message_limit > 0:
        usage_percentage = (messages_this_month / workspace.message_limit) * 100
    elif workspace.message_limit == -1:  # Unlimited
        usage_percentage = 0.0
    
    return AnalyticsOverview(
        total_conversations=total_conversations,
        active_conversations=active_conversations,
        total_messages=total_messages,
        messages_this_month=messages_this_month,
        message_limit=workspace.message_limit,
        usage_percentage=round(usage_percentage, 2)
    )

@router.get("/workspaces/{workspace_id}/messages")
async def get_message_analytics(
    workspace_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get message analytics by period"""
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    # Get usage logs for last 6 months
    usage_logs = db.query(UsageLog).filter(
        UsageLog.workspace_id == workspace_id
    ).order_by(UsageLog.period.desc()).limit(6).all()
    
    analytics = []
    for log in usage_logs:
        # Count user vs assistant messages for this period
        # This is simplified - in production, you'd filter by date range
        analytics.append({
            "period": log.period,
            "total_messages": log.messages_used,
            "user_messages": log.messages_used // 2,  # Simplified
            "assistant_messages": log.messages_used // 2
        })
    
    return analytics

@router.get("/workspaces/{workspace_id}/conversions", response_model=ConversionAnalytics)
async def get_conversion_analytics(
    workspace_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get conversion analytics (mock data for now)"""
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    # Mock conversion data
    # In production, this would track actual conversions through agent conversations
    total_conversations = db.query(Conversation).filter(
        Conversation.workspace_id == workspace_id
    ).count()
    
    return ConversionAnalytics(
        total_leads=total_conversations,
        qualified_leads=int(total_conversations * 0.3),  # Mock: 30% qualified
        conversion_rate=30.0,
        revenue_fcfa=0  # To be implemented with actual sales tracking
    )
