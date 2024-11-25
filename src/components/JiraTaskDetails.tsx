import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Tabs } from 'antd';
import { JiraTask, JiraTaskComment } from '../types/jira';
import { CommentTimeline } from './CommentTimeline';
import { TimeTrackingDisplay } from './TimeTrackingDisplay';
import { ExternalLink, Calendar, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { jiraService } from '../services/jira';
import dayjs from 'dayjs';

interface JiraTaskDetailsProps {
    task: JiraTask | null;
    visible: boolean;
    onClose: () => void;
}

export const JiraTaskDetails: React.FC<JiraTaskDetailsProps> = ({
                                                                    task,
                                                                    visible,
                                                                    onClose
                                                                }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = React.useState('1');
    const [comments, setComments] = useState<JiraTaskComment[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (task && visible) {
            loadComments();
        }
    }, [task, visible]);

    const loadComments = async () => {
        if (!task) return;
        setLoading(true);
        try {
            const taskComments = await jiraService.getTaskComments(task.key);
            setComments(taskComments);
        } catch (error) {
            console.error('Failed to load comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (content: string) => {
        if (!task) return;
        try {
            await jiraService.addTaskComment(task.key, content);
            await loadComments();
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    const getDescriptionText = (description: JiraTask['description']): string => {
        if (typeof description === 'string') return description;

        if (description?.content) {
            return description.content
                .map(block => {
                    if (block.type === 'paragraph' && block.content) {
                        return block.content
                            .map(item => item.type === 'text' ? item.text : '')
                            .join('');
                    }
                    return '';
                })
                .filter(text => text)
                .join('\n');
        }

        return 'No description available';
    };

    return (
        <Modal
            title="Jira Task Details"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            {task && (
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: '1',
                            label: t('common.details'),
                            children: (
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
                                        <Descriptions.Item label="Key">
                                            <Tag color="blue" className="inline-flex items-center gap-1">
                                                <ExternalLink size={14} className="flex-shrink-0" />
                                                {task.key}
                                            </Tag>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Summary">
                                            {task.summary}
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Description">
                                            <div className="whitespace-pre-wrap">
                                                {getDescriptionText(task.description)}
                                            </div>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Time Tracking">
                                            <TimeTrackingDisplay timeTracking={task.timeTracking} />
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Status">
                                            <Tag color={
                                                task.status === 'Finalizada' ? 'success' :
                                                    task.status === 'En progreso' ? 'processing' :
                                                        'default'
                                            }>
                                                {task.status}
                                            </Tag>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Assignee">
                                            {task.assignee ? (
                                                <div className="flex items-center gap-2">
                                                    {task.assignee.avatarUrl ? (
                                                        <img
                                                            src={task.assignee.avatarUrl}
                                                            alt={task.assignee.name}
                                                            className="w-6 h-6 rounded-full"
                                                        />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                                            {task.assignee.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span>{task.assignee.name}</span>
                                                </div>
                                            ) : (
                                                'Unassigned'
                                            )}
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Created">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-400" />
                                                {dayjs(task.created).format('MMMM D, YYYY HH:mm')}
                                            </div>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Updated">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-gray-400" />
                                                {dayjs(task.updated).format('MMMM D, YYYY HH:mm')}
                                            </div>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </div>
                            )
                        },
                        {
                            key: '2',
                            label: t('common.comments'),
                            children: (
                                <CommentTimeline
                                    comments={comments}
                                    onAddComment={handleAddComment}
                                    loading={loading}
                                />
                            )
                        }
                    ]}
                />
            )}
        </Modal>
    );
};
