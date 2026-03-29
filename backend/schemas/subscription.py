from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models import PlanType, SubscriptionStatus, PaymentProvider

class SubscriptionCreate(BaseModel):
    plan: PlanType
    payment_provider: PaymentProvider

class SubscriptionResponse(BaseModel):
    id: str
    user_id: str
    plan: PlanType
    status: SubscriptionStatus
    price_fcfa: int
    payment_provider: PaymentProvider
    current_period_start: datetime
    current_period_end: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class PlanInfo(BaseModel):
    name: str
    price_fcfa: int
    messages: int
    agents: int
    workspaces: int
    features: list[str]
