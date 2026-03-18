import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  isLoggedIn: boolean;
  isGuest: boolean;
  userId: string | null;
  email: string | null;

  initAuth: () => Promise<void>;
  login: (userId: string, email: string, token: string) => Promise<void>;
  guestLogin: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * 모바일 전용 전역 인증 상태 관리입니다.
 * [이유] Expo SecureStore를 활용하여 앱을 껐다 켜도 인증 상태가 유지되도록 설계했습니다.
 */
export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isGuest: false,
  userId: null,
  email: null,

  /**
   * 앱 실행 시 저장된 토큰이 있는지 확인합니다.
   */
  initAuth: async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      // 실제로는 토큰 복호화 또는 프로필 API 호출이 필요할 수 있음
      set({ isLoggedIn: true });
    }
  },

  login: async (userId, email, token) => {
    await SecureStore.setItemAsync('accessToken', token);
    set({ isLoggedIn: true, isGuest: false, userId, email });
  },

  guestLogin: async (token) => {
    await SecureStore.setItemAsync('accessToken', token);
    set({ isLoggedIn: false, isGuest: true, userId: 'GUEST', email: null });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    set({ isLoggedIn: false, isGuest: false, userId: null, email: null });
  },
}));
