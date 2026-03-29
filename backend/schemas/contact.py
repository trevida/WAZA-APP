from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ContactBase(BaseModel):
    phone_number: str = Field(..., pattern=r'^\+[1-9]\d{1,14}$')
    name: Optional[str] = None
    tags: List[str] = []

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    tags: Optional[List[str]] = None

class ContactResponse(ContactBase):
    id: str
    workspace_id: str
    last_interaction: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class ContactImportRequest(BaseModel):
    contacts: List[ContactCreate]
