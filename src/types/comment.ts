import { TimeEntry } from './project';
import { JiraTaskComment } from './jira';

export interface Comment {
    id: string;
    timeEntryId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    timestamp: string;
    isClient: boolean;
    isRead: boolean;
    jiraTaskId?: string;
    jiraTaskKey?: string;
    timeEntry?: TimeEntry;
}

export interface UnreadCommentsGroup {
    taskKey?: string;
    taskSummary?: string;
    timeEntryId?: string;
    timeEntryDescription?: string;
    comments: (Comment | JiraTaskComment)[];
    type: 'jira' | 'timeEntry';
}
