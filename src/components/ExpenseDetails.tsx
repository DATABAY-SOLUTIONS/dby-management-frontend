import React from 'react';
import { Modal, Descriptions, Tag } from 'antd';
import { Expense } from '../types/project';
import { useTranslation } from 'react-i18next';
import { Calendar, Euro, RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';

interface ExpenseDetailsProps {
  expense: Expense | null;
  visible: boolean;
  onClose: () => void;
  onSave?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}

export const ExpenseDetails: React.FC<ExpenseDetailsProps> = ({
  expense,
  visible,
  onClose
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('expense.expenseDetails')}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      {expense && (
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
      )}
    </Modal>
  );
};