import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';
import api from '../../services/api';

type Step = 'email' | 'otp' | 'reset' | 'success';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await api.post('/auth/forgot-password', { email });
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await api.post('/auth/verify-otp', { email, otp: otpString });
      setResetToken(response.data.resetToken);
      setStep('reset');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await api.post('/auth/reset-password', { resetToken, newPassword });
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };
  
  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };
  
  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      await api.post('/auth/forgot-password', { email });
      setError('');
      alert('New code sent!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <span className="text-3xl font-bold text-slate-900">33v</span>
            <span className="text-sm text-slate-500">33veyora</span>
          </Link>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}
          
          {/* Step 1: Email */}
          {step === 'email' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <KeyRound className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Forgot password?</h1>
                  <p className="text-slate-500">No worries, we'll send you reset instructions</p>
                </div>
              </div>
              
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:bg-white transition-all"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      Send reset code
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
          
          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button 
                  onClick={() => setStep('email')}
                  className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Enter verification code</h1>
                  <p className="text-slate-500">We sent a 6-digit code to {email}</p>
                </div>
              </div>
              
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      name={`otp-${index}`}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:bg-white transition-all"
                      maxLength={1}
                      required
                    />
                  ))}
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      Verify code
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
                
                <p className="text-center text-sm text-slate-500">
                  Didn't receive the code?{' '}
                  <button 
                    type="button" 
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-slate-900 font-medium hover:underline disabled:opacity-50"
                  >
                    Resend
                  </button>
                </p>
              </form>
            </>
          )}
          
          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Lock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Set new password</h1>
                  <p className="text-slate-500">Must be at least 8 characters</p>
                </div>
              </div>
              
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">New password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:bg-white transition-all"
                      placeholder="Enter new password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:bg-white transition-all"
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      Reset password
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
          
          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Password reset successful</h1>
              <p className="text-slate-500 mb-8">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                Sign in
              </button>
            </div>
          )}
          
          {step !== 'success' && (
            <p className="mt-8 text-center text-sm text-slate-500">
              Remember your password?{' '}
              <Link to="/login" className="text-slate-900 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
      
      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-[45%] relative">
        <img 
          src="https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=2000&q=80" 
          alt="Travel" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 to-slate-900/30"></div>
        
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Secure account recovery
          </h2>
          <p className="text-lg text-white/80 max-w-md">
            We'll help you get back into your account quickly and securely
          </p>
        </div>
      </div>
    </div>
  );
}
