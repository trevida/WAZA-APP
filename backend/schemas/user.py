from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from models import PlanType

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    company_name: Optional[str] = None
    country: str = "SN"

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    country: Optional[str] = None

class UserResponse(UserBase):
    id: str
    plan: PlanType
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class VerifyEmailRequest(BaseModel):
    token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)
