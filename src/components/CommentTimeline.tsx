import React from 'react';
import { Timeline, Avatar, Input, Button, Form, Tag } from 'antd';
import { Comment } from '../types/project';
import { JiraTaskComment } from '../types/jira';
import { useAuthStore } from '../store/authStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Send, History } from 'lucide-react';

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

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
      commentForm.resetFields();
    }
  };

  const timelineItems = [...comments]
      .sort((a, b) => dayjs(b.timestamp).unix() - dayjs(a.timestamp).unix())
      .map((comment) => ({
        dot: (
            <Avatar
                src={comment.userAvatar}
                size="small"
                className={comment.isClient ? 'bg-orange-500' : 'bg-blue-500'}
            >
              {comment.userName.charAt(0)}
            </Avatar>
        ),
        children: (
            <div className={`rounded-lg p-3 ml-2 ${comment.isRead ? 'bg-gray-50' : 'bg-blue-50'}`}>
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
              <p className="mt-1 text-gray-700">{comment.content}</p>
            </div>
        )
      }));

  return (
      <div className="space-y-4">
        <Timeline items={timelineItems} />

        {user && (
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
        )}
      </div>
  );
};
