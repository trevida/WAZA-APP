from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse, RefreshTokenRequest, VerifyEmailRequest, ForgotPasswordRequest, ResetPasswordRequest
from utils.auth import hash_password, verify_password, create_access_token, create_refresh_token, verify_token, generate_verification_token
from services.email_service import email_service
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, EmailStr
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


class ResendVerificationRequest(BaseModel):
    email: EmailStr

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
        company_name=user_data.company_name,
        country=user_data.country,
        verification_token=generate_verification_token()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate tokens
    access_token = create_access_token({"sub": new_user.id})
    refresh_token = create_refresh_token({"sub": new_user.id})
    
    logger.info(f"New user registered: {new_user.email}")
    
    # Send verification email (mock)
    email_service.send_verification_email(new_user.email, new_user.verification_token)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password
    """
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # Generate tokens
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})
    
    logger.info(f"User logged in: {user.email}")
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user)
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refresh access token using refresh token
    """
    payload = verify_token(request.refresh_token, token_type="refresh")
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Generate new tokens
    access_token = create_access_token({"sub": user.id})
    new_refresh_token = create_refresh_token({"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user=UserResponse.model_validate(user)
    )

@router.post("/verify-email")
async def verify_email(request: VerifyEmailRequest, db: Session = Depends(get_db)):
    """
    Verify user email with token
    """
    user = db.query(User).filter(User.verification_token == request.token).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    user.is_verified = True
    user.verification_token = None
    db.commit()
    
    logger.info(f"Email verified: {user.email}")
    
    return {"message": "Email verified successfully"}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Request password reset
    """
    user = db.query(User).filter(User.email == request.email).first()
    
    if user:
        # Generate reset token
        reset_token = generate_verification_token()
        user.reset_token = reset_token
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        db.commit()
        
        logger.info(f"Password reset requested: {user.email}")
        # Send reset email (mock)
        email_service.send_password_reset_email(user.email, reset_token)
    
    # Always return success to prevent email enumeration
    return {"message": "If the email exists, a reset link has been sent"}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset password with token
    """
    user = db.query(User).filter(User.reset_token == request.token).first()
    
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Update password
    user.password_hash = hash_password(request.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    
    logger.info(f"Password reset successful: {user.email}")
    
    return {"message": "Password reset successfully"}


@router.post("/resend-verification")
async def resend_verification(request: ResendVerificationRequest, db: Session = Depends(get_db)):
    """Resend verification email"""
    user = db.query(User).filter(User.email == request.email).first()

    if user and not user.is_verified:
        token = generate_verification_token()
        user.verification_token = token
        db.commit()
        email_service.send_verification_email(user.email, token)

    return {"message": "If the account exists and is not verified, a new email has been sent"}
