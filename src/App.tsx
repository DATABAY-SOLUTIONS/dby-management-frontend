import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme as antTheme } from 'antd';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './components/LoginPage';
import { MainLayout } from './layouts/MainLayout';
import { AdminRoutes } from './routes/AdminRoutes';

function App() {
  const { isAuthenticated, theme: colorTheme } = useAuthStore();

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
}

export default App;