from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Agent, Workspace, User
from schemas.agent import AgentCreate, AgentUpdate, AgentResponse, AgentTestRequest
from utils.dependencies import get_current_active_user
from utils.limits import check_agent_limit
from services.claude_ai import claude_service
from services.whatsapp import whatsapp_service
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Agents"])

@router.get("/workspaces/{workspace_id}/agents", response_model=List[AgentResponse])
async def list_agents(
    workspace_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all agents for a workspace"""
    # Verify workspace ownership
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    agents = db.query(Agent).filter(Agent.workspace_id == workspace_id).all()
    return agents

@router.post("/workspaces/{workspace_id}/agents", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    workspace_id: str,
    agent_data: AgentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new agent"""
    # Verify workspace ownership
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    # Check agent limit
    agent_count = db.query(Agent).filter(Agent.workspace_id == workspace_id).count()
    if not check_agent_limit(agent_count, current_user.plan.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Agent limit reached for {current_user.plan.value} plan. Please upgrade."
        )
    
    new_agent = Agent(
        workspace_id=workspace_id,
        name=agent_data.name,
        module=agent_data.module,
        system_prompt=agent_data.system_prompt,
        language=agent_data.language
    )
    
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)
    
    logger.info(f"Agent created: {new_agent.id} in workspace {workspace_id}")
    
    return new_agent

@router.get("/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get agent details"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Verify ownership through workspace
    workspace = db.query(Workspace).filter(
        Workspace.id == agent.workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return agent

@router.put("/agents/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    agent_data: AgentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update agent"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Verify ownership
    workspace = db.query(Workspace).filter(
        Workspace.id == agent.workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update fields
    if agent_data.name is not None:
        agent.name = agent_data.name
    if agent_data.system_prompt is not None:
        agent.system_prompt = agent_data.system_prompt
    if agent_data.language is not None:
        agent.language = agent_data.language
    if agent_data.is_active is not None:
        agent.is_active = agent_data.is_active
    
    db.commit()
    db.refresh(agent)
    
    return agent

@router.delete("/agents/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete agent"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Verify ownership
    workspace = db.query(Workspace).filter(
        Workspace.id == agent.workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    db.delete(agent)
    db.commit()
    
    logger.info(f"Agent deleted: {agent_id}")

@router.post("/agents/{agent_id}/test")
async def test_agent(
    agent_id: str,
    test_data: AgentTestRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Test agent with a sample message"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Verify ownership
    workspace = db.query(Workspace).filter(
        Workspace.id == agent.workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    try:
        # Generate AI response
        response = await claude_service.generate_response(
            system_prompt=agent.system_prompt,
            conversation_history=[],
            user_message=test_data.test_message,
            session_id=f"test_{agent_id}_{current_user.id}"
        )
        
        # Mock send via WhatsApp
        await whatsapp_service.send_message(test_data.test_phone_number, response)
        
        return {
            "test_message": test_data.test_message,
            "ai_response": response,
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Error testing agent: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error testing agent: {str(e)}"
        )
