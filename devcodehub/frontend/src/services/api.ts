import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from './constants';

const api = axios.create({
    // 빌드 시점에 VITE_API_SERVER_URL이 주입되며, 없으면 상대 경로 '/api/v1'을 써서 프록시/동일 출처로 연결
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        if (response.data && response.data.success === true) {
            response.data = response.data.data;
        }
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default api;
