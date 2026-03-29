from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database import get_db
from models import Workspace, User, Agent, Contact, Conversation, Message, UsageLog
from schemas.workspace import WorkspaceCreate, WorkspaceUpdate, WorkspaceResponse, WorkspaceConnectWhatsApp
from utils.dependencies import get_current_active_user
from utils.limits import check_workspace_limit, get_plan_limits
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/workspaces", tags=["Workspaces"])

@router.get("", response_model=List[WorkspaceResponse])
async def list_workspaces(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all workspaces for current user"""
    workspaces = db.query(Workspace).filter(Workspace.user_id == current_user.id).all()
    return workspaces

@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    workspace_data: WorkspaceCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new workspace"""
    # Check workspace limit
    workspace_count = db.query(Workspace).filter(Workspace.user_id == current_user.id).count()
    if not check_workspace_limit(workspace_count, current_user.plan.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Workspace limit reached for {current_user.plan.value} plan. Please upgrade."
        )
    
    # Get plan limits
    limits = get_plan_limits(current_user.plan.value)
    
    new_workspace = Workspace(
        user_id=current_user.id,
        name=workspace_data.name,
        message_limit=limits["messages"]
    )
    
    db.add(new_workspace)
    db.commit()
    db.refresh(new_workspace)
    
    logger.info(f"Workspace created: {new_workspace.id} for user {current_user.email}")
    
    return new_workspace

@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(
    workspace_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get workspace details"""
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    return workspace

@router.put("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_id: str,
    workspace_data: WorkspaceUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update workspace"""
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    if workspace_data.name:
        workspace.name = workspace_data.name
    
    db.commit()
    db.refresh(workspace)
    
    return workspace

@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(
    workspace_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete workspace"""
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    db.delete(workspace)
    db.commit()
    
    logger.info(f"Workspace deleted: {workspace_id}")

@router.post("/{workspace_id}/connect-whatsapp", response_model=WorkspaceResponse)
async def connect_whatsapp(
    workspace_id: str,
    whatsapp_data: WorkspaceConnectWhatsApp,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Connect WhatsApp Business account to workspace"""
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    workspace.whatsapp_phone_number_id = whatsapp_data.whatsapp_phone_number_id
    workspace.whatsapp_access_token = whatsapp_data.whatsapp_access_token
    
    db.commit()
    db.refresh(workspace)
    
    logger.info(f"WhatsApp connected to workspace: {workspace_id}")
    
    return workspace
