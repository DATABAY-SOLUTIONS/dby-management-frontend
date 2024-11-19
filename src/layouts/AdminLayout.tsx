import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { getRolePermissions } from '../types/user';
import { UserMenu } from '../components/UserMenu';
import { ThemeToggle } from '../components/ThemeToggle';
import { 
  Users, 
  Briefcase, 
  CreditCard,
  LayoutDashboard
} from 'lucide-react';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, theme } = useAuthStore();
  
  const permissions = getRolePermissions(user?.role || 'user');

  const menuItems = [
    permissions.canManageProjects && {
      key: 'projects',
      icon: <Briefcase size={16} />,
      label: t('admin.menu.projects')
    },
    permissions.canManageExpenses && {
      key: 'expenses',
      icon: <CreditCard size={16} />,
      label: t('admin.menu.expenses')
    },
    permissions.canManageUsers && {
      key: 'users',
      icon: <Users size={16} />,
      label: t('admin.menu.users')
    }
  ].filter(Boolean);

  // If no current path is selected, default to the first available menu item
  const currentPath = location.pathname.split('/')[2] || menuItems[0]?.key || 'projects';

  return (
    <Layout className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <Header className="flex items-center justify-between px-8 bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <img 
            src="https://databay.solutions/wp-content/uploads/2024/08/Sin-titulo-2908-%C3%97-628-px-600-%C3%97-600-px-300-%C3%97-600-px-600-%C3%97-300-px-1.webp" 
            alt="Logo" 
            className="h-8 w-auto"
          />
          <h1 className="text-lg font-semibold m-0 dark:text-white transition-colors duration-300">
            {t('common.appTitle')}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </Header>

      <Layout>
        <Sider
          theme="light"
          className="border-r border-gray-200"
          width={250}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="text-blue-500" size={20} />
              <Title level={4} className="!m-0 dark:text-white">{t('admin.title')}</Title>
            </div>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[currentPath]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            className="border-r-0"
          />
        </Sider>
        <Content className="p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};