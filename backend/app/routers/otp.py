from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.sms_service import sms_service
import re
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/otp", tags=["OTP"])

class SendOTPRequest(BaseModel):
    phone_number: str

class VerifyOTPRequest(BaseModel):
    phone_number: str
    otp: str

def validate_phone_number(phone: str) -> bool:
    """Validate Indian phone number format"""
    # Remove +91 if present
    phone = phone.replace('+91', '').replace(' ', '').replace('-', '')
    
    # Check if it's 10 digits and starts with valid digits
    if len(phone) == 10 and phone.isdigit() and phone[0] in '6789':
        return True
    return False

@router.post("/send")
async def send_otp(request: SendOTPRequest):
    """Send OTP to phone number"""
    try:
        logger.info(f"Received OTP request for phone: {request.phone_number}")
        
        # Validate phone number
        if not validate_phone_number(request.phone_number):
            logger.error(f"Invalid phone number: {request.phone_number}")
            raise HTTPException(
                status_code=400,
                detail="Invalid phone number format. Use 10-digit Indian number."
            )
        
        # Clean phone number
        clean_phone = request.phone_number.replace('+91', '').replace(' ', '').replace('-', '')
        logger.info(f"Sending OTP to cleaned phone: {clean_phone}")
        
        # Send OTP
        result = sms_service.send_otp(clean_phone)
        logger.info(f"SMS service result: {result}")
        
        if result['success']:
            return {
                "success": True,
                "message": result['message'],
                "phone_number": f"+91{clean_phone}"
            }
        else:
            logger.error(f"SMS service failed: {result['message']}")
            raise HTTPException(status_code=500, detail=result['message'])
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")

@router.post("/verify")
async def verify_otp(request: VerifyOTPRequest):
    """Verify OTP for phone number"""
    try:
        # Clean phone number
        clean_phone = request.phone_number.replace('+91', '').replace(' ', '').replace('-', '')
        
        # Verify OTP
        result = sms_service.verify_otp(clean_phone, request.otp)
        
        if result['success']:
            return {
                "success": True,
                "message": result['message'],
                "phone_number": f"+91{clean_phone}"
            }
        else:
            raise HTTPException(status_code=400, detail=result['message'])
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify OTP: {str(e)}")

@router.post("/resend")
async def resend_otp(request: SendOTPRequest):
    """Resend OTP to phone number"""
    return await send_otp(request)