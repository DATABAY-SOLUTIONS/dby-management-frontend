import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Initialize axios with the token if it exists
const token = localStorage.getItem('auth_token');

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Only remove token and redirect if we're not already on the login page
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('auth_token');
                delete api.defaults.headers.common['Authorization'];
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
