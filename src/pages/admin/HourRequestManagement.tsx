import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Typography, Input, Select, Modal, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useUserStore } from '../../store/userStore';
import dayjs from 'dayjs';
import {ReviewHourRequestModal} from "./ReviewHourRequestModal.tsx";
import {HourRequest, hourRequestService, ReviewHourRequestDto} from "../../services/hourRequests.ts";


const { Title } = Typography;
const { confirm } = Modal;

export const HourRequestManagement: React.FC = () => {
    const { t } = useTranslation();
    const { projects } = useProjectStore();
    const { users, fetchUsers } = useUserStore();
    const [requests, setRequests] = useState<HourRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedRequest, setSelectedRequest] = useState<HourRequest | null>(null);
    const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const allRequests = await Promise.all(
                projects.map(project =>
                    hourRequestService.getProjectHourRequests(project.id)
                )
            );
            setRequests(allRequests.flat());
        } catch (error) {
            message.error(t('common.hourRequests.messages.fetchError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRequests();
    }, [projects, fetchUsers]);

    const handleReview = async (review: ReviewHourRequestDto) => {
        if (!selectedRequest) return;

        try {
            await hourRequestService.reviewHourRequest(
                selectedRequest.projectId,
                selectedRequest.id,
                review
            );
            message.success(t('common.hourRequests.messages.reviewSuccess'));
            fetchRequests();
            setIsReviewModalVisible(false);
        } catch (error) {
            message.error(t('common.hourRequests.messages.reviewError'));
        }
    };

    const handleDelete = (request: HourRequest) => {
        confirm({
            title: t('common.hourRequests.delete.title'),
            content: t('common.hourRequests.delete.confirm'),
            okText: t('common.hourRequests.delete.confirmButton'),
            okType: 'danger',
            cancelText: t('common.hourRequests.delete.cancelButton'),
            onOk: async () => {
                try {
                    await hourRequestService.deleteHourRequest(request.projectId, request.id);
                    message.success(t('common.hourRequests.messages.deleteSuccess'));
                    fetchRequests();
                } catch (error) {
                    message.error(t('common.hourRequests.messages.deleteError'));
                }
            }
        });
    };

    const columns = [
        {
            title: t('common.hourRequests.fields.project'),
            key: 'project',
            render: (text: string, record: HourRequest) => {
                const project = projects.find(p => p.id === record.projectId);
                return (
                    <div>
                        <div className="font-medium">{project?.name}</div>
                        <div className="text-sm text-gray-500">{project?.client}</div>
                    </div>
                );
            },
            sorter: (a: HourRequest, b: HourRequest) => {
                const projectA = projects.find(p => p.id === a.projectId)?.name || '';
                const projectB = projects.find(p => p.id === b.projectId)?.name || '';
                return projectA.localeCompare(projectB);
            }
        },
        {
            title: t('common.hourRequests.fields.requestedBy'),
            key: 'requestedBy',
            render: (text: string, record: HourRequest) => (
                <div className="flex items-center gap-2">
                    {record.requester.avatar ? (
                        <img src={record.requester.avatar} alt={record.requester.name} className="w-8 h-8 rounded-full" />
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
        },
        {
            title: t('common.hourRequests.fields.hours'),
            dataIndex: 'hours',
            key: 'hours',
            render: (hours: number) => `${hours}h`,
            sorter: (a: HourRequest, b: HourRequest) => a.hours - b.hours
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
            },
            filters: [
                { text: t('common.hourRequests.status.pending'), value: 'pending' },
                { text: t('common.hourRequests.status.approved'), value: 'approved' },
                { text: t('common.hourRequests.status.rejected'), value: 'rejected' }
            ],
            onFilter: (value: string, record: HourRequest) => record.status === value
        },
        {
            title: t('common.hourRequests.fields.neededBy'),
            dataIndex: 'neededBy',
            key: 'neededBy',
            render: (date: string) => dayjs(date).format('MMM D, YYYY'),
            sorter: (a: HourRequest, b: HourRequest) =>
                dayjs(a.neededBy).unix() - dayjs(b.neededBy).unix()
        },
        {
            title: t('common.hourRequests.fields.requested'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('MMM D, YYYY HH:mm'),
            sorter: (a: HourRequest, b: HourRequest) =>
                dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()
        },
        {
            title: t('common.actions'),
            key: 'actions',
            render: (text: string, record: HourRequest) => (
                <Space>
                    {record.status === 'pending' && (
                        <Button
                            type="primary"
                            onClick={() => {
                                setSelectedRequest(record);
                                setIsReviewModalVisible(true);
                            }}
                        >
                            {t('common.hourRequests.actions.review')}
                        </Button>
                    )}
                    <Button
                        type="link"
                        danger
                        onClick={() => handleDelete(record)}
                    >
                        {t('common.hourRequests.actions.delete')}
                    </Button>
                </Space>
            )
        }
    ];

    const filteredRequests = requests.filter(request =>
        (statusFilter === 'all' || request.status === statusFilter) &&
        (projects.find(p => p.id === request.projectId)?.name || '')
            .toLowerCase()
            .includes(searchText.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Title level={3} className="!m-0">{t('common.hourRequests.title')}</Title>

            <Card>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-4 flex-1 max-w-2xl">
                        <Input
                            prefix={<Search size={16} className="text-gray-400" />}
                            placeholder={t('common.hourRequests.search')}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                        />
                        <Select
                            className="min-w-[200px]"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { label: t('common.hourRequests.status.all'), value: 'all' },
                                { label: t('common.hourRequests.status.pending'), value: 'pending' },
                                { label: t('common.hourRequests.status.approved'), value: 'approved' },
                                { label: t('common.hourRequests.status.rejected'), value: 'rejected' }
                            ]}
                        />
                    </div>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredRequests}
                    rowKey="id"
                    loading={loading}
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
                                                        {record.reviewedBy}
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
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => t('common.hourRequests.fields.totalItems', { total })
                    }}
                />
            </Card>

            <ReviewHourRequestModal
                request={selectedRequest}
                visible={isReviewModalVisible}
                onClose={() => {
                    setIsReviewModalVisible(false);
                    setSelectedRequest(null);
                }}
                onSubmit={handleReview}
            />
        </div>
    );
};
