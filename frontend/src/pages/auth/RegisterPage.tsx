import { useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Home, Briefcase } from 'lucide-react';
import BackButton from '../../components/common/BackButton';

// Declare global type for Google SDK
declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) { resolve(); return; } 
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google SDK'));
    document.head.appendChild(script);
  });
}

export default function RegisterPage() {
  // ?role=vendor preselects the Host account type (used by "Become a Host" links)
  const [searchParams] = useSearchParams();
  const initialRole: 'user' | 'vendor' = searchParams.get('role') === 'vendor' ? 'vendor' : 'user';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    role: initialRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | null>(null);
  
  const { register, oauthLogin } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userData = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        role: formData.role,
        businessName: formData.role === 'vendor' ? formData.businessName : undefined,
      });
      // Redirect based on selected role
      if (userData.role === 'vendor') {
        navigate('/vendor');
      } else if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useCallback(async () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Sign-In is not configured. Set VITE_GOOGLE_CLIENT_ID in your .env file.');
      return;
    }
    setError('');
    setSocialLoading('google');
    try {
      await loadGoogleScript();
      window.google!.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            await oauthLogin('google', {
              email: payload.email,
              name: payload.name,
              avatar: payload.picture,
              credential: response.credential,
            });
            navigate('/');
          } catch (err: any) {
            setError(err.response?.data?.error || 'Google login failed');
          } finally {
            setSocialLoading(null);
          }
        },
      });
      window.google!.accounts.id.prompt();
    } catch (err) {
      setError('Failed to load Google Sign-In. Please try again.');
      setSocialLoading(null);
    }
  }, [oauthLogin, navigate]);

    return (
    <div className="min-h-screen flex">
      {/* Back arrow â€” top-left corner */}
      <BackButton className="fixed left-4 top-4 z-50" />
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <span className="text-3xl font-bold text-slate-900">33v</span>
            <span className="text-sm text-slate-500">33veyora</span>
          </Link>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Create your account</h1>
          <p className="text-slate-500 mb-8">Start your journey with 33veyora</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:bg-white transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:bg-white transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone number <span className="text-slate-400">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:bg-white transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:bg-white transition-all"
                  placeholder="Create a password"
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
              <p className="mt-1.5 text-xs text-slate-400">Must be at least 8 characters</p>
            </div>
            
            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:bg-white transition-all"
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                />
              </div>
            </div>
            
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'user' })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'user'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Home className="h-6 w-6" />
                  <span className="font-medium text-sm">Book Stays</span>
                  <span className={`text-xs ${formData.role === 'user' ? 'text-slate-300' : 'text-slate-400'}`}>
                    Find experiences
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'vendor' })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'vendor'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Briefcase className="h-6 w-6" />
                  <span className="font-medium text-sm">Become a Host</span>
                  <span className={`text-xs ${formData.role === 'vendor' ? 'text-slate-300' : 'text-slate-400'}`}>
                    List your property
                  </span>
                </button>
              </div>
            </div>
            
            {/* Business Name â€” vendors only */}
            {formData.role === 'vendor' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Business / property name
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:bg-white transition-all"
                    placeholder="e.g., Himalayan Stays"
                    required
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Your host profile starts as pending â€” an admin verifies it before your listings go live.
                </p>
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                className="mt-1 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" 
                required 
              />
              <span className="text-sm text-slate-600">
                I agree to the{' '}
                <a href="#" className="text-slate-900 font-medium hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-slate-900 font-medium hover:underline">Privacy Policy</a>
              </span>
            </div>
            
            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
          
          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400">or continue with</span>
            </div>
          </div>
          
          {/* Google Login (only social provider) */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={socialLoading !== null}
            className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {socialLoading === 'google' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span className="text-sm font-medium text-slate-700">Continue with Google</span>
          </button>
          
          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-slate-900 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-[45%] relative">
        <img 
          src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80" 
          alt="Beautiful destination" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 to-slate-900/30"></div>
        
        {/* Overlay content */}
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Discover unique stays and experiences
          </h2>
          <p className="text-lg text-white/80 max-w-md">
            Join thousands of travellers finding their perfect escape across India
          </p>
          
          <div className="flex items-center gap-8 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-lg">ðŸ </span>
              </div>
              <div>
                <p className="text-white font-medium">2,400+</p>
                <p className="text-white/60 text-sm">Stays</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-lg">ðŸ”ï¸</span>
              </div>
              <div>
                <p className="text-white font-medium">890+</p>
                <p className="text-white/60 text-sm">Adventures</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-lg">â­</span>
              </div>
              <div>
                <p className="text-white font-medium">4.9</p>
                <p className="text-white/60 text-sm">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
