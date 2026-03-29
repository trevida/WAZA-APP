from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Conversation, Message, Workspace, User, ConversationStatus
from schemas.conversation import ConversationResponse, ConversationWithMessages, MessageResponse
from utils.dependencies import get_current_active_user
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Conversations"])

@router.get("/workspaces/{workspace_id}/conversations", response_model=List[ConversationResponse])
async def list_conversations(
    workspace_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all conversations for a workspace"""
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    conversations = db.query(Conversation).filter(
        Conversation.workspace_id == workspace_id
    ).order_by(Conversation.updated_at.desc()).all()
    
    return conversations

@router.get("/conversations/{conversation_id}/messages", response_model=ConversationWithMessages)
async def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get conversation with all messages"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Verify ownership
    workspace = db.query(Workspace).filter(
        Workspace.id == conversation.workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get messages
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc()).all()
    
    return ConversationWithMessages(
        **conversation.__dict__,
        messages=[MessageResponse.model_validate(msg) for msg in messages]
    )

@router.post("/conversations/{conversation_id}/close")
async def close_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Close a conversation"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Verify ownership
    workspace = db.query(Workspace).filter(
        Workspace.id == conversation.workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    conversation.status = ConversationStatus.CLOSED
    db.commit()
    
    return {"message": "Conversation closed successfully"}
