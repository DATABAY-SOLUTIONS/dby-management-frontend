import React from 'react';
import { Modal, Form, InputNumber, Input, DatePicker, Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {CreateHourRequestDto, hourRequestService} from "../services/hourRequests.ts";

interface RequestHoursModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (request: CreateHourRequestDto) => void;
    currentHours: number;
    remainingHours: number;
    projectId: string;
}

export const RequestHoursModal: React.FC<RequestHoursModalProps> = ({
                                                                        visible,
                                                                        onClose,
                                                                        onSubmit,
                                                                        currentHours,
                                                                        remainingHours,
                                                                        projectId
                                                                    }) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [submitting, setSubmitting] = React.useState(false);

    const handleSubmit = async (values: any) => {
        try {
            setSubmitting(true);
            const request: CreateHourRequestDto = {
                hours: values.hours,
                reason: values.reason,
                neededBy: values.neededBy.format('YYYY-MM-DD')
            };

            await hourRequestService.createHourRequest(projectId, request);
            message.success(t('common.hourRequests.messages.createSuccess'));
            onSubmit(request);
            form.resetFields();
            onClose();
        } catch (error) {
            message.error(t('common.hourRequests.messages.createError'));
        } finally {
            setSubmitting(false);
        }
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
                    rules={[
                        { required: true, message: t('validation.hoursRequired') },
                        { type: 'number', min: 1, message: t('validation.hoursMin') }
                    ]}
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
                    rules={[
                        { required: true, message: t('validation.dateRequired') },
                        {
                            validator: (_, value) => {
                                if (value && value.isBefore(dayjs(), 'day')) {
                                    return Promise.reject('Date cannot be in the past');
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <DatePicker
                        className="w-full"
                        disabledDate={current => current && current < dayjs().startOf('day')}
                    />
                </Form.Item>

                <div className="flex justify-end gap-2">
                    <Button onClick={onClose}>{t('common.cancel')}</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                    >
                        {t('project.submitRequest')}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};
