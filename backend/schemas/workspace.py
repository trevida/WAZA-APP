from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class WorkspaceBase(BaseModel):
    name: str = Field(..., min_length=1)

class WorkspaceCreate(WorkspaceBase):
    pass

class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None

class WorkspaceConnectWhatsApp(BaseModel):
    whatsapp_phone_number_id: str
    whatsapp_access_token: str

class WorkspaceResponse(WorkspaceBase):
    id: str
    user_id: str
    whatsapp_phone_number_id: Optional[str]
    monthly_message_count: int
    message_limit: int
    created_at: datetime

    class Config:
        from_attributes = True
