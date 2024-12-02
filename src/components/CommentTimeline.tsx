import React, { useEffect, useRef } from 'react';
import { Timeline, Avatar, Input, Button, Form } from 'antd';
import { Comment } from '../types/project';
import { JiraTaskComment } from '../types/jira';
import { useAuthStore } from '../store/authStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Send } from 'lucide-react';

dayjs.extend(relativeTime);

interface CommentTimelineProps {
    comments: (Comment | JiraTaskComment)[];
    onAddComment: (content: string) => void;
    loading?: boolean;
}

export const CommentTimeline: React.FC<CommentTimelineProps> = ({
                                                                    comments,
                                                                    onAddComment,
                                                                    loading
                                                                }) => {
    const [newComment, setNewComment] = React.useState('');
    const { user } = useAuthStore();
    const [commentForm] = Form.useForm();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [comments]);

    const handleSubmit = () => {
        if (newComment.trim()) {
            onAddComment(newComment.trim());
            setNewComment('');
            commentForm.resetFields();
        }
    };

    const timelineItems = [...comments]
        .sort((a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix())
        .map((comment) => {
            const isCurrentUser = user?.id === comment.userId;

            return {
                dot: (
                    <Avatar
                        src={comment.userAvatar}
                        size="small"
                        className={comment.isClient ? 'bg-orange-500' : isCurrentUser ? 'bg-green-500' : 'bg-blue-500'}
                    >
                        {comment.userName.charAt(0)}
                    </Avatar>
                ),
                children: (
                    <div className={`
            rounded-lg p-3 ml-2 max-w-[80%] transition-colors
            ${isCurrentUser ? 'ml-auto bg-green-50 hover:bg-green-100' :
                        comment.isClient ? 'bg-orange-50 hover:bg-orange-100' :
                            comment.isRead ? 'bg-gray-50 hover:bg-gray-100' : 'bg-blue-50 hover:bg-blue-100'}
          `}>
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="font-medium">{comment.userName}</span>
                                <span className="text-xs text-gray-500 ml-2">
                  {comment.isClient ? '(Client)' : '(Team)'}
                </span>
                            </div>
                            <span className="text-xs text-gray-500">
                {dayjs(comment.timestamp).fromNow()}
              </span>
                        </div>
                        <p className={`mt-1 ${isCurrentUser ? 'text-green-800' : 'text-gray-700'}`}>
                            {comment.content}
                        </p>
                    </div>
                )
            };
        });

    return (
        <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto px-4">
                <div className="min-h-full flex flex-col justify-end">
                    <Timeline items={timelineItems} />
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {user && (
                <div className="sticky bottom-0 bg-white pt-4 px-4 border-t">
                    <Form form={commentForm} onFinish={handleSubmit}>
                        <div className="flex gap-2">
                            <Form.Item
                                name="comment"
                                className="flex-1 mb-0"
                                rules={[{ required: true, message: 'Please enter a comment' }]}
                            >
                                <Input.TextArea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    autoSize={{ minRows: 1, maxRows: 4 }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit();
                                        }
                                    }}
                                />
                            </Form.Item>
                            <Form.Item className="mb-0">
                                <Button
                                    type="primary"
                                    icon={<Send size={16} />}
                                    onClick={handleSubmit}
                                    disabled={!newComment.trim()}
                                    loading={loading}
                                />
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            )}
        </div>
    );
};
