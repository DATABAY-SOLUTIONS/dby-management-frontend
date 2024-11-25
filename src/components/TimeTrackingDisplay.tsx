import React from 'react';
import { Tooltip, Progress } from 'antd';
import { Clock } from 'lucide-react';
import { TimeTracking } from '../types/jira';

interface TimeTrackingDisplayProps {
    timeTracking: TimeTracking;
    showProgress?: boolean;
    className?: string;
}

export const TimeTrackingDisplay: React.FC<TimeTrackingDisplayProps> = ({
                                                                            timeTracking,
                                                                            showProgress = true,
                                                                            className = ''
                                                                        }) => {
    const getTimeInHours = (seconds: number) => {
        return Math.round(seconds / 3600 * 10) / 10;
    };

    const timeSpentHours = getTimeInHours(timeTracking.timeSpentSeconds);
    const originalEstimateHours = getTimeInHours(timeTracking.originalEstimateSeconds);
    const remainingEstimateHours = getTimeInHours(timeTracking.remainingEstimateSeconds);

    const progressPercentage = originalEstimateHours > 0
        ? Math.min(100, (timeSpentHours / originalEstimateHours) * 100)
        : 0;

    return (
        <div className={`space-y-2 ${className}`}>
    <div className="flex items-center gap-2">
    <Clock size={16} className="text-gray-400" />
    <Tooltip title={`Original Estimate: ${timeTracking.originalEstimate}`}>
    <span className="text-sm">
        {timeSpentHours}h spent
    {originalEstimateHours > 0 && ` / ${originalEstimateHours}h estimated`}
    </span>
    </Tooltip>
    </div>

    {showProgress && originalEstimateHours > 0 && (
        <Progress
            percent={progressPercentage}
        size="small"
        status={progressPercentage >= 100 ? 'exception' : 'active'}
        />
    )}
    </div>
);
};
