from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from models import ModuleType, LanguageType

class AgentBase(BaseModel):
    name: str = Field(..., min_length=1)
    module: ModuleType
    system_prompt: str = Field(..., min_length=10)
    language: LanguageType = LanguageType.BOTH

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    system_prompt: Optional[str] = None
    language: Optional[LanguageType] = None
    is_active: Optional[bool] = None

class AgentResponse(AgentBase):
    id: str
    workspace_id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AgentTestRequest(BaseModel):
    test_message: str
    test_phone_number: str = "+221700000000"
