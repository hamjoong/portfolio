import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * 모바일 전용 API 클라이언트 설정입니다.
 * [이유] 안드로이드 에뮬레이터(10.0.2.2)와 iOS 시뮬레이터(localhost)의 주소 체계 차이를 처리하고,
 * Expo SecureStore를 통해 토큰을 안전하게 관리하기 위함입니다.
 */
const getBaseUrl = () => {
  if (__DEV__) {
    return Platform.OS === 'android' ? 'http://10.0.2.2:8080/api/v1' : 'http://localhost:8080/api/v1';
  }
  return 'https://api.your-production-domain.com/api/v1';
};

const api: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('accessToken');
      // 여기에 로그아웃 알림 또는 리다이렉트 로직 추가 가능
    }
    const serverMessage = error.response?.data?.message;
    return Promise.reject(new Error(serverMessage || '서버 통신 중 오류가 발생했습니다.'));
  }
);

export default api;
