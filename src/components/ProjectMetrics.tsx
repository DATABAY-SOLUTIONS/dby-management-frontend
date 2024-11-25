import React from 'react';
import { Progress } from 'antd';
import { Clock, Hourglass, CheckCircle2, AlertCircle, BarChart2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProjectMetricsProps {
    totalHours: number | undefined;
    consumedHours: number;
    estimatedHours: number;
    completedTasks: number;
    totalTasks: number;
    projectStatus: string;
    progress: number;
}

export const ProjectMetrics: React.FC<ProjectMetricsProps> = ({
                                                                  totalHours,
                                                                  consumedHours,
                                                                  estimatedHours,
                                                                  completedTasks,
                                                                  totalTasks,
                                                                  projectStatus,
                                                                  progress
                                                              }) => {
    const { t } = useTranslation();

    const getProgressColor = () => {
        if (!totalHours) return 'blue';
        const percentageUsed = (consumedHours / totalHours) * 100;
        if (percentageUsed > 100) return 'red';
        if (percentageUsed > 85) return 'orange';
        return 'blue';
    };

    const remainingHours = totalHours ? totalHours - consumedHours : 0;
    const metrics = [
        {
            icon: <Clock size={20} className="text-blue-500" />,
            label: t('common.totalHours'),
            value: totalHours?.toFixed(1) || '-',
            color: 'blue',
            tooltip: t('common.totalHours')
        },
        {
            icon: <Hourglass size={20} className="text-green-500" />,
            label: t('common.hoursUsed'),
            value: consumedHours.toFixed(1),
            color: 'green',
            tooltip: t('common.hoursUsed')
        },
        {
            icon: <CheckCircle2 size={20} className="text-purple-500" />,
            label: t('common.hoursRemaining'),
            value: totalHours ? remainingHours.toFixed(1) : '-',
            color: 'purple',
            tooltip: t('common.hoursRemaining')
        },
        {
            icon: <AlertCircle size={20} className="text-orange-500" />,
            label: t('common.totalEstimatedHours'),
            value: estimatedHours.toFixed(1),
            color: 'orange',
            tooltip: t('common.totalEstimatedHours')
        },
        {
            icon: <BarChart2 size={20} className="text-cyan-500" />,
            label: t('common.tasksCompleted'),
            value: `${completedTasks}/${totalTasks}`,
            color: 'cyan',
            tooltip: t('common.tasksCompleted')
        }
    ];

    return (
        <div className="text-center">
            <div className="flex items-center justify-center gap-6 mb-6">
                <Progress
                    type="dashboard"
                    percent={progress}
                    format={(percent) => `${percent}%`}
                    strokeColor={getProgressColor()}
                    width={120}
                />
                {totalHours && (
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-700">
                            {consumedHours.toFixed(1)} <span className="text-gray-400">/</span> {totalHours}
                        </div>
                        <div className="text-sm text-gray-500">{t('common.hoursUsed')} / {t('common.totalHours')}</div>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-medium">{t('common.projectProgress')}</h3>
                <div className="grid grid-cols-5 gap-4 bg-gray-50 p-4 rounded-lg">
                    {metrics.map((metric, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                            title={metric.tooltip}
                        >
                            <div className={`mb-2 p-2 rounded-full bg-${metric.color}-50`}>
                                {metric.icon}
                            </div>
                            <div className="text-sm text-gray-500">{metric.label}</div>
                            <div className="text-xl font-semibold mt-1">{metric.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
