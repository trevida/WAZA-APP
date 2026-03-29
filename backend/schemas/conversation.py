from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from models import ConversationStatus

class MessageBase(BaseModel):
    role: str
    content: str

class MessageResponse(MessageBase):
    id: str
    conversation_id: str
    whatsapp_message_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: str
    workspace_id: str
    agent_id: Optional[str]
    contact_id: str
    status: ConversationStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ConversationWithMessages(ConversationResponse):
    messages: List[MessageResponse] = []
