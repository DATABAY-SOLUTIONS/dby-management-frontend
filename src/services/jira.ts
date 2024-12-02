import { api, USE_MOCK_DATA } from '../config/api';
import { JiraEpic, JiraTask, JiraTaskComment, GetEpicsQuery } from '../types/jira';

const SIMULATE_DELAY = 800;

const simulateDelay = () =>
    USE_MOCK_DATA ? new Promise(resolve => setTimeout(resolve, SIMULATE_DELAY)) : Promise.resolve();

export interface UnreadTaskComments {
    taskKey: string;
    taskSummary: string;
    projectId: string;
    projectName: string;
    unreadCount: number;
    formattedComments: {
        id: string;
        content: string;
        timestamp: string;
        userName: string;
    }[];
}

export const jiraService = {
    async getEpics(projectKey: string): Promise<JiraEpic[]> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            return [];
        }
        const { data } = await api.get<JiraEpic[]>('/projects/jira/epics', {
            params: { projectKey }
        });
        return data;
    },

    async getTasksForEpic(projectId: string): Promise<JiraTask[]> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            return [];
        }
        const { data } = await api.get<JiraTask[]>(`/projects/${projectId}/jira-tasks`);
        return data;
    },

    async getTaskComments(taskKey: string): Promise<JiraTaskComment[]> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            return [];
        }
        const { data } = await api.get<JiraTaskComment[]>(`/projects/jira-tasks/${taskKey}/comments`);
        return data;
    },

    async addTaskComment(taskKey: string, content: string): Promise<JiraTaskComment> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            return {} as JiraTaskComment;
        }
        const { data } = await api.post<JiraTaskComment>(`/projects/jira-tasks/${taskKey}/comments`, { content });
        return data;
    },

    async getUnreadComments(): Promise<UnreadTaskComments[]> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            return [];
        }
        const { data } = await api.get<UnreadTaskComments[]>('/projects/jira-tasks/comments/unread');
        return data;
    },

    async markCommentAsRead(commentId: string): Promise<JiraTaskComment> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            return {} as JiraTaskComment;
        }
        const { data } = await api.patch<JiraTaskComment>(`/projects/jira-tasks/comments/${commentId}/read`);
        return data;
    },

    async markAllCommentsAsRead(taskKey: string): Promise<void> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            return;
        }
        await api.patch(`/projects/jira-tasks/${taskKey}/comments/read-all`);
    }
};
