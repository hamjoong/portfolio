import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  userId: number | null;
  loginId: string | null;
  nickname: string | null;
  role: string | null;
  credits: number;
  totalSpentCredits: number;
  weeklyFreeReviewUsed: number;
  maxWeeklyFreeLimit: number;
  profileImageUrl: string | null;
  avatarUrl: string | null;
  isLoggedIn: boolean;
  login: (token: string, userId: number, loginId: string, nickname: string, role: string, credits: number, 
          totalSpentCredits: number, weeklyFreeReviewUsed: number, maxWeeklyFreeLimit: number,
          profileImageUrl?: string | null, avatarUrl?: string | null) => void;
  guestLogin: () => void;
  logout: () => void;
  updateNickname: (nickname: string) => void;
  updateProfileImage: (url: string | null) => void;
  updateAvatar: (url: string | null) => void;
  updateCredits: (credits: number, spent: number, used: number, limit: number) => void;
  updateRole: (role: string) => void;
  setGuestUsage: (used: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      userId: null,
      loginId: null,
      nickname: null,
      role: null,
      credits: 0,
      totalSpentCredits: 0,
      weeklyFreeReviewUsed: 0,
      maxWeeklyFreeLimit: 0,
      profileImageUrl: null,
      avatarUrl: null,
      isLoggedIn: false,
      login: (token, userId, loginId, nickname, role, credits, totalSpentCredits, weeklyFreeReviewUsed, maxWeeklyFreeLimit, profileImageUrl = null, avatarUrl = null) => set({ 
        accessToken: token, 
        userId,
        loginId,
        nickname,
        role,
        credits,
        totalSpentCredits,
        weeklyFreeReviewUsed,
        maxWeeklyFreeLimit,
        profileImageUrl,
        avatarUrl,
        isLoggedIn: true 
      }),
      guestLogin: () => set({
        accessToken: 'guest-session',
        userId: 0,
        loginId: 'guest',
        nickname: '방문자',
        role: 'GUEST',
        credits: 0,
        totalSpentCredits: 0,
        weeklyFreeReviewUsed: 0,
        maxWeeklyFreeLimit: 3, // [Why] 비회원도 누적 3회 한도 정보를 유지하기 위함
        profileImageUrl: null,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`,
        isLoggedIn: true
      }),
      logout: () => set({ 
        accessToken: null, 
        userId: null,
        loginId: null,
        nickname: null, 
        role: null, 
        credits: 0,
        totalSpentCredits: 0,
        weeklyFreeReviewUsed: 0,
        maxWeeklyFreeLimit: 0,
        profileImageUrl: null,
        avatarUrl: null,
        isLoggedIn: false 
      }),
      updateNickname: (nickname) => set({ nickname }),
      updateProfileImage: (url) => set({ profileImageUrl: url, avatarUrl: null }),
      updateAvatar: (url) => set({ avatarUrl: url, profileImageUrl: null }),
      updateCredits: (credits, spent, used, limit) => set({ 
        credits, 
        totalSpentCredits: spent, 
        weeklyFreeReviewUsed: used, 
        maxWeeklyFreeLimit: limit 
      }),
      updateRole: (role) => set({ role }),
      setGuestUsage: (used) => set({ weeklyFreeReviewUsed: used }),
    }),
    {
      name: 'auth-storage', // localStorage에 저장될 키 이름
    }
  )
);
