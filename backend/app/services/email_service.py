"""Email Service for sending password reset emails"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from typing import Optional

class EmailService:
    def __init__(self):
        # Using Gmail SMTP for demo - in production use proper email service
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = os.getenv("SENDER_EMAIL", "optimsp.ai@gmail.com")
        self.sender_password = os.getenv("SENDER_PASSWORD", "your-app-password")
    
    async def send_password_reset_email(self, recipient_email: str, otp: str) -> bool:
        """Send password reset email with OTP"""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = "OptiMSP AI - Password Reset"
            message["From"] = self.sender_email
            message["To"] = recipient_email
            
            # Create HTML content
            html = f"""
            <html>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0;">OptiMSP AI</h1>
                  <p style="color: white; margin: 5px 0;">Password Reset Request</p>
                </div>
                
                <div style="padding: 30px; background: #f9f9f9;">
                  <h2 style="color: #333;">Reset Your Password</h2>
                  <p style="color: #666; line-height: 1.6;">
                    You requested a password reset for your OptiMSP AI account. 
                    Use the OTP below to reset your password:
                  </p>
                  
                  <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #667eea; font-size: 32px; letter-spacing: 4px; margin: 0;">{otp}</h1>
                    <p style="color: #999; margin: 10px 0 0 0;">This OTP expires in 10 minutes</p>
                  </div>
                  
                  <p style="color: #666; line-height: 1.6;">
                    If you didn't request this password reset, please ignore this email.
                    Your password will remain unchanged.
                  </p>
                  
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="color: #999; font-size: 12px;">
                      This is an automated email from OptiMSP AI. Please do not reply to this email.
                    </p>
                  </div>
                </div>
              </body>
            </html>
            """
            
            # Attach HTML content
            html_part = MIMEText(html, "html")
            message.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(message)
            
            return True
            
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False

# Global instance
email_service = EmailService()