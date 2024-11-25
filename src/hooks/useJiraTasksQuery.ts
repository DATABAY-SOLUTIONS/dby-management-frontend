import { useQuery } from 'react-query';
import { jiraService } from '../services/jira';
import { JiraTask } from '../types/jira';

export const useJiraTasksQuery = (projectId: string) => {
    return useQuery<JiraTask[], Error>(
        ['jiraTasks', projectId],
        () => jiraService.getTasksForEpic(projectId),
        {
            enabled: !!projectId,
            staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
            cacheTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
            retry: 2,
            onError: (error) => {
                console.error('Failed to fetch Jira tasks:', error);
            }
        }
    );
};
