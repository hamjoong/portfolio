import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { ApiResponse } from '@/types/auth';

/**
 * 백엔드 API와의 통신을 위한 Axios 인스턴스입니다.
 * [리팩토링] 에러 응답에서 메시지를 추출하는 유틸리티 기능을 강화하여 
 * UI 레이어에서 일관된 에러 처리가 가능하도록 개선했습니다.
 */
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<any>>) => {
    // 1. 인증 만료 처리 (401)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        window.location.href = '/login?error=expired';
      }
    }

    // 2. 백엔드 표준 에러 메시지 추출
    const serverMessage = error.response?.data?.message;
    const customError = new Error(serverMessage || '요청 처리 중 오류가 발생했습니다.');
    
    return Promise.reject(customError);
  }
);

export default api;
