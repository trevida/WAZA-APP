from datetime import datetime, timezone
from config import PLAN_LIMITS

def get_plan_limits(plan: str) -> dict:
    """Get limits for a specific plan"""
    return PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])

def check_message_limit(workspace, plan: str) -> bool:
    """Check if workspace has exceeded message limit"""
    limits = get_plan_limits(plan)
    if limits["messages"] == -1:  # Unlimited
        return True
    return workspace.monthly_message_count < limits["messages"]

def check_agent_limit(agent_count: int, plan: str) -> bool:
    """Check if user can create more agents"""
    limits = get_plan_limits(plan)
    if limits["agents"] == -1:  # Unlimited
        return True
    return agent_count < limits["agents"]

def check_workspace_limit(workspace_count: int, plan: str) -> bool:
    """Check if user can create more workspaces"""
    limits = get_plan_limits(plan)
    if limits["workspaces"] == -1:  # Unlimited
        return True
    return workspace_count < limits["workspaces"]

def get_current_period() -> str:
    """Get current billing period (YYYY-MM)"""
    return datetime.now(timezone.utc).strftime("%Y-%m")
