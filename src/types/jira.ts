export interface JiraEpic {
    id: string;
    key: string;
    name: string;
    summary: string;
    projectKey: string;
}

export interface TimeTracking {
    originalEstimate: string;
    remainingEstimate: string;
    timeSpent: string;
    originalEstimateSeconds: number;
    remainingEstimateSeconds: number;
    timeSpentSeconds: number;
}

export interface JiraTask {
    id: string;
    key: string;
    summary: string;
    description: string | {
        type: string;
        version: number;
        content: any[];
    };
    status: string;
    assignee?: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string;
    };
    created: string;
    updated: string;
    timeTracking: TimeTracking;
}

export interface JiraTaskComment {
    id: string;
    jiraTaskId: string;
    jiraTaskKey: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    timestamp: string;
    isClient: boolean;
    isRead: boolean;
}

export interface GetEpicsQuery {
    projectKey: string;
}
