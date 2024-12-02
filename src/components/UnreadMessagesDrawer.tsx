import React from 'react';
import { Drawer, List, Empty, Spin, Tag, Timeline, Space } from 'antd';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { jiraService, UnreadTaskComments } from '../services/jira';
import { MessageSquare, ExternalLink, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface UnreadMessagesDrawerProps {
    visible: boolean;
    onClose: () => void;
}

export const UnreadMessagesDrawer: React.FC<UnreadMessagesDrawerProps> = ({
                                                                              visible,
                                                                              onClose
                                                                          }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: unreadComments = [], isLoading } = useQuery(
        'unreadComments',
        () => jiraService.getUnreadComments(),
        {
            enabled: visible,
            refetchOnWindowFocus: false,
            refetchInterval: 30000 // Refresh every 30 seconds
        }
    );

    const handleTaskClick = (projectId: string, taskKey: string) => {
        navigate(`/projects/${projectId}`);
        sessionStorage.setItem('openTaskKey', taskKey);
        onClose();
    };

    return (
        <Drawer
            title={t('menu.messages')}
            placement="right"
            onClose={onClose}
            open={visible}
            width={500}
        >
            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Spin />
                </div>
            ) : unreadComments.length === 0 ? (
                <Empty
                    image={<MessageSquare size={48} className="text-gray-300" />}
                    description="No unread messages"
                />
            ) : (
                <List
                    dataSource={unreadComments}
                    renderItem={(item: UnreadTaskComments) => (
                        <List.Item className="block">
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Space size={2}>
                                        <Tag
                                            color="blue"
                                            className="flex items-center gap-1 cursor-pointer hover:opacity-80"
                                            onClick={() => handleTaskClick(item.projectId, item.taskKey)}
                                        >
                                            <ExternalLink size={12} />
                                            {item.taskKey}
                                        </Tag>
                                        <Tag color="red">{item.unreadCount} unread</Tag>
                                    </Space>
                                </div>
                                <div
                                    className="font-medium cursor-pointer hover:text-blue-500"
                                    onClick={() => handleTaskClick(item.projectId, item.taskKey)}
                                >
                                    {item.taskSummary}
                                </div>
                                <div className="text-sm text-gray-500 mb-3">{item.projectName}</div>

                                <Timeline
                                    mode="left"
                                    items={[...item.formattedComments]
                                        .slice(0, 20)
                                        .reverse() // Reverse to show latest at bottom
                                        .map(comment => ({
                                            dot: <Clock size={16} className="text-blue-500" />,
                                            children: (
                                                <div
                                                    className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                                    onClick={() => handleTaskClick(item.projectId, item.taskKey)}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-medium">{comment.userName}</span>
                                                        <span className="text-xs text-gray-500">
                              {dayjs(comment.timestamp).fromNow()}
                            </span>
                                                    </div>
                                                    <div className="text-sm">{comment.content}</div>
                                                </div>
                                            )
                                        }))}
                                />
                            </div>
                        </List.Item>
                    )}
                />
            )}
        </Drawer>
    );
};
