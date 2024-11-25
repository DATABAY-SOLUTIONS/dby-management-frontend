import React from 'react';
import { Line } from 'react-chartjs-2';
import { Select, Card, Tooltip, Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { TimeEntry } from '../types/project';
import { Info, ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    ChartOptions,
    Filler
} from 'chart.js';

dayjs.extend(isBetween);

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    ChartTooltip,
    Legend,
    Filler
);

interface HoursChartProps {
    timeEntries: TimeEntry[];
    className?: string;
}

export const HoursChart: React.FC<HoursChartProps> = ({ timeEntries, className = '' }) => {
    const { t } = useTranslation();
    const [timeScale, setTimeScale] = React.useState<'daily' | 'monthly' | 'yearly'>('monthly');
    const [hoveredPoint, setHoveredPoint] = React.useState<{ date: string; hours: number } | null>(null);
    const [dateRange, setDateRange] = React.useState({
        start: dayjs().subtract(6, 'days'),
        end: dayjs()
    });

    const handleNavigate = (direction: 'prev' | 'next') => {
        const unit = timeScale === 'daily' ? 'days' : timeScale === 'monthly' ? 'months' : 'years';
        const amount = timeScale === 'daily' ? 7 : timeScale === 'monthly' ? 1 : 1;

        setDateRange(prev => ({
            start: direction === 'prev'
                ? prev.start.subtract(amount, unit)
                : prev.start.add(amount, unit),
            end: direction === 'prev'
                ? prev.end.subtract(amount, unit)
                : prev.end.add(amount, unit)
        }));
    };

    const getTimeSeriesData = () => {
        if (!timeEntries.length) {
            return {
                labels: [],
                datasets: [
                    {
                        label: t('common.hours'),
                        data: [],
                        borderColor: '#1890ff',
                        backgroundColor: 'rgba(24, 144, 255, 0.1)',
                        fill: true,
                        tension: 0.4,
                    },
                    {
                        label: t('common.cumulativeHours'),
                        data: [],
                        borderColor: '#52c41a',
                        backgroundColor: 'rgba(82, 196, 26, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderDash: [5, 5],
                    }
                ]
            };
        }

        const sortedEntries = [...timeEntries].sort((a, b) =>
            dayjs(a.date).unix() - dayjs(b.date).unix()
        );

        const format = {
            daily: 'YYYY-MM-DD',
            monthly: 'YYYY-MM',
            yearly: 'YYYY'
        }[timeScale];

        // Generate all dates in range
        let dateLabels: string[] = [];
        let current = dateRange.start;
        const increment = timeScale === 'daily' ? 'day' : timeScale === 'monthly' ? 'month' : 'year';

        while (current.isBefore(dateRange.end) || current.isSame(dateRange.end, increment)) {
            dateLabels.push(current.format(format));
            current = current.add(1, increment);
        }

        // Calculate daily totals
        const dailyData: Record<string, number> = {};
        const cumulativeData: Record<string, number> = {};
        let cumulative = 0;

        // Initialize all dates with 0
        dateLabels.forEach(label => {
            dailyData[label] = 0;
        });

        // Fill in actual data
        sortedEntries.forEach(entry => {
            const entryDate = dayjs(entry.date);
            if (entryDate.isBetween(dateRange.start, dateRange.end, increment, '[]')) {
                const key = entryDate.format(format);
                dailyData[key] = (dailyData[key] || 0) + entry.hours;
            }
        });

        // Calculate cumulative totals and moving averages
        const movingAverageWindow = timeScale === 'daily' ? 7 : timeScale === 'monthly' ? 3 : 12;
        const movingAverages: number[] = [];

        dateLabels.forEach((key, index) => {
            cumulative += dailyData[key] || 0;
            cumulativeData[key] = cumulative;

            // Calculate moving average
            if (index >= movingAverageWindow - 1) {
                const sum = dateLabels
                    .slice(index - movingAverageWindow + 1, index + 1)
                    .reduce((acc, date) => acc + (dailyData[date] || 0), 0);
                movingAverages.push(sum / movingAverageWindow);
            } else {
                movingAverages.push(NaN);
            }
        });

        // Format labels for display
        const formattedLabels = dateLabels.map(label => {
            switch (timeScale) {
                case 'daily':
                    return dayjs(label).format('MMM D');
                case 'monthly':
                    return dayjs(label).format('MMM YYYY');
                case 'yearly':
                    return label;
                default:
                    return label;
            }
        });

        return {
            labels: formattedLabels,
            datasets: [
                {
                    label: t('common.hours'),
                    data: dateLabels.map(key => dailyData[key] || 0),
                    borderColor: '#1890ff',
                    backgroundColor: 'rgba(24, 144, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: t('common.cumulativeHours'),
                    data: dateLabels.map(key => cumulativeData[key] || 0),
                    borderColor: '#52c41a',
                    backgroundColor: 'rgba(82, 196, 26, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderDash: [5, 5],
                    yAxisID: 'cumulative'
                },
                {
                    label: t('Moving Average'),
                    data: movingAverages,
                    borderColor: '#722ed1',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4,
                    borderDash: [3, 3],
                    pointRadius: 0
                }
            ]
        };
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        return `${label}: ${value.toFixed(1)}h`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                title: {
                    display: true,
                    text: timeScale.charAt(0).toUpperCase() + timeScale.slice(1)
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: t('common.hours')
                },
                ticks: {
                    callback: (value) => `${value}h`
                }
            },
            cumulative: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: t('common.cumulativeHours')
                },
                ticks: {
                    callback: (value) => `${value}h`
                },
                grid: {
                    drawOnChartArea: false
                }
            }
        },
        elements: {
            point: {
                radius: 4,
                hoverRadius: 6,
                hitRadius: 8
            },
            line: {
                borderWidth: 2
            }
        },
        animation: {
            duration: 750,
            easing: 'easeInOutQuart'
        },
        onHover: (event, elements) => {
            if (elements && elements.length > 0) {
                const dataIndex = elements[0].index;
                const dataset = elements[0].datasetIndex;
                if (dataset === 0) { // Only show for daily hours
                    setHoveredPoint({
                        date: event.chart.data.labels![dataIndex] as string,
                        hours: event.chart.data.datasets[0].data[dataIndex] as number
                    });
                }
            } else {
                setHoveredPoint(null);
            }
        }
    };

    const handleTimeScaleChange = (value: 'daily' | 'monthly' | 'yearly') => {
        setTimeScale(value);
        // Reset date range based on selected scale
        const now = dayjs();
        switch (value) {
            case 'daily':
                setDateRange({
                    start: now.subtract(6, 'days'),
                    end: now
                });
                break;
            case 'monthly':
                setDateRange({
                    start: now.startOf('month'),
                    end: now.endOf('month')
                });
                break;
            case 'yearly':
                setDateRange({
                    start: now.startOf('year'),
                    end: now.endOf('year')
                });
                break;
        }
    };

    const getDateRangeText = () => {
        switch (timeScale) {
            case 'daily':
                return `${dateRange.start.format('MMM D')} - ${dateRange.end.format('MMM D')}`;
            case 'monthly':
                return dateRange.start.format('MMMM YYYY');
            case 'yearly':
                return dateRange.start.format('YYYY');
        }
    };

    return (
        <div className={className}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium m-0">{t('project.hoursOverview')}</h3>
                    <Tooltip title="Shows daily hours spent, cumulative total, and moving average trend">
                        <Info size={16} className="text-gray-400 cursor-help" />
                    </Tooltip>
                </div>
                <Space>
                    <Space>
                        <Button
                            icon={<ChevronLeft size={16} />}
                            onClick={() => handleNavigate('prev')}
                        />
                        <span className="text-sm min-w-[120px] text-center">
              {getDateRangeText()}
            </span>
                        <Button
                            icon={<ChevronRight size={16} />}
                            onClick={() => handleNavigate('next')}
                            disabled={dateRange.end.isAfter(dayjs())}
                        />
                    </Space>
                    <Select
                        value={timeScale}
                        onChange={handleTimeScaleChange}
                        options={[
                            { label: t('common.daily'), value: 'daily' },
                            { label: t('common.monthly'), value: 'monthly' },
                            { label: t('common.yearly'), value: 'yearly' }
                        ]}
                        className="w-32"
                    />
                </Space>
            </div>

            {hoveredPoint && (
                <div className="text-sm text-gray-500 mb-2">
                    {hoveredPoint.date}: <span className="font-medium">{hoveredPoint.hours.toFixed(1)}h</span>
                </div>
            )}

            <div className="h-[300px]">
                <Line data={getTimeSeriesData()} options={chartOptions} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
                <Card size="small" className="text-center">
                    <div className="text-sm text-gray-500">{t('common.daily')}</div>
                    <div className="font-medium">
                        {timeEntries.length > 0
                            ? (timeEntries.reduce((sum, entry) => sum + entry.hours, 0) / timeEntries.length).toFixed(1)
                            : '0'} h/day
                    </div>
                </Card>
                <Card size="small" className="text-center">
                    <div className="text-sm text-gray-500">{t('common.total')}</div>
                    <div className="font-medium">
                        {timeEntries.reduce((sum, entry) => sum + entry.hours, 0).toFixed(1)} h
                    </div>
                </Card>
                <Card size="small" className="text-center">
                    <div className="text-sm text-gray-500">Peak</div>
                    <div className="font-medium">
                        {timeEntries.length > 0
                            ? Math.max(...timeEntries.map(entry => entry.hours)).toFixed(1)
                            : '0'} h
                    </div>
                </Card>
            </div>
        </div>
    );
};
