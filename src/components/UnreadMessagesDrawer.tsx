import React, { useEffect, useState } from 'react';
import { Drawer, List, Button, Empty, Spin, message, Badge, Avatar, Tag } from 'antd';
import { MessageSquare, CheckCircle, ExternalLink, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { commentService } from '../services/comments';
import { UnreadCommentsGroup } from '../types/comment';
import { useAuthStore } from '../store/authStore';
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
    const { setUnreadMessages } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [unreadGroups, setUnreadGroups] = useState<UnreadCommentsGroup[]>([]);

    const fetchUnreadComments = async () => {
        setLoading(true);
        try {
            const groups = await commentService.getUnreadComments();
            setUnreadGroups(groups);
            setUnreadMessages(groups.reduce((total, group) => total + group.comments.length, 0));
        } catch (error) {
            message.error(t('messages.failedToFetch'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchUnreadComments();
        }
    }, [visible]);

    const handleMarkAsRead = async (commentId: string, type: 'jira' | 'timeEntry') => {
        try {
            await commentService.markCommentAsRead(commentId, type);
            await fetchUnreadComments();
        } catch (error) {
            message.error(t('messages.failedToMark'));
        }
    };

    const handleMarkAllAsRead = async (groupId: string, type: 'jira' | 'timeEntry') => {
        try {
            await commentService.markAllCommentsAsRead(groupId, type);
            await fetchUnreadComments();
        } catch (error) {
            message.error(t('messages.failedToMarkAll'));
        }
    };

    return (
        <Drawer
            title={
                <div className="flex items-center gap-2">
                    <MessageSquare size={20} />
                    <span>{t('messages.title')}</span>
                    {unreadGroups.length > 0 && (
                        <Badge
                            count={unreadGroups.reduce((total, group) => total + group.comments.length, 0)}
                            className="ml-2"
                        />
                    )}
                </div>
            }
            placement="right"
            onClose={onClose}
            open={visible}
            width={400}
        >
            {loading ? (
                <div className="flex justify-center p-8">
                    <Spin />
                </div>
            ) : unreadGroups.length === 0 ? (
                <Empty
                    image={<MessageSquare size={64} className="text-gray-300" />}
                    description={t('messages.noUnread')}
                />
            ) : (
                <List
                    dataSource={unreadGroups}
                    className="divide-y"
                    renderItem={(group) => (
                        <div className="py-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        {group.type === 'jira' ? (
                                            <>
                                                <ExternalLink size={16} className="text-blue-500" />
                                                <span className="font-medium">{group.taskKey}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Clock size={16} className="text-blue-500" />
                                                <span className="font-medium">
                          {t('messages.timeEntry')}
                        </span>
                                            </>
                                        )}
                                        <Tag color={group.type === 'jira' ? 'blue' : 'green'}>
                                            {group.type === 'jira' ? t('messages.jiraTask') : t('messages.timeEntry')}
                                        </Tag>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {group.type === 'jira' ? group.taskSummary : group.timeEntryDescription}
                                    </p>
                                </div>
                                <Button
                                    type="text"
                                    icon={<CheckCircle size={16} />}
                                    onClick={() => handleMarkAllAsRead(
                                        group.type === 'jira' ? group.taskKey! : group.timeEntryId!,
                                        group.type
                                    )}
                                >
                                    {t('messages.markAllAsRead')}
                                </Button>
                            </div>

                            <List
                                itemLayout="horizontal"
                                dataSource={group.comments}
                                renderItem={(comment) => (
                                    <List.Item
                                        className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                        actions={[
                                            <Button
                                                key="read"
                                                type="text"
                                                size="small"
                                                icon={<CheckCircle size={14} />}
                                                onClick={() => handleMarkAsRead(comment.id, group.type)}
                                            >
                                                {t('messages.markAsRead')}
                                            </Button>
                                        ]}
                                    >
                                        <div className="flex gap-3">
                                            <Avatar
                                                src={comment.userAvatar}
                                                className={comment.isClient ? 'bg-orange-500' : 'bg-blue-500'}
                                            >
                                                {comment.userName.charAt(0)}
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="font-medium">{comment.userName}</span>
                                                        <span className="text-xs text-gray-500 ml-2">
                              {comment.isClient ? t('messages.client') : t('messages.team')}
                            </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                            {dayjs(comment.timestamp).fromNow()}
                          </span>
                                                </div>
                                                <p className="text-sm text-gray-700 mt-1 break-words">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </div>
                    )}
                />
            )}
        </Drawer>
    );
};
