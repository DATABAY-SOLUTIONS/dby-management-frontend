import React from 'react';
import { Modal, Form, Input, Select, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import { User } from '../../types/user';

interface UserFormModalProps {
  user?: User;
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<User>) => Promise<void>;
  loading?: boolean;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  user,
  visible,
  onClose,
  onSubmit,
  loading
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        ...user,
        settings: {
          ...user.settings
        }
      });
    } else {
      form.resetFields();
    }
  }, [user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      onClose();
    } catch (error) {
      // Form validation error
    }
  };

  return (
    <Modal
      title={user ? t('admin.users.edit') : t('admin.users.create')}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          role: 'user',
          status: 'active',
          settings: {
            theme: 'light',
            notifications: true,
            emailUpdates: true
          }
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label={t('admin.users.name')}
            rules={[{ required: true, message: 'Please enter user name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label={t('admin.users.email')}
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>
        </div>

        {!user && (
          <Form.Item
            name="password"
            label={t('auth.password')}
            rules={[
              { required: true, message: 'Please enter password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password />
          </Form.Item>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="role"
            label={t('admin.users.role')}
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select
              options={[
                { label: 'Admin', value: 'admin' },
                { label: 'Manager', value: 'manager' },
                { label: 'User', value: 'user' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={t('admin.users.status')}
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' }
              ]}
            />
          </Form.Item>
        </div>

        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium mb-4">{t('auth.userSettings')}</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name={['settings', 'theme']}
              label={t('menu.theme')}
            >
              <Select
                options={[
                  { label: t('menu.lightMode'), value: 'light' },
                  { label: t('menu.darkMode'), value: 'dark' }
                ]}
              />
            </Form.Item>

            <Form.Item
              name={['settings', 'notifications']}
              label={t('menu.notifications')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name={['settings', 'emailUpdates']}
              label={t('menu.emailUpdates')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
};