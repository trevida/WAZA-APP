from pydantic import BaseModel
from typing import Dict, List
from datetime import datetime

class AnalyticsOverview(BaseModel):
    total_conversations: int
    active_conversations: int
    total_messages: int
    messages_this_month: int
    message_limit: int
    usage_percentage: float

class MessageAnalytics(BaseModel):
    period: str
    total_messages: int
    user_messages: int
    assistant_messages: int

class ConversionAnalytics(BaseModel):
    total_leads: int
    qualified_leads: int
    conversion_rate: float
    revenue_fcfa: int
