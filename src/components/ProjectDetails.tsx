import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, Modal, message, Alert } from 'antd';
import {
    AlertTriangle,
    ExternalLink,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Project, TimeEntry, Expense } from '../types/project';
import { JiraTask } from '../types/jira';
import { TimeEntryDetails } from './TimeEntryDetails';
import { ExpenseDetails } from './ExpenseDetails';
import { RequestHoursModal } from './RequestHoursModal';
import { JiraTaskDetails } from './JiraTaskDetails';
import { HoursChart } from './HoursChart';
import { ProjectMetrics } from './ProjectMetrics';
import { ProjectTabs } from './ProjectTabs';
import { useJiraTasksQuery } from '../hooks/useJiraTasksQuery';
import { hourRequestService } from '../services/hourRequests';
import dayjs from 'dayjs';

interface ProjectDetailsProps {
    project: Project;
    onAddTimeEntry: (projectId: string, entry: Omit<TimeEntry, 'id' | 'projectId' | 'comments'>) => Promise<void>;
    onAddExpense: (projectId: string, expense: Omit<Expense, 'id' | 'projectId'>) => Promise<void>;
    onUpdateTimeEntry: (projectId: string, entry: TimeEntry) => Promise<void>;
    onUpdateExpense: (projectId: string, expense: Expense) => Promise<void>;
    onAddComment: (projectId: string, timeEntryId: string, content: string) => Promise<void>;
    isLoading?: boolean;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
                                                                  project,
                                                                  onAddTimeEntry,
                                                                  onAddExpense,
                                                                  onUpdateTimeEntry,
                                                                  onUpdateExpense,
                                                                  onAddComment,
                                                                  isLoading
                                                              }) => {
    const { t } = useTranslation();
    const [selectedTimeEntry, setSelectedTimeEntry] = useState<TimeEntry | null>(null);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [selectedJiraTask, setSelectedJiraTask] = useState<JiraTask | null>(null);
    const [isRequestHoursModalVisible, setIsRequestHoursModalVisible] = useState(false);
    const [hourRequests, setHourRequests] = useState<any[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const { data: jiraTasks = [], isLoading: isLoadingJiraTasks } = useJiraTasksQuery(project.id);

    useEffect(() => {
        const fetchHourRequests = async () => {
            setLoadingRequests(true);
            try {
                const requests = await hourRequestService.getProjectHourRequests(project.id);
                setHourRequests(requests);
            } catch (error) {
                console.error('Failed to fetch hour requests:', error);
            } finally {
                setLoadingRequests(false);
            }
        };

        fetchHourRequests();
    }, [project.id]);

    const totalTimeSpent = jiraTasks.reduce((total, task) =>
        total + task.timeTracking.timeSpentSeconds / 3600, 0);

    const getTotalEstimatedHours = () => {
        return jiraTasks.reduce((total, task) =>
            total + task.timeTracking.originalEstimateSeconds / 3600, 0);
    };

    const getTimeEntriesFromJiraTasks = () => {
        return jiraTasks.map(task => ({
            id: task.id,
            projectId: project.id,
            description: task.summary,
            hours: task.timeTracking.timeSpentSeconds / 3600,
            date: task.updated,
            status: 'done',
            priority: 'medium',
            comments: []
        }));
    };

    const getProjectProgress = () => {
        const completedTasks = jiraTasks.filter(task => task.status === 'Finalizada').length;
        return jiraTasks.length > 0 ? Math.round((completedTasks / jiraTasks.length) * 100) : 0;
    };

    const getLatestHourRequest = () => {
        if (!hourRequests.length) return null;
        return hourRequests.reduce((latest, current) =>
            dayjs(current.requestedAt).isAfter(dayjs(latest.requestedAt)) ? current : latest
        );
    };

    const renderHourRequestAlert = () => {
        const latestRequest = getLatestHourRequest();
        if (!latestRequest) return null;

        // Only show alert for requests within the last 7 days if approved/rejected
        if (latestRequest.status !== 'pending') {
            const reviewDate = dayjs(latestRequest.reviewedAt);
            if (dayjs().diff(reviewDate, 'days') > 7) return null;
        }

        const alertProps = {
            pending: {
                type: 'warning' as const,
                icon: <Clock className="text-amber-500" />,
                message: t('common.hourRequests.alerts.pendingReview'),
                description: t('common.hourRequests.alerts.requestSubmitted', { hours: latestRequest.hours })
            },
            approved: {
                type: 'success' as const,
                icon: <CheckCircle className="text-green-500" />,
                message: t('common.hourRequests.alerts.approved'),
                description: t('common.hourRequests.alerts.requestApproved', { hours: latestRequest.hours })
            },
            rejected: {
                type: 'error' as const,
                icon: <XCircle className="text-red-500" />,
                message: t('common.hourRequests.alerts.rejected'),
                description: t('common.hourRequests.alerts.requestRejected', { hours: latestRequest.hours })
            }
        }[latestRequest.status];

        return (
            <Alert
                {...alertProps}
                className="mb-6"
                showIcon
            />
        );
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold mb-2">{project.name}</h1>
                        <p className="text-gray-500">{project.client}</p>
                    </div>
                    <Space size="middle" className="flex-shrink-0">
                        <Space size={4}>
                            <Tag color={
                                project.status === 'active' ? 'green' :
                                    project.status === 'completed' ? 'blue' : 'orange'
                            } className="uppercase !px-2 !py-1">
                                {project.status.toUpperCase()}
                            </Tag>
                            {project.jiraEpicKey && (
                                <Tag className="flex items-center gap-1 !px-2 !py-1" color="blue">
                                    <ExternalLink size={14} className="flex-shrink-0" />
                                    {project.jiraEpicKey}
                                </Tag>
                            )}
                        </Space>
                        {project.type === 'time-based' && (
                            <Button
                                type="primary"
                                onClick={() => setIsRequestHoursModalVisible(true)}
                            >
                                {t('project.requestMoreHours')}
                            </Button>
                        )}
                    </Space>
                </div>

                {renderHourRequestAlert()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card className="shadow-sm">
                        <ProjectMetrics
                            totalHours={project.totalHours}
                            consumedHours={totalTimeSpent}
                            estimatedHours={getTotalEstimatedHours()}
                            completedTasks={jiraTasks.filter(task => task.status === 'Finalizada').length}
                            totalTasks={jiraTasks.length}
                            projectStatus={project.status}
                            progress={getProjectProgress()}
                        />
                    </Card>

                    <Card className="shadow-sm">
                        <HoursChart timeEntries={getTimeEntriesFromJiraTasks()} />
                    </Card>
                </div>

                <ProjectTabs
                    project={project}
                    jiraTasks={jiraTasks}
                    hourRequests={hourRequests}
                    isLoadingJiraTasks={isLoadingJiraTasks}
                    isLoadingHourRequests={loadingRequests}
                    onAddTimeEntry={onAddTimeEntry}
                    onAddExpense={onAddExpense}
                    onSelectTimeEntry={setSelectedTimeEntry}
                    onSelectExpense={setSelectedExpense}
                    onSelectJiraTask={setSelectedJiraTask}
                    isLoading={isLoading}
                />
            </Card>

            <TimeEntryDetails
                entry={selectedTimeEntry}
                visible={!!selectedTimeEntry}
                onClose={() => setSelectedTimeEntry(null)}
                onSave={(entry) => {
                    onUpdateTimeEntry(project.id, entry);
                    setSelectedTimeEntry(null);
                }}
                onAddComment={(entryId, content) => {
                    onAddComment(project.id, entryId, content);
                }}
            />

            <ExpenseDetails
                expense={selectedExpense}
                visible={!!selectedExpense}
                onClose={() => setSelectedExpense(null)}
            />

            <JiraTaskDetails
                task={selectedJiraTask}
                visible={!!selectedJiraTask}
                onClose={() => setSelectedJiraTask(null)}
            />

            <RequestHoursModal
                visible={isRequestHoursModalVisible}
                onClose={() => setIsRequestHoursModalVisible(false)}
                onSubmit={async (request) => {
                    try {
                        await hourRequestService.createHourRequest(project.id, request);
                        message.success(t('common.hourRequests.messages.createSuccess'));
                        setIsRequestHoursModalVisible(false);
                        // Refresh hour requests
                        const updatedRequests = await hourRequestService.getProjectHourRequests(project.id);
                        setHourRequests(updatedRequests);
                    } catch (error) {
                        message.error(t('common.hourRequests.messages.createError'));
                    }
                }}
                currentHours={project.totalHours!}
                remainingHours={project.totalHours! - totalTimeSpent}
                projectId={project.id}
            />
        </div>
    );
};
