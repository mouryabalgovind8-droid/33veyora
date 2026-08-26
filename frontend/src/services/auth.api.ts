import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface OAuthData {
  provider: 'google' | 'facebook';
  email: string;
  name: string;
  avatar?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  token: string;
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  oauthLogin: async (data: OAuthData): Promise<AuthResponse> => {
    const response = await api.post('/auth/oauth', data);
    return response.data;
  },

  updateProfile: async (data: Partial<RegisterData>) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/auth/password', data);
    return response.data;
  },
};
