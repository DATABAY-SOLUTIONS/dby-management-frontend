import React, { useEffect } from 'react';
import { Layout, Spin, Empty } from 'antd';
import { Routes, Route } from 'react-router-dom';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectDetails } from '../components/ProjectDetails';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import { UserMenu } from '../components/UserMenu';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTranslation } from 'react-i18next';
import { ProjectCardSkeleton } from '../components/LoadingSkeletons';
import { Lock } from 'lucide-react';

const { Header, Content } = Layout;

export const MainLayout: React.FC = () => {
  const { projects, selectedProject, setSelectedProject, addTimeEntry, addExpense, updateTimeEntry, updateExpense, addComment, isLoading, fetchProjects, getAccessibleProjects } = useProjectStore();
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
          <Route path="/" element={
            selectedProject ? (
              <div className="space-y-4">
                <h2 
                  className="text-xl font-semibold cursor-pointer hover:text-blue-500 dark:text-white transition-colors duration-300"
                  onClick={() => setSelectedProject(null)}
                >
                  ← {t('common.backToProjects')}
                </h2>
                <ProjectDetails
                  project={selectedProject}
                  onAddTimeEntry={addTimeEntry}
                  onAddExpense={addExpense}
                  onUpdateTimeEntry={updateTimeEntry}
                  onUpdateExpense={updateExpense}
                  onAddComment={addComment}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold dark:text-white transition-colors duration-300">
                  {t('common.activeProjects')}
                </h2>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <ProjectCardSkeleton key={i} />)}
                  </div>
                ) : accessibleProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accessibleProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={() => setSelectedProject(project)}
                      />
                    ))}
                  </div>
                ) : (
                  <Empty
                    image={<Lock size={64} className="text-gray-300" />}
                    description={
                      <span className="text-gray-500">
                        You don't have access to any projects yet.
                        Contact your administrator to get assigned to projects.
                      </span>
                    }
                  />
                )}
              </div>
            )
          } />
        </Routes>
      </Content>
    </Layout>
  );
};