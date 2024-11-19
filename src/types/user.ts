export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
    emailUpdates: boolean;
  };
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

export interface UserPermissions {
  canManageProjects: boolean;
  canManageUsers: boolean;
  canManageExpenses: boolean;
  canApproveHours: boolean;
  canViewReports: boolean;
}

export const getRolePermissions = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'admin':
      return {
        canManageProjects: true,
        canManageUsers: true,
        canManageExpenses: true,
        canApproveHours: true,
        canViewReports: true,
      };
    case 'manager':
      return {
        canManageProjects: true,
        canManageUsers: false,
        canManageExpenses: true,
        canApproveHours: true,
        canViewReports: true,
      };
    default:
      return {
        canManageProjects: false,
        canManageUsers: false,
        canManageExpenses: false,
        canApproveHours: false,
        canViewReports: false,
      };
  }
};