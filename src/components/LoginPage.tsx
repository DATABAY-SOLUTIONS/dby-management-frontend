import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuthStore();
  const { t } = useTranslation();

  const handleSubmit = async (values: LoginFormData) => {
    try {
      await login(values.email, values.password);
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="https://databay.solutions/wp-content/uploads/2024/08/Sin-titulo-2908-%C3%97-628-px-600-%C3%97-600-px-300-%C3%97-600-px-600-%C3%97-300-px-1.webp" 
              alt="Logo" 
              className="h-16 w-auto"
            />
          </div>
          <Title level={2}>Herramienta de bolsa de horas</Title>
          <p className="text-gray-500">{t('auth.loginToContinue')}</p>
        </div>

        <Form
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ email: 'demo@example.com', password: 'demo' }}
        >
          <Form.Item
            name="email"
            label={t('auth.email')}
            rules={[
              { required: true, message: t('validation.emailRequired') },
              { type: 'email', message: t('validation.emailInvalid') }
            ]}
            validateStatus={error ? 'error' : ''}
          >
            <Input 
              prefix={<Mail className="text-gray-400" size={16} />} 
              placeholder={t('auth.emailPlaceholder')}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={t('auth.password')}
            rules={[{ required: true, message: t('validation.passwordRequired') }]}
            validateStatus={error ? 'error' : ''}
            help={error}
          >
            <Input.Password 
              prefix={<Lock className="text-gray-400" size={16} />}
              placeholder={t('auth.passwordPlaceholder')}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} block>
              {t('auth.login')}
            </Button>
          </Form.Item>

          <div className="text-center text-sm text-gray-500">
            <p>{t('auth.demoCredentials')}</p>
            <p>Email: demo@example.com</p>
            <p>Password: demo</p>
          </div>
        </Form>
      </Card>
    </div>
  );
};