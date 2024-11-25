import React, { useState } from 'react';
import { Modal, Form, Input, Radio, Button } from 'antd';
import { HourRequest, ReviewHourRequestDto } from '../../services/hourRequests';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface ReviewHourRequestModalProps {
    request: HourRequest | null;
    visible: boolean;
    onClose: () => void;
    onSubmit: (review: ReviewHourRequestDto) => Promise<void>;
}

export const ReviewHourRequestModal: React.FC<ReviewHourRequestModalProps> = ({
                                                                                  request,
                                                                                  visible,
                                                                                  onClose,
                                                                                  onSubmit
                                                                              }) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const values = await form.validateFields();
            await onSubmit(values);
            form.resetFields();
            onClose();
        } catch (error) {
            // Form validation error
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title={t('common.hourRequests.review.title')}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    {t('common.hourRequests.review.cancel')}
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleSubmit}
                    loading={submitting}
                >
                    {t('common.hourRequests.review.submit')}
                </Button>
            ]}
        >
            {request && (
                <div className="space-y-6">
                    <div>
                        <div className="text-sm text-gray-500 mb-1">
                            {t('common.hourRequests.review.requestDetails')}:
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div>
                                <strong>{t('common.hourRequests.review.hoursRequested')}:</strong> {request.hours}h
                            </div>
                            <div>
                                <strong>{t('common.hourRequests.fields.neededBy')}:</strong>{' '}
                                {dayjs(request.neededBy).format('MMM D, YYYY')}
                            </div>
                            <div className="whitespace-pre-wrap">
                                <strong>{t('common.hourRequests.fields.reason')}:</strong><br />
                                {request.reason}
                            </div>
                        </div>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{ status: 'approved' }}
                    >
                        <Form.Item
                            name="status"
                            label={t('common.hourRequests.review.decision')}
                            rules={[{ required: true }]}
                        >
                            <Radio.Group>
                                <Radio.Button value="approved">
                                    {t('common.hourRequests.review.approve')}
                                </Radio.Button>
                                <Radio.Button value="rejected">
                                    {t('common.hourRequests.review.reject')}
                                </Radio.Button>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            name="reviewNotes"
                            label={t('common.hourRequests.review.reviewNotes')}
                            rules={[{ required: true }]}
                        >
                            <Input.TextArea
                                rows={4}
                                placeholder={t('common.hourRequests.review.notesPlaceholder')}
                            />
                        </Form.Item>
                    </Form>
                </div>
            )}
        </Modal>
    );
};
