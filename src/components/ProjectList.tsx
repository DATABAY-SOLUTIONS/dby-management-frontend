import React from 'react';
import { Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { Project } from '../types/project';
import { ProjectCard } from './ProjectCard';
import { ProjectCardSkeleton } from './LoadingSkeletons';

interface ProjectListProps {
    projects: Project[];
    isLoading: boolean;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, isLoading }) => {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <Empty
                image={<Lock size={64} className="text-gray-300" />}
                description={
                    <span className="text-gray-500">
            You don't have access to any projects yet.
            Contact your administrator to get assigned to projects.
          </span>
                }
            />
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold dark:text-white transition-colors duration-300">
                {t('common.activeProjects')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    );
};
