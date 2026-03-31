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
    ab_test_enabled: bool = False
    variant_b_template: Optional[str] = None

class BroadcastResponse(BroadcastBase):
    id: str
    workspace_id: str
    agent_id: Optional[str]
    status: BroadcastStatus
    sent_at: Optional[datetime]
    total_sent: int
    total_delivered: int
    ab_test_enabled: bool = False
    variant_b_template: Optional[str] = None
    variant_a_sent: int = 0
    variant_a_delivered: int = 0
    variant_a_replied: int = 0
    variant_b_sent: int = 0
    variant_b_delivered: int = 0
    variant_b_replied: int = 0
    winner: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BroadcastStats(BaseModel):
    total_sent: int
    total_delivered: int
    delivery_rate: float
    ab_test: Optional[dict] = None
