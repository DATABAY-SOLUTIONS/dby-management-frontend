import React from 'react';
import { Card, Progress, Typography, Tag, Space } from 'antd';
import { Project } from '../types/project';
import { Clock, Euro, Hourglass, Lock } from 'lucide-react';

const { Title, Text } = Typography;

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const getProjectProgress = () => {
    if (project.type === 'time-based') {
      return Math.round((project.usedHours! / project.totalHours!) * 100);
    } else {
      const completedTasks = project.timeEntries.filter(entry => entry.status === 'done').length;
      const totalTasks = project.timeEntries.length;
      return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      case 'on-hold':
        return 'orange';
    }
  };

  const getProjectTypeTag = () => {
    if (project.type === 'time-based') {
      return (
        <Tag className="flex items-center gap-1 !px-2 !py-1">
          <Hourglass size={14} className="relative top-[-1px]" />
          <span>Bolsa de horas</span>
        </Tag>
      );
    }
    return (
      <Tag color="purple" className="flex items-center gap-1 !px-2 !py-1">
        <Lock size={14} className="relative top-[-1px]" />
        <span>Presupuesto cerrado</span>
      </Tag>
    );
  };

  const percentageComplete = getProjectProgress();

  return (
    <Card
      hoverable
      onClick={onClick}
      className="w-full transition-shadow duration-300 hover:shadow-lg"
    >
      <Space direction="vertical" className="w-full">
        <div className="flex justify-between items-start">
          <Title level={4} className="!mb-0">
            {project.name}
          </Title>
          <Space align="start">
            {getProjectTypeTag()}
            <Tag color={getStatusColor(project.status)} className="uppercase !px-2 !py-1">
              {project.status}
            </Tag>
          </Space>
        </div>
        
        <Text type="secondary">{project.client}</Text>
        
        <div className="mt-4">
          <Progress
            percent={percentageComplete}
            status={percentageComplete >= 90 ? 'success' : 'active'}
            className="mb-2"
          />
          
          <div className="flex justify-between items-center">
            {project.type === 'time-based' ? (
              <Space>
                <Clock size={16} className="text-gray-500" />
                <Text>{project.totalHours! - project.usedHours!} hours remaining</Text>
              </Space>
            ) : (
              <Space>
                <Euro size={16} className="text-gray-500" />
                <Text>€{project.budget?.toLocaleString()}</Text>
              </Space>
            )}
            
            <Space>
              <Euro size={16} className="text-gray-500" />
              <Text>
                {project.expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
              </Text>
            </Space>
          </div>
        </div>
      </Space>
    </Card>
  );
};