import React from 'react';
import { Modal, Form, Input, DatePicker, Select, Button } from 'antd';
import { Clock } from 'lucide-react';

interface ClientTaskRequestProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (request: any) => void;
}

const priorities = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' }
];

export const ClientTaskRequest: React.FC<ClientTaskRequestProps> = ({
  visible,
  onClose,
  onSubmit
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    onSubmit({
      ...values,
      date: values.date.format('YYYY-MM-DD'),
      status: 'pending-estimation'
    });
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Request New Task"
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          priority: 'medium'
        }}
      >
        <Form.Item
          name="description"
          label="Task Description"
          rules={[{ required: true, message: 'Please describe the task' }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Please provide detailed information about what needs to be done..."
          />
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priority"
          rules={[{ required: true, message: 'Please select priority' }]}
        >
          <Select options={priorities} />
        </Form.Item>

        <Form.Item
          name="date"
          label="Requested Completion Date"
          rules={[{ required: true, message: 'Please select a date' }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Submit Request
          </Button>
        </div>
      </Form>
    </Modal>
  );
};