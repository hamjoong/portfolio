import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Vite 환경 변수에서 API URL을 가져옴
const API_URL = import.meta.env.VITE_API_SERVER_URL || '/api/v1';

const api = axios.create({
    // 빌드 시점에 환경 변수가 주입되며, 로컬 환경(없을 경우)은 상대 경로인 '/api/v1'을 사용하여 프록시를 통해 8080으로 연결
    baseURL: API_URL || '/api/v1',
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
