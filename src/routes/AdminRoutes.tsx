import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProjectManagement } from '../pages/admin/ProjectManagement';
import { ExpenseManagement } from '../pages/admin/ExpenseManagement';
import { UserManagement } from '../pages/admin/UserManagement';
import { useAuthStore } from '../store/authStore';
import { getRolePermissions } from '../types/user';

export const AdminRoutes: React.FC = () => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const permissions = getRolePermissions(user.role);
  
  if (!permissions.canManageProjects && !permissions.canManageUsers && !permissions.canManageExpenses) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {permissions.canManageProjects && (
          <Route path="projects" element={<ProjectManagement />} />
        )}
        {permissions.canManageExpenses && (
          <Route path="expenses" element={<ExpenseManagement />} />
        )}
        {permissions.canManageUsers && (
          <Route path="users" element={<UserManagement />} />
        )}
        <Route path="*" element={<Navigate to="projects" replace />} />
      </Route>
    </Routes>
  );
};