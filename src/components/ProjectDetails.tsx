import React, { useState } from 'react';
import { Card, Tabs, Typography, Table, Button, message, Progress, Space, Radio, Tag } from 'antd';
import { Line } from 'react-chartjs-2';
import { TimeEntry, Expense, Project } from '../types/project';
import { TimeEntryDetails } from './TimeEntryDetails';
import { ExpenseDetails } from './ExpenseDetails';
import { RequestHoursModal } from './RequestHoursModal';
import { ClientTaskRequest } from './ClientTaskRequest';
import { ProjectDetailsSkeleton } from './LoadingSkeletons';
import { useTranslation } from 'react-i18next';
import { PlusCircle, Clock, AlertTriangle, ChevronLeft, ChevronRight, Hourglass, Lock, Euro } from 'lucide-react';
import { StatusTag } from './StatusTag';
import { PriorityTag } from './PriorityTag';
import dayjs from 'dayjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type TimeScale = 'daily' | 'monthly' | 'yearly';

const getTimeRange = (timeScale: TimeScale, offset: number) => {
  const now = dayjs();
  switch (timeScale) {
    case 'daily':
      return {
        start: now.subtract(30 + offset * 30, 'days'),
        end: now.subtract(offset * 30, 'days'),
        format: 'MMM D'
      };
    case 'monthly':
      return {
        start: now.subtract(12 + offset * 12, 'months').startOf('month'),
        end: now.subtract(offset * 12, 'months').endOf('month'),
        format: 'MMM YYYY'
      };
    case 'yearly':
      return {
        start: now.subtract(5 + offset * 5, 'years').startOf('year'),
        end: now.subtract(offset * 5, 'years').endOf('year'),
        format: 'YYYY'
      };
  }
};

interface ProjectDetailsProps {
  project: Project;
  isLoading?: boolean;
  onAddTimeEntry: (entry: Omit<TimeEntry, 'id' | 'projectId' | 'comments'>) => void;
  onAddExpense: (expense: Omit<Expense, 'id' | 'projectId'>) => void;
  onUpdateTimeEntry: (entry: TimeEntry) => void;
  onUpdateExpense: (expense: Expense) => void;
  onAddComment: (timeEntryId: string, content: string) => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  isLoading,
  onAddTimeEntry,
  onAddExpense,
  onUpdateTimeEntry,
  onUpdateExpense,
  onAddComment
}) => {
  const [selectedTimeEntry, setSelectedTimeEntry] = useState<TimeEntry | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [requestHoursVisible, setRequestHoursVisible] = useState(false);
  const [newTaskVisible, setNewTaskVisible] = useState(false);
  const [timeScale, setTimeScale] = useState<TimeScale>('daily');
  const [dateOffset, setDateOffset] = useState(0);
  const { t } = useTranslation();

  if (isLoading || !project) {
    return <ProjectDetailsSkeleton />;
  }

  const getProjectProgress = () => {
    if (project.type === 'time-based') {
      return Math.round((project.usedHours! / project.totalHours!) * 100);
    } else {
      const completedTasks = project.timeEntries.filter(entry => entry.status === 'done').length;
      const totalTasks = project.timeEntries.length;
      return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    }
  };

  const getProjectTypeTag = () => {
    if (project.type === 'time-based') {
      return (
        <Tag className="flex items-center gap-1 !px-2 !py-1">
          <Hourglass size={14} className="relative top-[-1px]" />
          <span>Bolsa de horas</span>
        </Tag>
      );
    }
    return (
      <Tag color="purple" className="flex items-center gap-1 !px-2 !py-1">
        <Lock size={14} className="relative top-[-1px]" />
        <span>Presupuesto cerrado</span>
      </Tag>
    );
  };

  const percentageComplete = getProjectProgress();
  const isNearingLimit = project.type === 'time-based' && 
    (project.totalHours! - project.usedHours!) < project.totalHours! * 0.2;

  const handleTimeScaleChange = (value: TimeScale) => {
    setTimeScale(value);
    setDateOffset(0);
  };

  const handlePrevious = () => {
    setDateOffset(prev => prev + 1);
  };

  const handleNext = () => {
    setDateOffset(prev => Math.max(0, prev - 1));
  };

  const { start, end, format } = getTimeRange(timeScale, dateOffset);
  const timeData: { [key: string]: number } = {};
  
  let current = start.clone();
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    const key = current.format(format);
    timeData[key] = 0;
    
    if (timeScale === 'daily') {
      current = current.add(1, 'day');
    } else if (timeScale === 'monthly') {
      current = current.add(1, 'month');
    } else {
      current = current.add(1, 'year');
    }
  }

  project.timeEntries
    .filter(entry => {
      const entryDate = dayjs(entry.date);
      return entryDate.isAfter(start) && entryDate.isBefore(end);
    })
    .forEach(entry => {
      const key = dayjs(entry.date).format(format);
      timeData[key] = (timeData[key] || 0) + entry.hours;
    });

  const chartData = {
    labels: Object.keys(timeData),
    datasets: [
      {
        label: t('common.hours'),
        data: Object.values(timeData),
        fill: true,
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const timeEntryColumns = [
    {
      title: t('common.date'),
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
      sorter: (a: TimeEntry, b: TimeEntry) => dayjs(a.date).unix() - dayjs(b.date).unix()
    },
    {
      title: t('common.description'),
      dataIndex: 'description',
      key: 'description',
      width: '40%'
    },
    {
      title: t('common.hours'),
      dataIndex: 'hours',
      key: 'hours',
      sorter: (a: TimeEntry, b: TimeEntry) => a.hours - b.hours
    },
    {
      title: t('common.priority'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: TimeEntry['priority']) => <PriorityTag priority={priority} />,
      filters: [
        { text: t('task.priority.low'), value: 'low' },
        { text: t('task.priority.medium'), value: 'medium' },
        { text: t('task.priority.high'), value: 'high' },
        { text: t('task.priority.urgent'), value: 'urgent' }
      ],
      onFilter: (value: string, record: TimeEntry) => record.priority === value
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: TimeEntry['status']) => <StatusTag status={status} />,
      filters: [
        { text: t('task.status.pending-estimation'), value: 'pending-estimation' },
        { text: t('task.status.client-approved'), value: 'client-approved' },
        { text: t('task.status.in-progress'), value: 'in-progress' },
        { text: t('task.status.blocked'), value: 'blocked' },
        { text: t('task.status.done'), value: 'done' }
      ],
      onFilter: (value: string, record: TimeEntry) => record.status === value
    }
  ];

  const expenseColumns = [
    {
      title: t('common.date'),
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM D, YYYY')
    },
    {
      title: t('common.description'),
      dataIndex: 'description',
      key: 'description',
      width: '40%'
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
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <Typography.Title level={3} className="!mb-2">{project.name}</Typography.Title>
            <Space>
              {getProjectTypeTag()}
              {project.type === 'fixed-price' && (
                <Tag color="green" className="flex items-center gap-1 !px-2 !py-1">
                  <Euro size={14} className="relative top-[-1px]" />
                  <span>€{project.budget?.toLocaleString()}</span>
                </Tag>
              )}
            </Space>
          </div>
          <div className="space-x-2">
            {project.type === 'time-based' && (
              <Button
                type="primary"
                onClick={() => setRequestHoursVisible(true)}
                icon={<PlusCircle size={16} />}
                className={isNearingLimit ? 'bg-orange-500 hover:bg-orange-600' : ''}
              >
                {t('project.requestMoreHours')}
              </Button>
            )}
            <Button
              type="primary"
              onClick={() => setNewTaskVisible(true)}
              icon={<PlusCircle size={16} />}
            >
              {t('task.requestNewTask')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-gray-50">
            <Space direction="vertical" className="w-full">
              <div className="flex justify-between items-center">
                <Space>
                  {project.type === 'time-based' ? (
                    <Clock size={20} className="text-blue-500" />
                  ) : (
                    <Lock size={20} className="text-purple-500" />
                  )}
                  <span className="font-medium">
                    {project.type === 'time-based' ? 'Hours Overview' : 'Project Progress'}
                  </span>
                </Space>
                {isNearingLimit && (
                  <AlertTriangle size={20} className="text-orange-500" />
                )}
              </div>
              <Progress
                percent={percentageComplete}
                status={percentageComplete >= 90 ? 'success' : 'active'}
                className="mb-2"
              />
              <div className="grid grid-cols-2 gap-4 text-center">
                {project.type === 'time-based' ? (
                  <>
                    <div>
                      <div className="text-sm text-gray-500">{t('common.hoursUsed')}</div>
                      <div className="text-xl font-semibold">{project.usedHours}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">{t('common.hoursRemaining')}</div>
                      <div className="text-xl font-semibold">{project.totalHours! - project.usedHours!}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-sm text-gray-500">Completed Tasks</div>
                      <div className="text-xl font-semibold">
                        {project.timeEntries.filter(entry => entry.status === 'done').length}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Total Tasks</div>
                      <div className="text-xl font-semibold">{project.timeEntries.length}</div>
                    </div>
                  </>
                )}
              </div>
            </Space>
          </Card>

          <Card className="bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <Radio.Group 
                value={timeScale} 
                onChange={e => handleTimeScaleChange(e.target.value)}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="daily">{t('common.daily')}</Radio.Button>
                <Radio.Button value="monthly">{t('common.monthly')}</Radio.Button>
                <Radio.Button value="yearly">{t('common.yearly')}</Radio.Button>
              </Radio.Group>
              <Space>
                <Button 
                  icon={<ChevronLeft size={16} />}
                  onClick={handlePrevious}
                />
                <Button
                  icon={<ChevronRight size={16} />}
                  onClick={handleNext}
                  disabled={dateOffset === 0}
                />
              </Space>
            </div>
            <div className="h-[150px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          </Card>
        </div>
      </Card>

      <Tabs
        items={[
          {
            key: '1',
            label: t('project.timeTracking'),
            children: (
              <div className="space-y-4">
                <Table
                  columns={timeEntryColumns}
                  dataSource={project.timeEntries}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `${t('common.total')} ${total} ${t('common.items')}`
                  }}
                  onRow={(record) => ({
                    onClick: () => setSelectedTimeEntry(record)
                  })}
                  className="cursor-pointer"
                />
              </div>
            )
          },
          {
            key: '2',
            label: t('project.expenses'),
            children: (
              <div className="space-y-4">
                <Table
                  columns={expenseColumns}
                  dataSource={project.expenses}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `${t('common.total')} ${total} ${t('common.items')}`
                  }}
                  onRow={(record) => ({
                    onClick: () => setSelectedExpense(record)
                  })}
                  className="cursor-pointer"
                />
              </div>
            )
          }
        ]}
      />

      <TimeEntryDetails
        entry={selectedTimeEntry}
        visible={!!selectedTimeEntry}
        onClose={() => setSelectedTimeEntry(null)}
        onSave={onUpdateTimeEntry}
        onAddComment={onAddComment}
      />

      <ExpenseDetails
        expense={selectedExpense}
        visible={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        onSave={onUpdateExpense}
      />

      <RequestHoursModal
        visible={requestHoursVisible}
        onClose={() => setRequestHoursVisible(false)}
        onSubmit={(request) => {
          message.success(t('project.hoursRequestSubmitted'));
          setRequestHoursVisible(false);
        }}
        currentHours={project.totalHours!}
        remainingHours={project.totalHours! - project.usedHours!}
      />

      <ClientTaskRequest
        visible={newTaskVisible}
        onClose={() => setNewTaskVisible(false)}
        onSubmit={(request) => {
          onAddTimeEntry(request);
          setNewTaskVisible(false);
        }}
      />
    </div>
  );
};