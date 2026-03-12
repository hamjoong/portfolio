import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  isLoggedIn: boolean;
  isGuest: boolean;
  userId: string | null;
  email: string | null;
  _hasHydrated: boolean; // [디버깅] Hydration 여부 추적
  
  setHasHydrated: (state: boolean) => void;
  login: (userId: string, email: string, token: string) => void;
  guestLogin: (token: string) => void;
  logout: () => void;
}

/**
 * 전역 인증 상태를 관리하는 Store입니다.
 * [디버깅] Next.js의 SSR과 클라이언트 스토리지 간의 데이터 불일치(Hydration Error)를 
 * 방지하기 위해 _hasHydrated 플래그와 안전한 스토리지 접근 로직을 추가했습니다.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      isGuest: false,
      userId: null,
      email: null,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      login: (userId, email, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', token);
        }
        set({ isLoggedIn: true, isGuest: false, userId, email });
      },

      guestLogin: (token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', token);
        }
        set({ isLoggedIn: false, isGuest: true, userId: 'GUEST', email: null });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
        set({ isLoggedIn: false, isGuest: false, userId: null, email: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// SSR 환경을 위한 더미 스토리지
const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
