import { api, USE_MOCK_DATA } from '../config/api';
import { Comment, UnreadCommentsGroup } from '../types/comment';
import { JiraTaskComment } from '../types/jira';

const SIMULATE_DELAY = 800;

const simulateDelay = () =>
    USE_MOCK_DATA ? new Promise(resolve => setTimeout(resolve, SIMULATE_DELAY)) : Promise.resolve();

const mockUnreadComments: UnreadCommentsGroup[] = [
    {
        taskKey: 'PROJ-123',
        taskSummary: 'Implement user authentication',
        type: 'jira',
        comments: [
            {
                id: '1',
                jiraTaskId: '123',
                jiraTaskKey: 'PROJ-123',
                userId: '2',
                userName: 'Sarah Client',
                userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=faces',
                content: 'Could you please provide an update on this task?',
                timestamp: new Date().toISOString(),
                isClient: true,
                isRead: false
            }
        ]
    },
    {
        timeEntryId: '456',
        timeEntryDescription: 'API Integration work',
        type: 'timeEntry',
        comments: [
            {
                id: '2',
                timeEntryId: '456',
                userId: '3',
                userName: 'John Manager',
                userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=faces',
                content: 'Please provide more details about the hours spent.',
                timestamp: new Date().toISOString(),
                isClient: false,
                isRead: false
            }
        ]
    }
];

export const commentService = {
    async getUnreadComments(): Promise<UnreadCommentsGroup[]> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            return mockUnreadComments;
        }
        const { data } = await api.get<UnreadCommentsGroup[]>('/comments/unread');
        return data;
    },

    async markCommentAsRead(commentId: string, type: 'jira' | 'timeEntry'): Promise<void> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            return;
        }
        await api.patch(`/comments/${commentId}/read`);
    },

    async markAllCommentsAsRead(groupId: string, type: 'jira' | 'timeEntry'): Promise<void> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            return;
        }
        const endpoint = type === 'jira'
            ? `/comments/task/${groupId}/read-all`
            : `/comments/time-entry/${groupId}/read-all`;
        await api.patch(endpoint);
    }
};
