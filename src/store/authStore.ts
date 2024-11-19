import { create } from 'zustand';
import { User } from '../types/user';
import { authService } from '../services/auth';
import { api } from '../config/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  unreadMessages: number;
  theme: 'light' | 'dark';
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserSettings: (settings: Partial<User['settings']>) => Promise<void>;
  setUnreadMessages: (count: number) => void;
  toggleTheme: () => void;
}

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  return savedTheme === 'dark' ? 'dark' : 'light';
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  unreadMessages: 0,
  theme: getInitialTheme(),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login({ email, password });
      // Set the token in localStorage and update the axios instance
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user, isAuthenticated: true, error: null });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Invalid credentials',
        user: null,
        isAuthenticated: false
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.logout();
      // Clear token from localStorage and axios instance
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      set({ error: 'Logout failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateUserSettings: async (settings) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await authService.updateUserSettings(settings);
      set((state) => ({
        user: updatedUser,
        isAuthenticated: true
      }));
    } catch (error) {
      set({ error: 'Failed to update settings' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setUnreadMessages: (count) => set({ unreadMessages: count }),

  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    return { theme: newTheme };
  }),
}));
