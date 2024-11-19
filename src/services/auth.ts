import { api, USE_MOCK_DATA } from '../config/api';
import { User } from '../types/user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

const SIMULATE_DELAY = 800;

const simulateDelay = () =>
    USE_MOCK_DATA ? new Promise(resolve => setTimeout(resolve, SIMULATE_DELAY)) : Promise.resolve();

const demoUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'demo@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces',
  role: 'admin',
  settings: {
    theme: 'light',
    notifications: true,
    emailUpdates: false,
  },
  status: 'active',
  createdAt: '2024-01-01',
  lastLogin: '2024-02-20'
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      if (credentials.email === 'demo@example.com' && credentials.password === 'demo') {
        const demoResponse = {
          user: demoUser,
          token: 'demo-token'
        };
        localStorage.setItem('auth_token', demoResponse.token);
        return demoResponse;
      }
      throw new Error('Invalid credentials');
    }

    try {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      // Only set the token after successful API call
      if (data && data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      return data;
    } catch (error) {
      // Clear any existing token on login failure
      localStorage.removeItem('auth_token');
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      if (!USE_MOCK_DATA) {
        await api.post('/auth/logout');
      } else {
        await simulateDelay();
      }
    } finally {
      // Always clear the token, even if the API call fails
      localStorage.removeItem('auth_token');
    }
  },

  async getCurrentUser(): Promise<User> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      const token = localStorage.getItem('auth_token');
      if (token === 'demo-token') {
        return demoUser;
      }
      throw new Error('Not authenticated');
    }

    try {
      const { data } = await api.get<User>('/auth/me');
      return data;
    } catch (error) {
      // Clear token if user fetch fails
      localStorage.removeItem('auth_token');
      throw error;
    }
  },

  async updateUserSettings(settings: Partial<User['settings']>): Promise<User> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      return {
        ...demoUser,
        settings: {
          ...demoUser.settings,
          ...settings
        }
      };
    }
    const { data } = await api.patch<User>('/auth/settings', { settings });
    return data;
  }
};
