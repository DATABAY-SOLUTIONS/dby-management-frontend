import React, { useEffect } from 'react';
import { Layout, Spin, Empty } from 'antd';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProjectList } from '../components/ProjectList';
import { ProjectDetails } from '../components/ProjectDetails';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import { UserMenu } from '../components/UserMenu';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';

const { Header, Content } = Layout;

export const MainLayout: React.FC = () => {
    const { projects, isLoading, fetchProjects, getAccessibleProjects } = useProjectStore();
    const { theme } = useAuthStore();
    const { t } = useTranslation();

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const accessibleProjects = getAccessibleProjects();

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

            <Content className="p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <Routes>
                    <Route path="/" element={<ProjectList projects={accessibleProjects} isLoading={isLoading} />} />
                    <Route path="/projects/:projectId" element={<ProjectDetails />} />
                </Routes>
            </Content>
        </Layout>
    );
};
