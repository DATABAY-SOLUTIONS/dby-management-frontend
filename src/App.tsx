import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme as antTheme, Spin } from 'antd';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './components/LoginPage';
import { MainLayout } from './layouts/MainLayout';
import { AdminRoutes } from './routes/AdminRoutes';

const App: React.FC = () => {
    const { isAuthenticated, theme: colorTheme, isLoading, initializeAuth } = useAuthStore();

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <ConfigProvider
            theme={{
                algorithm: colorTheme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#1890ff',
                    borderRadius: 6,
                },
            }}
        >
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/login"
                        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
                    />
                    <Route
                        path="/admin/*"
                        element={isAuthenticated ? <AdminRoutes /> : <Navigate to="/login" replace />}
                    />
                    <Route
                        path="/*"
                        element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}
                    />
                </Routes>
            </BrowserRouter>
        </ConfigProvider>
    );
};

export default App;
