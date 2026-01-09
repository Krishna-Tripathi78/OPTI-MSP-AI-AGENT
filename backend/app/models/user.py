"""User models for authentication."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for creating a new user."""
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=2)
    company: Optional[str] = None
    phone: str = Field(min_length=10)  # Required mobile number
    role: str = "user"


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response (no password)."""
    id: str
    email: str
    name: str
    company: Optional[str] = None
    phone: Optional[str] = None
    role: str = "user"
    created_at: datetime


class UserInDB(BaseModel):
    """Schema for user stored in database."""
    email: str
    name: str
    company: Optional[str] = None
    phone: Optional[str] = None
    role: str = "user"
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True


class Token(BaseModel):
    """JWT Token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Data encoded in JWT token."""
    user_id: Optional[str] = None
    email: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    """Schema for forgot password request."""
    email: EmailStr
    method: str = Field(pattern="^(email|mobile)$")  # email or mobile


class ResetPasswordRequest(BaseModel):
    """Schema for password reset with OTP."""
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=6)


class OTPVerification(BaseModel):
    """Schema for OTP verification."""
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)
