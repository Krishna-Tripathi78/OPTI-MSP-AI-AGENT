import random
import string
from datetime import datetime, timedelta
from typing import Dict
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SMSService:
    def __init__(self):
        # Store OTPs temporarily (in production, use Redis or database)
        self.otp_storage: Dict[str, Dict] = {}
        
        # Twilio credentials
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_phone = os.getenv("TWILIO_PHONE_NUMBER")
        
        logger.info(f"SMS Service initialized with Twilio SID: {self.account_sid[:10] if self.account_sid else 'None'}...")
        logger.info(f"From phone number: {self.from_phone}")
        
    def generate_otp(self, length: int = 6) -> str:
        """Generate random OTP"""
        return ''.join(random.choices(string.digits, k=length))
    
    def send_otp(self, phone_number: str) -> Dict:
        """Send OTP to phone number"""
        try:
            # Generate OTP
            otp = self.generate_otp()
            logger.info(f"Generated OTP: {otp} for phone: {phone_number}")
            
            # Store OTP with expiry (5 minutes)
            self.otp_storage[phone_number] = {
                'otp': otp,
                'expires_at': datetime.now() + timedelta(minutes=5),
                'attempts': 0
            }
            
            # Try Twilio SMS
            if self.account_sid and self.auth_token and self.from_phone:
                try:
                    from twilio.rest import Client
                    
                    client = Client(self.account_sid, self.auth_token)
                    
                    message = client.messages.create(
                        body=f"Your OptiMSP verification code is: {otp}. Valid for 5 minutes.",
                        from_=self.from_phone,
                        to=f"+91{phone_number}"
                    )
                    
                    logger.info(f"Twilio SMS sent: {message.sid}")
                    return {
                        'success': True,
                        'message': f'OTP sent to +91{phone_number}',
                        'otp': otp  # Remove in production
                    }
                except Exception as e:
                    logger.error(f"Twilio error: {e}")
                    # Fallback: Return success with OTP for development/testing
                    logger.info(f"Fallback: OTP {otp} for +91{phone_number} (Twilio failed)")
                    return {
                        'success': True,
                        'message': f'OTP sent to +91{phone_number} (Demo mode: {otp})',
                        'otp': otp,
                        'demo_mode': True
                    }
            else:
                logger.info("Twilio credentials not configured - using demo mode")
                return {
                    'success': True,
                    'message': f'Demo OTP sent to +91{phone_number}: {otp}',
                    'otp': otp,
                    'demo_mode': True
                }
                
        except Exception as e:
            logger.error(f"SMS service error: {str(e)}")
            return {
                'success': False,
                'message': f'SMS service error: {str(e)}'
            }
    
    def verify_otp(self, phone_number: str, otp: str) -> Dict:
        """Verify OTP for phone number"""
        try:
            stored_data = self.otp_storage.get(phone_number)
            
            if not stored_data:
                return {
                    'success': False,
                    'message': 'No OTP found for this number'
                }
            
            # Check if OTP expired
            if datetime.now() > stored_data['expires_at']:
                del self.otp_storage[phone_number]
                return {
                    'success': False,
                    'message': 'OTP has expired'
                }
            
            # Check attempts
            if stored_data['attempts'] >= 3:
                del self.otp_storage[phone_number]
                return {
                    'success': False,
                    'message': 'Too many failed attempts'
                }
            
            # Verify OTP
            if stored_data['otp'] == otp:
                del self.otp_storage[phone_number]
                return {
                    'success': True,
                    'message': 'OTP verified successfully'
                }
            else:
                stored_data['attempts'] += 1
                return {
                    'success': False,
                    'message': 'Invalid OTP'
                }
                
        except Exception as e:
            return {
                'success': False,
                'message': f'Verification error: {str(e)}'
            }

# Global SMS service instance
sms_service = SMSService()