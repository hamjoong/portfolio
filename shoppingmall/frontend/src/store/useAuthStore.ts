import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  isLoggedIn: boolean;
  isGuest: boolean;
  userId: string | null;
  email: string | null;
  role: string | null; // [추가] 사용자 권한 (ROLE_USER, ROLE_ADMIN 등)
  _hasHydrated: boolean;
  
  setHasHydrated: (state: boolean) => void;
  login: (userId: string, email: string, token: string, role: string) => void;
  guestLogin: (token: string) => void;
  logout: () => void;
}

/**
 * 전역 인증 상태를 관리하는 Store입니다.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      isGuest: false,
      userId: null,
      email: null,
      role: null,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      login: (userId, email, token, role) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', token);
        }
        set({ isLoggedIn: true, isGuest: false, userId, email, role });
      },

      guestLogin: (token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', token);
        }
        set({ isLoggedIn: false, isGuest: true, userId: 'GUEST', email: null, role: 'ROLE_GUEST' });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
        set({ isLoggedIn: false, isGuest: false, userId: null, email: null, role: null });
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
