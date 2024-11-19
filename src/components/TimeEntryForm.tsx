import React from 'react';
import { Form, Input, InputNumber, DatePicker, Select, Button } from 'antd';
import { TimeEntry } from '../types/project';
import { useTranslation } from 'react-i18next';

interface TimeEntryFormProps {
  onSubmit: (entry: Omit<TimeEntry, 'id' | 'projectId' | 'comments'>) => void;
  loading?: boolean;
}

const priorities = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' }
];

const statuses = [
  { label: 'Pending Estimation', value: 'pending-estimation' },
  { label: 'Client Approved', value: 'client-approved' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Blocked', value: 'blocked' },
  { label: 'Done', value: 'done' }
];

export const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
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
        priority: 'medium',
        status: 'pending-estimation'
      }}
    >
      <Form.Item
        name="description"
        label={t('task.taskDescription')}
        rules={[{ required: true, message: 'Please enter a description' }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          name="hours"
          label={t('common.hours')}
          rules={[{ required: true, message: 'Please enter hours' }]}
        >
          <InputNumber min={0.5} step={0.5} className="w-full" />
        </Form.Item>

        <Form.Item
          name="priority"
          label={t('common.priority')}
          rules={[{ required: true, message: 'Please select a priority' }]}
        >
          <Select options={priorities} />
        </Form.Item>
      </div>

      <Form.Item
        name="status"
        label={t('common.status')}
        rules={[{ required: true, message: 'Please select a status' }]}
      >
        <Select options={statuses} />
      </Form.Item>

      <Form.Item
        name="date"
        label={t('common.date')}
        rules={[{ required: true, message: 'Please select a date' }]}
      >
        <DatePicker className="w-full" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {t('project.addTask')}
        </Button>
      </Form.Item>
    </Form>
  );
};