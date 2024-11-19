import { api, USE_MOCK_DATA } from '../config/api';
import { User } from '../types/user';

const SIMULATE_DELAY = 800;

const simulateDelay = () => 
  USE_MOCK_DATA ? new Promise(resolve => setTimeout(resolve, SIMULATE_DELAY)) : Promise.resolve();

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01',
    lastLogin: '2024-02-20',
    settings: {
      theme: 'light',
      notifications: true,
      emailUpdates: true
    }
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'manager',
    status: 'active',
    createdAt: '2024-01-15',
    lastLogin: '2024-02-19',
    settings: {
      theme: 'dark',
      notifications: true,
      emailUpdates: false
    }
  }
];

export const userService = {
  async getUsers(): Promise<User[]> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      return mockUsers;
    }
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  async getUser(id: string): Promise<User> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      const user = mockUsers.find(u => u.id === id);
      if (!user) throw new Error('User not found');
      return user;
    }
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Promise<User> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      const newUser: User = {
        ...userData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        lastLogin: undefined
      };
      mockUsers.push(newUser);
      return newUser;
    }
    const { data } = await api.post<User>('/users', userData);
    return data;
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found');
      
      const updatedUser = {
        ...mockUsers[index],
        ...userData,
        id // Ensure ID doesn't change
      };
      mockUsers[index] = updatedUser;
      return updatedUser;
    }
    const { data } = await api.patch<User>(`/users/${id}`, userData);
    return data;
  },

  async deleteUser(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found');
      mockUsers.splice(index, 1);
      return;
    }
    await api.delete(`/users/${id}`);
  },

  async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      return;
    }
    await api.post(`/users/${id}/password`, { currentPassword, newPassword });
  }
};