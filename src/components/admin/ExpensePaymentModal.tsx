import React from 'react';
import { Modal, Form, Input, DatePicker, Select, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';
import { ExpensePayment } from '../../types/project';
import dayjs from 'dayjs';

interface ExpensePaymentModalProps {
    payment?: ExpensePayment;
    visible: boolean;
    onClose: () => void;
    onSubmit: (values: Omit<ExpensePayment, 'id' | 'expenseId'>) => Promise<void>;
    loading?: boolean;
}

export const ExpensePaymentModal: React.FC<ExpensePaymentModalProps> = ({
                                                                            payment,
                                                                            visible,
                                                                            onClose,
                                                                            onSubmit,
                                                                            loading
                                                                        }) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();

    React.useEffect(() => {
        if (payment) {
            form.setFieldsValue({
                ...payment,
                date: dayjs(payment.date)
            });
        } else {
            form.resetFields();
        }
    }, [payment, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await onSubmit({
                ...values,
                date: values.date.format('YYYY-MM-DD')
            });
            form.resetFields();
            onClose();
        } catch (error) {
            // Form validation error
        }
    };

    return (
        <Modal
            title={payment ? t('admin.expenses.payments.edit') : t('admin.expenses.payments.create')}
            open={visible}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    status: 'pending',
                    paymentMethod: 'bank-transfer'
                }}
            >
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
                    name="date"
                    label={t('common.date')}
                    rules={[{ required: true, message: t('validation.dateRequired') }]}
                >
                    <DatePicker className="w-full" />
                </Form.Item>

                <Form.Item
                    name="paymentMethod"
                    label={t('admin.expenses.payments.method')}
                    rules={[{ required: true }]}
                >
                    <Select>
                        <Select.Option value="bank-transfer">{t('admin.expenses.payments.methods.bankTransfer')}</Select.Option>
                        <Select.Option value="credit-card">{t('admin.expenses.payments.methods.creditCard')}</Select.Option>
                        <Select.Option value="cash">{t('admin.expenses.payments.methods.cash')}</Select.Option>
                        <Select.Option value="other">{t('admin.expenses.payments.methods.other')}</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="reference"
                    label={t('admin.expenses.payments.reference')}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="notes"
                    label={t('common.notes')}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    name="status"
                    label={t('common.status')}
                    rules={[{ required: true }]}
                >
                    <Select>
                        <Select.Option value="pending">{t('admin.expenses.payments.status.pending')}</Select.Option>
                        <Select.Option value="completed">{t('admin.expenses.payments.status.completed')}</Select.Option>
                        <Select.Option value="cancelled">{t('admin.expenses.payments.status.cancelled')}</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};
