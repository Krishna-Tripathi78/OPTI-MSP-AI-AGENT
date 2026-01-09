import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Eye, EyeOff, User, Lock, Mail, AlertCircle, CheckCircle, Smartphone, Chrome, Phone } from 'lucide-react';
import { firebaseAuth } from '../services/firebaseAuth';
import { gsap } from 'gsap';
import { ForgotPassword } from './ForgotPassword';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
}

export default function FirebaseLoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  console.log('FirebaseLoginModal rendered, isOpen:', isOpen);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotPasswordButton, setShowForgotPasswordButton] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current && cardRef.current) {
      gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(cardRef.current, { scale: 0.8, y: 50, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.7)" });
    }
  }, [isOpen]);

  if (!isOpen) {
    console.log('Modal not open, returning null');
    return null;
  }

  if (showForgotPassword) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <ForgotPassword onBack={() => setShowForgotPassword(false)} />
      </div>
    );
  }

  console.log('Modal should be visible now');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let user;
      if (isRegisterMode) {
        user = await firebaseAuth.registerWithEmail(email, password, name);
        setSuccess('Account created! Please check your email for verification link.');
        // Don't close modal immediately, show success message
        setTimeout(() => {
          onClose();
        }, 3000);
        return;
      } else {
        user = await firebaseAuth.loginWithEmail(email, password);
        
        // Check if email is verified
        if (!user.emailVerified) {
          setError('Please verify your email before signing in. Check your inbox for verification link.');
          setIsLoading(false);
          return;
        }
      }
      onLogin(user);
      onClose();
    } catch (error: any) {
      // Check for specific Firebase error codes
      if (error.code === 'auth/email-already-in-use') {
        setError('User already exists. Please sign in instead.');
        // Auto-switch to login mode
        setTimeout(() => {
          setIsRegisterMode(false);
          setError('');
        }, 2000);
      } else if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials.');
        setShowForgotPasswordButton(true);
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please create an account.');
        setShowForgotPasswordButton(true);
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
        setShowForgotPasswordButton(true);
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
        setShowForgotPasswordButton(true);
      }
    }

    setIsLoading(false);
  };

  const sendOTP = async () => {
    if (!phone) {
      setError('Please enter phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await firebaseAuth.sendOTP(phone);
      setConfirmationResult(result);
      setShowOtpInput(true);
      setSuccess(`OTP sent to ${phone}`);
    } catch (error: any) {
      if (error.code === 'auth/invalid-phone-number') {
        setError('Please enter a valid phone number.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    }

    setIsLoading(false);
  };

  const verifyOTP = async () => {
    if (!otp || !confirmationResult) {
      setError('Please enter OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const user = await firebaseAuth.verifyOTP(confirmationResult, otp);
      onLogin(user);
      onClose();
    } catch (error: any) {
      if (error.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check and try again.');
      } else if (error.code === 'auth/code-expired') {
        setError('OTP has expired. Please request a new one.');
      } else {
        setError('OTP verification failed. Please try again.');
      }
    }

    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting Google sign-in...');
      const user = await firebaseAuth.signInWithGoogle();
      console.log('Google sign-in successful:', user);
      onLogin(user);
      onClose();
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups and try again.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else if (error.code === 'auth/configuration-not-found') {
        setError('Firebase configuration error. Please contact support.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    }

    setIsLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setOtp('');
    setError('');
    setSuccess('');
    setShowOtpInput(false);
    setShowPhoneInput(false);
    setConfirmationResult(null);
    setShowForgotPasswordButton(false);
  };

  const switchMode = () => {
    setIsRegisterMode(!isRegisterMode);
    resetForm();
  };

  return (
    <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <Card ref={cardRef} className="w-full max-w-md bg-background shadow-2xl border-0">
        <CardHeader className="relative pb-6 bg-gradient-to-r from-primary/10 to-primary/5">
          <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-6 w-6" />
          </button>
          <CardTitle className="text-center text-2xl font-bold text-foreground">
            {showPhoneInput ? 'Phone Login' : (isRegisterMode ? 'Create Account' : 'Welcome Back')}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5 px-8 pb-8">
          {showPhoneInput ? (
            <div className="space-y-4">
              {!showOtpInput ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <Button onClick={sendOTP} disabled={isLoading} className="w-full mt-3">
                    {isLoading ? 'Sending...' : 'Send OTP'}
                  </Button>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">Enter OTP</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button onClick={verifyOTP} disabled={isLoading} className="flex-1">
                      {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                    <Button onClick={sendOTP} variant="outline" disabled={isLoading}>
                      Resend
                    </Button>
                  </div>
                </div>
              )}
              
              <Button onClick={() => { setShowPhoneInput(false); resetForm(); }} variant="ghost" className="w-full">
                Back to Email Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {isRegisterMode && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-11 pr-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                        placeholder="Enter 10-digit mobile number"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transition-all">
                {isLoading ? 'Loading...' : (isRegisterMode ? 'Create Account' : 'Sign In')}
              </Button>
            </form>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}

          {!showPhoneInput && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-4 text-muted-foreground font-medium">or</span>
                </div>
              </div>

              <Button type="button" variant="outline" onClick={handleGoogleLogin} disabled={isLoading} className="w-full py-3 border-2 border-border hover:bg-accent hover:border-accent-foreground transition-all font-medium">
                <Chrome className="w-5 h-5 mr-2" />
                {isLoading ? 'Connecting...' : 'Continue with Google'}
              </Button>

              <div className="text-center pt-4 space-y-2">
                {!isRegisterMode && showForgotPasswordButton && (
                  <Button
                    variant="ghost"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-primary hover:text-primary/90 hover:bg-accent font-medium text-sm p-2"
                  >
                    Forgot Password?
                  </Button>
                )}
                
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
                  </p>
                  <Button variant="ghost" onClick={switchMode} className="text-primary hover:text-primary/90 hover:bg-accent font-medium text-sm p-2">
                    {isRegisterMode ? 'Sign In' : 'Create Account'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <div id="recaptcha-container"></div>
    </div>
  );
}