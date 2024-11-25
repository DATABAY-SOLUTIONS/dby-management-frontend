import React, { useState } from 'react';
import { Tabs, Button, Table, Tag, Input, Select, Space } from 'antd';
import { Plus, ExternalLink, Search, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Project, TimeEntry, Expense } from '../types/project';
import { JiraTask } from '../types/jira';
import { TimeTrackingDisplay } from './TimeTrackingDisplay';
import dayjs from 'dayjs';
import type { HourRequest } from '../services/hourRequests';

const { Option } = Select;

interface ProjectTabsProps {
    project: Project;
    jiraTasks: JiraTask[];
    hourRequests: HourRequest[];
    isLoadingJiraTasks: boolean;
    isLoadingHourRequests: boolean;
    onAddTimeEntry: (projectId: string, entry: Omit<TimeEntry, 'id' | 'projectId' | 'comments'>) => Promise<void>;
    onAddExpense: (projectId: string, expense: Omit<Expense, 'id' | 'projectId'>) => Promise<void>;
    onSelectTimeEntry: (entry: TimeEntry) => void;
    onSelectExpense: (expense: Expense) => void;
    onSelectJiraTask: (task: JiraTask) => void;
    isLoading?: boolean;
}

export const ProjectTabs: React.FC<ProjectTabsProps> = ({
                                                            project,
                                                            jiraTasks,
                                                            hourRequests = [],
                                                            isLoadingJiraTasks,
                                                            isLoadingHourRequests,
                                                            onAddTimeEntry,
                                                            onAddExpense,
                                                            onSelectTimeEntry,
                                                            onSelectExpense,
                                                            onSelectJiraTask,
                                                            isLoading
                                                        }) => {
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
    const [hourRequestStatusFilter, setHourRequestStatusFilter] = useState<string>('all');

    const assignees = React.useMemo(() => {
        const uniqueAssignees = new Set(
            jiraTasks
                .filter(task => task.assignee)
                .map(task => task.assignee!.name)
        );
        return Array.from(uniqueAssignees);
    }, [jiraTasks]);

    const filteredTasks = React.useMemo(() => {
        return jiraTasks.filter(task => {
            const matchesSearch =
                task.key.toLowerCase().includes(searchText.toLowerCase()) ||
                task.summary.toLowerCase().includes(searchText.toLowerCase());

            const matchesStatus = statusFilter.length === 0 || statusFilter.includes(task.status);
            const matchesAssignee = assigneeFilter.length === 0 ||
                (task.assignee && assigneeFilter.includes(task.assignee.name));

            return matchesSearch && matchesStatus && matchesAssignee;
        });
    }, [jiraTasks, searchText, statusFilter, assigneeFilter]);

    const filteredHourRequests = hourRequests.filter(request =>
        hourRequestStatusFilter === 'all' || request.status === hourRequestStatusFilter
    );

    const hourRequestColumns = [
        {
            title: t('common.hourRequests.fields.hours'),
            dataIndex: 'hours',
            key: 'hours',
            render: (hours: number) => `${hours}h`
        },
        {
            title: t('common.hourRequests.fields.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: HourRequest['status']) => {
                const config = {
                    pending: { color: 'default', icon: <Clock size={14} /> },
                    approved: { color: 'success', icon: <CheckCircle size={14} /> },
                    rejected: { color: 'error', icon: <XCircle size={14} /> }
                };
                return (
                    <Tag
                        icon={config[status].icon}
                        color={config[status].color}
                        className="uppercase"
                    >
                        {t(`common.hourRequests.status.${status}`)}
                    </Tag>
                );
            }
        },
        {
            title: t('common.hourRequests.fields.neededBy'),
            dataIndex: 'neededBy',
            key: 'neededBy',
            render: (date: string) => dayjs(date).format('MMM D, YYYY')
        },
        {
            title: t('common.hourRequests.fields.requested'),
            dataIndex: 'requestedAt',
            key: 'requestedAt',
            render: (date: string) => dayjs(date).format('MMM D, YYYY HH:mm')
        },
        {
            title: t('common.hourRequests.fields.requestedBy'),
            key: 'requester',
            render: (_, record: HourRequest) => (
                <div className="flex items-center gap-2">
                    {record.requester.avatar ? (
                        <img
                            src={record.requester.avatar}
                            alt={record.requester.name}
                            className="w-8 h-8 rounded-full"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            {record.requester.name.charAt(0)}
                        </div>
                    )}
                    <div>
                        <div className="font-medium">{record.requester.name}</div>
                        <div className="text-xs text-gray-500">{record.requester.email}</div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <Tabs
            items={[
                {
                    key: '1',
                    label: t('common.tasks'),
                    children: (
                        <div className="space-y-4">
                            <div className="flex gap-4 items-center">
                                <Input
                                    prefix={<Search size={16} className="text-gray-400" />}
                                    placeholder="Search tasks..."
                                    value={searchText}
                                    onChange={e => setSearchText(e.target.value)}
                                    className="max-w-md"
                                />
                                <Select
                                    mode="multiple"
                                    placeholder="Filter by status"
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    className="min-w-[200px]"
                                >
                                    <Option value="Finalizada">Completed</Option>
                                    <Option value="En progreso">In Progress</Option>
                                    <Option value="Pendiente">Pending</Option>
                                </Select>
                                <Select
                                    mode="multiple"
                                    placeholder="Filter by assignee"
                                    value={assigneeFilter}
                                    onChange={setAssigneeFilter}
                                    className="min-w-[200px]"
                                >
                                    {assignees.map(name => (
                                        <Option key={name} value={name}>{name}</Option>
                                    ))}
                                </Select>
                            </div>
                            <Table
                                columns={[
                                    {
                                        title: 'Key',
                                        dataIndex: 'key',
                                        key: 'key',
                                        render: (key: string) => (
                                            <Tag color="blue" className="inline-flex items-center gap-1">
                                                <ExternalLink size={12} className="flex-shrink-0" />
                                                {key}
                                            </Tag>
                                        )
                                    },
                                    {
                                        title: 'Summary',
                                        dataIndex: 'summary',
                                        key: 'summary',
                                        width: '40%'
                                    },
                                    {
                                        title: 'Time Tracking',
                                        key: 'timeTracking',
                                        render: (_: any, record: JiraTask) => (
                                            <TimeTrackingDisplay timeTracking={record.timeTracking} showProgress={false} />
                                        )
                                    },
                                    {
                                        title: 'Status',
                                        dataIndex: 'status',
                                        key: 'status',
                                        render: (status: string) => (
                                            <Tag color={
                                                status === 'Finalizada' ? 'success' :
                                                    status === 'En progreso' ? 'processing' :
                                                        'default'
                                            }>
                                                {status}
                                            </Tag>
                                        )
                                    },
                                    {
                                        title: 'Assignee',
                                        key: 'assignee',
                                        render: (_: any, record: JiraTask) => record.assignee ? (
                                            <div className="flex items-center gap-2">
                                                {record.assignee.avatarUrl ? (
                                                    <img
                                                        src={record.assignee.avatarUrl}
                                                        alt={record.assignee.name}
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                                        {record.assignee.name.charAt(0)}
                                                    </div>
                                                )}
                                                <span>{record.assignee.name}</span>
                                            </div>
                                        ) : '-'
                                    }
                                ]}
                                dataSource={filteredTasks}
                                loading={isLoadingJiraTasks}
                                rowKey="id"
                                onRow={(record) => ({
                                    onClick: () => onSelectJiraTask(record),
                                    style: { cursor: 'pointer' }
                                })}
                            />
                        </div>
                    )
                },
                {
                    key: '2',
                    label: t('project.expenses'),
                    children: (
                        <div className="space-y-4">
                            <Button
                                type="primary"
                                icon={<Plus size={16} />}
                                onClick={() => onAddExpense(project.id, {
                                    description: '',
                                    amount: 0,
                                    category: '',
                                    date: dayjs().format('YYYY-MM-DD')
                                })}
                            >
                                {t('project.addExpense')}
                            </Button>
                            <Table
                                columns={[
                                    {
                                        title: t('common.description'),
                                        dataIndex: 'description',
                                        key: 'description'
                                    },
                                    {
                                        title: t('common.amount'),
                                        dataIndex: 'amount',
                                        key: 'amount',
                                        render: (amount: number) => `€${amount.toFixed(2)}`
                                    },
                                    {
                                        title: t('common.category'),
                                        dataIndex: 'category',
                                        key: 'category'
                                    },
                                    {
                                        title: t('common.date'),
                                        dataIndex: 'date',
                                        key: 'date',
                                        render: (date: string) => dayjs(date).format('MMM D, YYYY')
                                    },
                                    {
                                        title: t('common.recurring'),
                                        key: 'recurring',
                                        render: (text: string, record: Expense) => record.isRecurring ? (
                                            <Tag color="blue">{record.recurringInterval}</Tag>
                                        ) : null
                                    }
                                ]}
                                dataSource={project.expenses}
                                rowKey="id"
                                onRow={(record) => ({
                                    onClick: () => onSelectExpense(record),
                                    style: { cursor: 'pointer' }
                                })}
                            />
                        </div>
                    )
                },
                {
                    key: '3',
                    label: t('common.hourRequests'),
                    children: (
                        <div className="space-y-4">
                            <Select
                                value={hourRequestStatusFilter}
                                onChange={setHourRequestStatusFilter}
                                className="min-w-[200px]"
                            >
                                <Option value="all">{t('common.hourRequests.status.all')}</Option>
                                <Option value="pending">{t('common.hourRequests.status.pending')}</Option>
                                <Option value="approved">{t('common.hourRequests.status.approved')}</Option>
                                <Option value="rejected">{t('common.hourRequests.status.rejected')}</Option>
                            </Select>

                            <Table
                                columns={hourRequestColumns}
                                dataSource={filteredHourRequests}
                                loading={isLoadingHourRequests}
                                rowKey="id"
                                expandable={{
                                    expandedRowRender: (record) => (
                                        <div className="py-4 space-y-4">
                                            <div>
                                                <div className="font-medium mb-2">{t('common.hourRequests.fields.reason')}:</div>
                                                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                                                    {record.reason}
                                                </div>
                                            </div>

                                            {record.status !== 'pending' && (
                                                <div>
                                                    <div className="font-medium mb-2">{t('common.hourRequests.fields.reviewDetails')}:</div>
                                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                                        {record.reviewedBy && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-500">{t('common.hourRequests.fields.reviewedBy')}:</span>
                                                                <div className="flex items-center gap-2">
                                                                    {record.reviewer?.name || record.reviewedBy}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {record.reviewedAt && (
                                                            <div>
                                                                <span className="text-gray-500">{t('common.hourRequests.fields.reviewedOn')}:</span>{' '}
                                                                {dayjs(record.reviewedAt).format('MMM D, YYYY HH:mm')}
                                                            </div>
                                                        )}
                                                        {record.reviewNotes && (
                                                            <div>
                                                                <span className="text-gray-500">{t('common.hourRequests.fields.notes')}:</span>
                                                                <div className="mt-1 pl-4 border-l-2 border-gray-200">
                                                                    {record.reviewNotes}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                }}
                            />
                        </div>
                    )
                }
            ]}
        />
    );
};
