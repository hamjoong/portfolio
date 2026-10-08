import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { signOutSupabase } from '@/utils/supabaseAuth';

interface AuthState {
  isLoggedIn: boolean;
  userId: string | null;
  email: string | null;
  role: string | null; // [추가] 사용자 권한 (ROLE_USER, ROLE_ADMIN 등)
  _hasHydrated: boolean;
  
  setHasHydrated: (state: boolean) => void;
  login: (userId: string, email: string, token: string, role: string, refreshToken?: string) => void;
  logout: (revokeServerSession?: boolean, redirectTo?: string) => Promise<void>;
}

/**
 * 전역 인증 상태를 관리하는 Store입니다.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      userId: null,
      email: null,
      role: null,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      login: (userId, email, token, role, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', token);
          if (refreshToken) localStorage.setItem('supabaseRefreshToken', refreshToken);
          else localStorage.removeItem('supabaseRefreshToken');
        }
        set({ isLoggedIn: true, userId, email, role });
      },

      logout: async (revokeServerSession = true, redirectTo = '/login') => {
        if (typeof window !== 'undefined') {
          const accessToken = localStorage.getItem('accessToken');
          if (revokeServerSession && accessToken) {
            try {
              await signOutSupabase(accessToken);
            } catch (error) {
              console.error('[Auth] Supabase server-side logout failed; clearing the local session.', error);
            }
          }
          localStorage.removeItem('accessToken');
          localStorage.removeItem('supabaseRefreshToken');
        }
        set({ isLoggedIn: false, userId: null, email: null, role: null });
        if (typeof window !== 'undefined') window.location.href = redirectTo;
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
