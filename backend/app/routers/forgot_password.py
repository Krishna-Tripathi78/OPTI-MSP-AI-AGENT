"""Forgot Password Router"""
from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timedelta
import random

from app.models.user import ForgotPasswordRequest, ResetPasswordRequest, OTPVerification
from app.services.auth_service import get_password_hash
from app.services.email_service import email_service
from app.database.connection import get_database
from app.database.collections import USERS

router = APIRouter(prefix="/api/auth", tags=["Password Reset"])


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Send OTP for password reset via email or mobile."""
    db = get_database()
    
    # Check if user exists
    user = await db[USERS].find_one({"email": request.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    # Store OTP in database (expires in 10 minutes)
    await db["password_reset_otps"].insert_one({
        "email": request.email,
        "otp": otp,
        "method": request.method,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=10)
    })
    
    # Send OTP via email or SMS
    if request.method == "email":
        # Send real email
        email_sent = await email_service.send_password_reset_email(request.email, otp)
        if email_sent:
            return {"message": f"Password reset email sent to {request.email}", "method": "email"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send email. Please try again."
            )
    else:
        phone = user.get("phone", "N/A")
        print(f"Mock SMS OTP to {phone}: {otp}")
        return {"message": f"OTP sent to mobile {phone}", "method": "mobile"}


@router.post("/verify-otp")
async def verify_otp(request: OTPVerification):
    """Verify OTP for password reset."""
    db = get_database()
    
    # Find valid OTP
    otp_record = await db["password_reset_otps"].find_one({
        "email": request.email,
        "otp": request.otp,
        "expires_at": {"$gt": datetime.utcnow()}
    })
    
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    return {"message": "OTP verified successfully", "valid": True}


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password with verified OTP."""
    db = get_database()
    
    # Verify OTP again
    otp_record = await db["password_reset_otps"].find_one({
        "email": request.email,
        "otp": request.otp,
        "expires_at": {"$gt": datetime.utcnow()}
    })
    
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    # Update user password
    new_hashed_password = get_password_hash(request.new_password)
    await db[USERS].update_one(
        {"email": request.email},
        {"$set": {"hashed_password": new_hashed_password}}
    )
    
    # Delete used OTP
    await db["password_reset_otps"].delete_one({"_id": otp_record["_id"]})
    
    return {"message": "Password reset successfully"}