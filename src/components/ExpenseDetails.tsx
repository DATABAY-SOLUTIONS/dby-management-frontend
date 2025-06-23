import React, { useState } from 'react';
import { Modal, Descriptions, Tag, Tabs, Space, Button } from 'antd';
import { Expense, ExpensePayment } from '../types/project';
import { useTranslation } from 'react-i18next';
import { Calendar, Euro, RefreshCw } from 'lucide-react';
import { ExpensePaymentList } from './admin/ExpensePaymentList';
import { ExpensePaymentModal } from './admin/ExpensePaymentModal';
import { useAuthStore } from '../store/authStore';
import { getRolePermissions } from '../types/user';
import dayjs from 'dayjs';

interface ExpenseDetailsProps {
  expense: Expense | null;
  visible: boolean;
  onClose: () => void;
  onAddPayment?: (expenseId: string, payment: Omit<ExpensePayment, 'id' | 'expenseId'>) => Promise<void>;
  onUpdatePayment?: (expenseId: string, paymentId: string, payment: Partial<ExpensePayment>) => Promise<void>;
  onDeletePayment?: (expenseId: string, paymentId: string) => Promise<void>;
}

export const ExpenseDetails: React.FC<ExpenseDetailsProps> = ({
                                                                expense,
                                                                visible,
                                                                onClose,
                                                                onAddPayment,
                                                                onUpdatePayment,
                                                                onDeletePayment
                                                              }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const permissions = getRolePermissions(user?.role || 'user');
  const [activeTab, setActiveTab] = useState('1');
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<ExpensePayment | null>(null);

  const handleAddPayment = async (payment: Omit<ExpensePayment, 'id' | 'expenseId'>) => {
    if (!expense || !onAddPayment) return;
    await onAddPayment(expense.id, payment);
    setIsPaymentModalVisible(false);
  };

  const handleUpdatePayment = async (payment: Partial<ExpensePayment>) => {
    if (!expense || !selectedPayment || !onUpdatePayment) return;
    await onUpdatePayment(expense.id, selectedPayment.id, payment);
    setIsPaymentModalVisible(false);
    setSelectedPayment(null);
  };

  const handleDeletePayment = async (payment: ExpensePayment) => {
    if (!expense || !onDeletePayment) return;
    await onDeletePayment(expense.id, payment.id);
  };

  return (
      <Modal
          title={t('expense.expenseDetails')}
          open={visible}
          onCancel={onClose}
          footer={null}
          width={800}
      >
        {expense && (
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: '1',
                    label: t('common.details'),
                    children: (
                        <Descriptions
                            bordered
                            column={1}
                            className="bg-gray-50 rounded-lg"
                            labelStyle={{
                              width: '200px',
                              padding: '16px',
                              backgroundColor: 'transparent'
                            }}
                            contentStyle={{
                              padding: '16px'
                            }}
                        >
                          <Descriptions.Item label={t('common.description')}>
                            <div className="whitespace-pre-wrap">{expense.description}</div>
                          </Descriptions.Item>

                          <Descriptions.Item label={t('common.date')}>
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-gray-400" />
                              {dayjs(expense.date).format('MMMM D, YYYY')}
                            </div>
                          </Descriptions.Item>

                          <Descriptions.Item label={t('common.amount')}>
                            <div className="flex items-center gap-2">
                              <Euro size={16} className="text-gray-400" />
                              €{expense.amount.toFixed(2)}
                            </div>
                          </Descriptions.Item>

                          <Descriptions.Item label={t('common.category')}>
                            <Tag color="blue">{expense.category}</Tag>
                          </Descriptions.Item>

                          {expense.isRecurring && (
                              <Descriptions.Item label={t('common.recurring')}>
                                <Tag icon={<RefreshCw size={14} />} color="green">
                                  {t(`expense.intervals.${expense.recurringInterval}`)}
                                </Tag>
                              </Descriptions.Item>
                          )}
                        </Descriptions>
                    )
                  },
                  permissions.canManageExpenses && {
                    key: '2',
                    label: t('admin.expenses.payments.title'),
                    children: (
                        <ExpensePaymentList
                            expense={expense}
                            onAddPayment={() => {
                              setSelectedPayment(null);
                              setIsPaymentModalVisible(true);
                            }}
                            onEditPayment={(payment) => {
                              setSelectedPayment(payment);
                              setIsPaymentModalVisible(true);
                            }}
                            onDeletePayment={handleDeletePayment}
                        />
                    )
                  }
                ].filter(Boolean)}
            />
        )}

        <ExpensePaymentModal
            payment={selectedPayment || undefined}
            visible={isPaymentModalVisible}
            onClose={() => {
              setIsPaymentModalVisible(false);
              setSelectedPayment(null);
            }}
            onSubmit={selectedPayment ? handleUpdatePayment : handleAddPayment}
        />
      </Modal>
  );
};
