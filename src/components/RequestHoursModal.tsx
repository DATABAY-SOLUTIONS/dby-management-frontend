import React from 'react';
import { Modal, Form, InputNumber, Input, DatePicker, Button } from 'antd';
import { useTranslation } from 'react-i18next';

interface RequestHoursModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (request: { hours: number; reason: string; neededBy: string }) => void;
  currentHours: number;
  remainingHours: number;
}

export const RequestHoursModal: React.FC<RequestHoursModalProps> = ({
  visible,
  onClose,
  onSubmit,
  currentHours,
  remainingHours
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const handleSubmit = (values: any) => {
    onSubmit({
      ...values,
      neededBy: values.neededBy.format('YYYY-MM-DD')
    });
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={t('project.requestMoreHours')}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <div className="mb-4">
        <p>{t('project.currentHoursInfo', { current: currentHours, remaining: remainingHours })}</p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="hours"
          label={t('project.additionalHours')}
          rules={[{ required: true, message: t('validation.hoursRequired') }]}
        >
          <InputNumber
            min={1}
            className="w-full"
            placeholder={t('project.enterAdditionalHours')}
          />
        </Form.Item>

        <Form.Item
          name="reason"
          label={t('project.requestReason')}
          rules={[{ required: true, message: t('validation.reasonRequired') }]}
        >
          <Input.TextArea
            rows={4}
            placeholder={t('project.enterRequestReason')}
          />
        </Form.Item>

        <Form.Item
          name="neededBy"
          label={t('project.neededBy')}
          rules={[{ required: true, message: t('validation.dateRequired') }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="primary" htmlType="submit">
            {t('project.submitRequest')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};