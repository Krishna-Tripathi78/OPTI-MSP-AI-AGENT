import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Phone } from 'lucide-react';

interface ForgotPasswordProps {
  onBack: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setMessage('Password reset email sent successfully! Check your inbox.');
      } else {
        setMessage(data.detail || 'Failed to send reset email');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:8000/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phone
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setOtpSent(true);
        setMessage(`OTP sent to +91${phone}`);
      } else {
        setMessage(data.detail || 'Failed to send OTP');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:8000/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phone,
          otp: otp
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setMessage('Phone verified successfully!');
      } else {
        setMessage(data.detail || 'Invalid OTP');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/otp/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phone
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`OTP resent to +91${phone}`);
      } else {
        setMessage(data.detail || 'Failed to resend OTP');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle>{method === 'email' ? 'Reset Password' : 'Phone Login'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!success ? (
          <>
            {!otpSent ? (
              <>
                {/* Method Selection */}
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant={method === 'email' ? 'default' : 'outline'}
                    onClick={() => setMethod('email')}
                    className="flex-1"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    type="button"
                    variant={method === 'phone' ? 'default' : 'outline'}
                    onClick={() => setMethod('phone')}
                    className="flex-1"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Phone
                  </Button>
                </div>

                {method === 'email' ? (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Sending...' : 'Send Reset Email'}
                    </Button>
                    
                    {/* Resend verification email button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        setLoading(true);
                        setMessage('');
                        try {
                          const { firebaseAuth } = await import('../services/firebaseAuth');
                          const result = await firebaseAuth.resendEmailVerification();
                          if (result.success) {
                            setMessage(result.message);
                            setSuccess(true);
                          } else {
                            setMessage(result.message);
                          }
                        } catch (error) {
                          setMessage('Failed to send verification email');
                        }
                        setLoading(false);
                      }}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Sending...' : 'Resend Email Verification'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                          +91
                        </span>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="6307813602"
                          maxLength={10}
                          className="rounded-l-none"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Real OTP will be sent to your mobile number
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading || phone.length !== 10}>
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </Button>
                  </form>
                )}
              </>
            ) : (
              /* OTP Verification */
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium">Enter OTP</h3>
                  <p className="text-sm text-gray-600">Enter 6-digit OTP</p>
                </div>
                <div>
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleResendOtp} disabled={loading} className="flex-1">
                    Resend
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setOtpSent(false)} className="flex-1">
                    Back to Phone Login
                  </Button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-green-600">
              {method === 'email' ? (
                <Mail className="w-12 h-12 mx-auto mb-2" />
              ) : (
                <Phone className="w-12 h-12 mx-auto mb-2" />
              )}
              <p className="font-medium">{method === 'email' ? 'Email Sent!' : 'Phone Verified!'}</p>
            </div>
            <p className="text-sm text-gray-600">
              {method === 'email' 
                ? 'Check your email for password reset instructions.'
                : 'Phone number verified successfully!'}
            </p>
            <Button onClick={onBack} className="w-full">
              Back to Login
            </Button>
          </div>
        )}

        {message && (
          <p className={`text-sm text-center ${
            success ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
};