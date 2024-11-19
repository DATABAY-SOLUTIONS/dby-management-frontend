import React from 'react';
import { Form, Input, InputNumber, DatePicker, Select, Button, Switch } from 'antd';
import { Expense } from '../types/project';
import { useTranslation } from 'react-i18next';

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, 'id' | 'projectId'>) => void;
  loading?: boolean;
}

const categories = [
  'Hosting',
  'Software Licenses',
  'Third-party Services',
  'Infrastructure',
  'Other'
];

const recurringIntervals = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' }
];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSubmit,
  loading
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const handleSubmit = (values: any) => {
    onSubmit({
      ...values,
      date: values.date.format('YYYY-MM-DD')
    });
    form.resetFields();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="max-w-lg"
      initialValues={{
        isRecurring: false,
        category: 'Hosting'
      }}
    >
      <Form.Item
        name="description"
        label={t('common.description')}
        rules={[{ required: true, message: t('validation.descriptionRequired') }]}
      >
        <Input />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          name="amount"
          label={t('common.amount')}
          rules={[{ required: true, message: t('validation.amountRequired') }]}
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
          label={t('common.category')}
          rules={[{ required: true, message: t('validation.categoryRequired') }]}
        >
          <Select options={categories.map(cat => ({ label: cat, value: cat }))} />
        </Form.Item>
      </div>

      <Form.Item
        name="isRecurring"
        label={t('expense.recurringExpense')}
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
              rules={[{ required: true, message: t('validation.intervalRequired') }]}
            >
              <Select options={recurringIntervals} />
            </Form.Item>
          ) : null
        }
      </Form.Item>

      <Form.Item
        name="date"
        label={t('common.date')}
        rules={[{ required: true, message: t('validation.dateRequired') }]}
      >
        <DatePicker className="w-full" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {t('project.addExpense')}
        </Button>
      </Form.Item>
    </Form>
  );
};