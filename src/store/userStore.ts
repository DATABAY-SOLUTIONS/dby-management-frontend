import { create } from 'zustand';
import { User } from '../types/user';
import { userService } from '../services/users';

interface UserState {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  updatePassword: (id: string, currentPassword: string, newPassword: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await userService.getUsers();
      set({ users });
    } catch (error) {
      set({ error: 'Failed to fetch users' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const newUser = await userService.createUser(userData);
      set((state) => ({
        users: [...state.users, newUser]
      }));
    } catch (error) {
      set({ error: 'Failed to create user' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: async (id, userData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await userService.updateUser(id, userData);
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? updatedUser : user
        ),
        selectedUser: state.selectedUser?.id === id ? updatedUser : state.selectedUser
      }));
    } catch (error) {
      set({ error: 'Failed to update user' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await userService.deleteUser(id);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        selectedUser: state.selectedUser?.id === id ? null : state.selectedUser
      }));
    } catch (error) {
      set({ error: 'Failed to delete user' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedUser: (user) => set({ selectedUser: user }),

  updatePassword: async (id, currentPassword, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await userService.updatePassword(id, currentPassword, newPassword);
    } catch (error) {
      set({ error: 'Failed to update password' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));