from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models import BroadcastStatus

class BroadcastBase(BaseModel):
    message_template: str = Field(..., min_length=1)
    target_tags: List[str] = []
    scheduled_at: Optional[datetime] = None

class BroadcastCreate(BroadcastBase):
    agent_id: Optional[str] = None

class BroadcastResponse(BroadcastBase):
    id: str
    workspace_id: str
    agent_id: Optional[str]
    status: BroadcastStatus
    sent_at: Optional[datetime]
    total_sent: int
    total_delivered: int
    created_at: datetime

    class Config:
        from_attributes = True

class BroadcastStats(BaseModel):
    total_sent: int
    total_delivered: int
    delivery_rate: float
