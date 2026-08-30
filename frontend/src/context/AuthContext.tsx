import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import api from '../services/api';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  oauthLogin: (provider: 'google' | 'facebook', userData: { email: string; name: string; avatar?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  businessName?: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);

  // Set token in axios headers FIRST, before any API calls
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // Token is already set in headers from the effect above
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          // Token is invalid or expired
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
      isInitialized.current = true;
    };

    // Only run on first mount
    if (!isInitialized.current) {
      checkAuth();
    }
  }, [token]);

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    const response = await api.post('/auth/login', { email, password });
    const { user: userData, token: authToken } = response.data;
    
    // Store token first
    localStorage.setItem('token', authToken);
    // Set axios header immediately
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    // Then update state
    setToken(authToken);
    setUser(userData);
    return userData;
  };

  // Register function
  const register = async (data: RegisterData): Promise<User> => {
    const response = await api.post('/auth/register', data);
    const { user: userData, token: authToken } = response.data;
    
    // Store token first
    localStorage.setItem('token', authToken);
    // Set axios header immediately
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    // Then update state
    setToken(authToken);
    setUser(userData);
    return userData;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  // OAuth login function
  const oauthLogin = async (provider: 'google' | 'facebook', userData: { email: string; name: string; avatar?: string }) => {
    const { authApi } = await import('../services/auth.api');
    const response = await authApi.oauthLogin({
      provider,
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar,
    });
    const { user: authUser, token: authToken } = response;
    localStorage.setItem('token', authToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    setToken(authToken);
    setUser(authUser as User);
  };

  // Update user data
  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, oauthLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
