import React from 'react';
import { Modal, Form, Input, DatePicker, InputNumber, Select, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import { Expense } from '../../types/project';
import dayjs from 'dayjs';

interface ExpenseFormModalProps {
  expense?: Expense;
  projectId?: string;
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<Expense>) => Promise<void>;
  loading?: boolean;
  projects: { id: string; name: string; }[];
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  expense,
  projectId,
  visible,
  onClose,
  onSubmit,
  loading,
  projects
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (expense) {
      form.setFieldsValue({
        ...expense,
        date: dayjs(expense.date)
      });
    } else {
      form.resetFields();
      if (projectId) {
        form.setFieldValue('projectId', projectId);
      }
    }
  }, [expense, projectId, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit({
        ...values,
        date: values.date.format('YYYY-MM-DD')
      });
      onClose();
    } catch (error) {
      // Form validation error
    }
  };

  return (
    <Modal
      title={expense ? t('admin.expenses.edit') : t('admin.expenses.create')}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isRecurring: false,
          category: 'Hosting'
        }}
      >
        {!projectId && (
          <Form.Item
            name="projectId"
            label={t('admin.projects.name')}
            rules={[{ required: true }]}
          >
            <Select options={projects.map(p => ({ label: p.name, value: p.id }))} />
          </Form.Item>
        )}

        <Form.Item
          name="description"
          label={t('admin.expenses.description')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="amount"
          label={t('admin.expenses.amount')}
          rules={[{ required: true }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            formatter={value => `€ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value!.replace(/€\s?|(,*)/g, '')}
            className="w-full"
          />
        </Form.Item>

        <Form.Item
          name="category"
          label={t('admin.expenses.category')}
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { label: t('expense.categories.hosting'), value: 'Hosting' },
              { label: t('expense.categories.licenses'), value: 'Software Licenses' },
              { label: t('expense.categories.services'), value: 'Third-party Services' },
              { label: t('expense.categories.infrastructure'), value: 'Infrastructure' },
              { label: t('expense.categories.other'), value: 'Other' }
            ]}
          />
        </Form.Item>

        <Form.Item
          name="isRecurring"
          label={t('admin.expenses.recurring')}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.isRecurring !== currentValues.isRecurring
          }
        >
          {({ getFieldValue }) =>
            getFieldValue('isRecurring') ? (
              <Form.Item
                name="recurringInterval"
                label={t('expense.recurringInterval')}
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { label: t('expense.intervals.monthly'), value: 'monthly' },
                    { label: t('expense.intervals.quarterly'), value: 'quarterly' },
                    { label: t('expense.intervals.yearly'), value: 'yearly' }
                  ]}
                />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        <Form.Item
          name="date"
          label={t('admin.expenses.date')}
          rules={[{ required: true }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  );
};