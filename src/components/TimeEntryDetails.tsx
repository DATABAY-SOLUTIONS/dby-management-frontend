import React from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Button, Tabs, Descriptions, Tag } from 'antd';
import { TimeEntry } from '../types/project';
import { CommentTimeline } from './CommentTimeline';
import { StatusTag } from './StatusTag';
import { PriorityTag } from './PriorityTag';
import { useAuthStore } from '../store/authStore';
import { Clock, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface TimeEntryDetailsProps {
  entry: TimeEntry | null;
  visible: boolean;
  onClose: () => void;
  onSave: (entry: TimeEntry) => void;
  onDelete?: (id: string) => void;
  onAddComment?: (entryId: string, content: string) => void;
}

export const TimeEntryDetails: React.FC<TimeEntryDetailsProps> = ({
  entry,
  visible,
  onClose,
  onSave,
  onDelete,
  onAddComment
}) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState('1');

  const handleAddComment = (content: string) => {
    if (entry && onAddComment) {
      onAddComment(entry.id, content);
    }
  };

  return (
    <Modal
      title={t('task.taskDetails')}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: '1',
            label: t('common.details'),
            children: entry ? (
              <div className="space-y-6">
                <Descriptions
                  bordered
                  column={1}
                  className="bg-gray-50 rounded-lg"
                  labelStyle={{ 
                    width: '200px',
                    padding: '16px',
                    backgroundColor: 'transparent'
                  }}
                  contentStyle={{
                    padding: '16px'
                  }}
                >
                  <Descriptions.Item label={t('common.description')}>
                    <div className="whitespace-pre-wrap">{entry.description}</div>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label={t('common.date')}>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      {dayjs(entry.date).format('MMMM D, YYYY')}
                    </div>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label={t('common.hours')}>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      {entry.hours} {t('common.hours')}
                    </div>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label={t('common.priority')}>
                    <PriorityTag priority={entry.priority} />
                  </Descriptions.Item>
                  
                  <Descriptions.Item label={t('common.status')}>
                    <StatusTag status={entry.status} />
                  </Descriptions.Item>
                </Descriptions>

                {user?.role === 'admin' && (
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    {onDelete && (
                      <Button danger onClick={() => onDelete(entry.id)}>
                        {t('common.delete')}
                      </Button>
                    )}
                    <Button onClick={() => setActiveTab('2')}>
                      {t('common.addComment')}
                    </Button>
                  </div>
                )}
              </div>
            ) : null
          },
          {
            key: '2',
            label: t('common.comments'),
            children: entry ? (
              <CommentTimeline
                comments={entry.comments || []}
                entry={entry}
                onAddComment={handleAddComment}
              />
            ) : null
          }
        ]}
      />
    </Modal>
  );
};