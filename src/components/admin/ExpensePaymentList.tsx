import React from 'react';
import { Table, Button, Tag, Space, Progress, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { Expense, ExpensePayment } from '../../types/project';
import { Edit, Trash2, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import dayjs from 'dayjs';

interface ExpensePaymentListProps {
    expense: Expense;
    onAddPayment: () => void;
    onEditPayment: (payment: ExpensePayment) => void;
    onDeletePayment: (payment: ExpensePayment) => void;
}

export const ExpensePaymentList: React.FC<ExpensePaymentListProps> = ({
                                                                          expense,
                                                                          onAddPayment,
                                                                          onEditPayment,
                                                                          onDeletePayment
                                                                      }) => {
    const { t } = useTranslation();

    const getPaymentStatusIcon = (status: ExpensePayment['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle size={14} className="text-green-500" />;
            case 'pending':
                return <Clock size={14} className="text-orange-500" />;
            case 'cancelled':
                return <AlertCircle size={14} className="text-red-500" />;
        }
    };

    const columns = [
        {
            title: t('common.date'),
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => dayjs(date).format('MMM D, YYYY'),
            sorter: (a: ExpensePayment, b: ExpensePayment) =>
                dayjs(a.date).unix() - dayjs(b.date).unix()
        },
        {
            title: t('common.amount'),
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => `€${amount.toFixed(2)}`,
            sorter: (a: ExpensePayment, b: ExpensePayment) => a.amount - b.amount
        },
        {
            title: t('admin.expenses.payments.method'),
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method: ExpensePayment['paymentMethod']) => (
                <Tag>{t(`admin.expenses.payments.methods.${method}`)}</Tag>
            )
        },
        {
            title: t('common.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: ExpensePayment['status']) => (
                <Tag icon={getPaymentStatusIcon(status)} color={
                    status === 'completed' ? 'success' :
                        status === 'pending' ? 'warning' : 'error'
                }>
                    {t(`admin.expenses.payments.status.${status}`)}
                </Tag>
            )
        },
        {
            title: t('admin.expenses.payments.reference'),
            dataIndex: 'reference',
            key: 'reference',
            render: (reference?: string) => reference || '-'
        },
        {
            title: t('common.actions'),
            key: 'actions',
            render: (_: any, record: ExpensePayment) => (
                <Space>
                    <Button
                        type="text"
                        icon={<Edit size={16} />}
                        onClick={() => onEditPayment(record)}
                    >
                        {t('common.edit')}
                    </Button>
                    <Button
                        type="text"
                        danger
                        icon={<Trash2 size={16} />}
                        onClick={() => onDeletePayment(record)}
                    >
                        {t('common.delete')}
                    </Button>
                </Space>
            )
        }
    ];

    const paidAmount = expense.paidAmount || 0;
    const remainingAmount = expense.remainingAmount || expense.amount;
    const paymentProgress = (paidAmount / expense.amount) * 100;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <h3 className="text-lg font-medium m-0">
                        {t('admin.expenses.payments.title')}
                    </h3>
                    <div className="text-sm text-gray-500">
                        {t('admin.expenses.payments.totalAmount')}: €{expense.amount.toFixed(2)}
                    </div>
                </div>
                <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={onAddPayment}
                >
                    {t('admin.expenses.payments.add')}
                </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <div className="space-y-1">
                        <div className="text-sm text-gray-500">
                            {t('admin.expenses.payments.progress')}
                        </div>
                        <div className="font-medium">
                            €{paidAmount.toFixed(2)} / €{expense.amount.toFixed(2)}
                        </div>
                    </div>
                    <Tag color={
                        paymentProgress >= 100 ? 'success' :
                            paymentProgress > 0 ? 'warning' : 'default'
                    }>
                        {expense.status === 'paid' ? t('admin.expenses.status.paid') :
                            expense.status === 'partially-paid' ? t('admin.expenses.status.partiallyPaid') :
                                t('admin.expenses.status.unpaid')}
                    </Tag>
                </div>
                <Tooltip title={`${paymentProgress.toFixed(1)}%`}>
                    <Progress
                        percent={paymentProgress}
                        showInfo={false}
                        status={
                            paymentProgress >= 100 ? 'success' :
                                paymentProgress > 0 ? 'active' : 'exception'
                        }
                    />
                </Tooltip>
            </div>

            <Table
                columns={columns}
                dataSource={expense.payments || []}
                rowKey="id"
                pagination={false}
            />
        </div>
    );
};
