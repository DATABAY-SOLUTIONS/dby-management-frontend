import React from 'react';
import { Tag } from 'antd';
import { AlertCircle, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { TimeEntry } from '../types/project';
import { useTranslation } from 'react-i18next';

interface StatusTagProps {
  status: TimeEntry['status'];
  className?: string;
}

export const StatusTag: React.FC<StatusTagProps> = ({ status, className = '' }) => {
  const { t } = useTranslation();

  const getStatusConfig = (status: TimeEntry['status']) => {
    switch (status) {
      case 'pending-estimation':
        return {
          color: 'default',
          icon: <Clock size={14} />,
          text: t('task.status.pending-estimation')
        };
      case 'client-approved':
        return {
          color: 'processing',
          icon: <CheckCircle2 size={14} />,
          text: t('task.status.client-approved')
        };
      case 'in-progress':
        return {
          color: 'blue',
          icon: <Loader2 size={14} className="animate-spin" />,
          text: t('task.status.in-progress')
        };
      case 'blocked':
        return {
          color: 'error',
          icon: <XCircle size={14} />,
          text: t('task.status.blocked')
        };
      case 'done':
        return {
          color: 'success',
          icon: <CheckCircle2 size={14} />,
          text: t('task.status.done')
        };
    }
  };

  const config = getStatusConfig(status);

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