import React from 'react';
import { Tag } from 'antd';
import { AlertTriangle, ArrowDown, ArrowUp, Zap } from 'lucide-react';
import { TimeEntry } from '../types/project';
import { useTranslation } from 'react-i18next';

interface PriorityTagProps {
  priority: TimeEntry['priority'];
  className?: string;
}

export const PriorityTag: React.FC<PriorityTagProps> = ({ priority, className = '' }) => {
  const { t } = useTranslation();

  const getPriorityConfig = (priority: TimeEntry['priority']) => {
    switch (priority) {
      case 'low':
        return {
          color: 'default',
          icon: <ArrowDown size={14} />,
          text: t('task.priority.low')
        };
      case 'medium':
        return {
          color: 'blue',
          icon: <AlertTriangle size={14} />,
          text: t('task.priority.medium')
        };
      case 'high':
        return {
          color: 'orange',
          icon: <ArrowUp size={14} />,
          text: t('task.priority.high')
        };
      case 'urgent':
        return {
          color: 'red',
          icon: <Zap size={14} />,
          text: t('task.priority.urgent')
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <Tag 
      icon={config.icon}
      color={config.color}
      className={`inline-flex items-center gap-1 w-fit ${className}`}
    >
      {config.text}
    </Tag>
  );
};