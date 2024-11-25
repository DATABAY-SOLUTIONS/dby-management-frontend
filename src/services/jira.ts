import { api, USE_MOCK_DATA } from '../config/api';
import { JiraEpic, JiraTask, JiraTaskComment, GetEpicsQuery } from '../types/jira';

const SIMULATE_DELAY = 800;

const simulateDelay = () =>
    USE_MOCK_DATA ? new Promise(resolve => setTimeout(resolve, SIMULATE_DELAY)) : Promise.resolve();

const mockEpics: JiraEpic[] = [
    {
        id: 'EPIC-1',
        key: 'PROJ-1',
        name: 'Platform Redesign',
        summary: 'Complete platform redesign and modernization',
        projectKey: 'PROJ'
    },
    {
        id: 'EPIC-2',
        key: 'PROJ-2',
        name: 'Mobile App Development',
        summary: 'Native mobile app development for iOS and Android',
        projectKey: 'PROJ'
    }
];

const mockTasks: JiraTask[] = [
    {
        id: '10741',
        key: 'DBY-364',
        summary: 'Añadir mejoras por parte de Alicia',
        description: {
            type: 'doc',
            version: 1,
            content: [
                {
                    type: 'mediaSingle',
                    attrs: {
                        width: 100,
                        layout: 'center'
                    },
                    content: [
                        {
                            type: 'media',
                            attrs: {
                                type: 'file',
                                id: '2b8a3105-5667-45b4-874c-2f81b095d5bf',
                                collection: '',
                                height: 711,
                                width: 605
                            }
                        }
                    ]
                }
            ]
        },
        status: 'Finalizada',
        assignee: {
            id: '5f197a0ee407a4001c8e1353',
            name: 'Marco Muñoz',
            email: 'marcomunozperez@gmail.com',
            avatarUrl: 'https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f197a0ee407a4001c8e1353/6b5a639b-8db5-49a3-8f81-eebc725bfbf8/48'
        },
        created: '2024-03-25T14:38:36.933+0000',
        updated: '2024-05-29T16:47:05.372+0000'
    },
    {
        id: '10740',
        key: 'DBY-363',
        summary: 'Mejorar visualización de archivos',
        description: {
            type: 'doc',
            version: 1,
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'Cambiar div a usar flex-wrap: wrap'
                        }
                    ]
                }
            ]
        },
        status: 'Finalizada',
        assignee: {
            id: '5f197a0ee407a4001c8e1353',
            name: 'Marco Muñoz',
            email: 'marcomunozperez@gmail.com',
            avatarUrl: 'https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f197a0ee407a4001c8e1353/6b5a639b-8db5-49a3-8f81-eebc725bfbf8/48'
        },
        created: '2024-03-25T14:38:25.631+0000',
        updated: '2024-05-29T16:47:05.630+0000'
    }
];

const mockComments: { [key: string]: JiraTaskComment[] } = {};

export const jiraService = {
    async getEpics(projectKey: string): Promise<JiraEpic[]> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            return mockEpics.filter(epic => epic.projectKey === projectKey);
        }
        const { data } = await api.get<JiraEpic[]>('/projects/jira/epics', {
            params: { projectKey }
        });
        return data;
    },

    async getEpicById(epicId: string): Promise<JiraEpic> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            const epic = mockEpics.find(e => e.id === epicId);
            if (!epic) throw new Error('Epic not found');
            return epic;
        }
        const { data } = await api.get<JiraEpic>(`/projects/jira/epics/${epicId}`);
        return data;
    },

    async getTasksForEpic(projectId: string): Promise<JiraTask[]> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            return mockTasks;
        }
        const { data } = await api.get<JiraTask[]>(`/projects/${projectId}/jira-tasks`);
        return data;
    },

    async getTaskComments(taskKey: string): Promise<JiraTaskComment[]> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            return mockComments[taskKey] || [];
        }
        const { data } = await api.get<JiraTaskComment[]>(`/projects/jira-tasks/${taskKey}/comments`);
        return data;
    },

    async addTaskComment(taskKey: string, content: string): Promise<JiraTaskComment> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            const comment: JiraTaskComment = {
                id: crypto.randomUUID(),
                jiraTaskId: mockTasks.find(t => t.key === taskKey)?.id || '',
                jiraTaskKey: taskKey,
                userId: '1',
                userName: 'John Developer',
                userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=faces',
                content,
                timestamp: new Date().toISOString(),
                isClient: false,
                isRead: true
            };
            mockComments[taskKey] = [...(mockComments[taskKey] || []), comment];
            return comment;
        }
        const { data } = await api.post<JiraTaskComment>(`/projects/jira-tasks/${taskKey}/comments`, { content });
        return data;
    },

    async updateComment(commentId: string, updateData: { content?: string; isRead?: boolean }): Promise<void> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            return;
        }
        await api.patch(`/projects/comments/${commentId}`, updateData);
    },

    async deleteComment(commentId: string): Promise<void> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            return;
        }
        await api.delete(`/projects/comments/${commentId}`);
    },

    async markCommentAsRead(commentId: string): Promise<void> {
        if (USE_MOCK_DATA) {
            await simulateDelay();
            return;
        }
        await api.post(`/projects/comments/${commentId}/read`);
    }
};
