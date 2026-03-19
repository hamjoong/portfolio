import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ATTENDANCE_REWARDS } from '../types/user';
import type { 
  Quest, 
  Achievement, 
  AttendanceReward
} from '../types/user';
import { getExpNeededForLevel } from '../utils/gameHelpers';

const INITIAL_DAILY: Quest[] = [
  { id: 'd_m_1', groupId: 'milk_d', title: '신선한 배달', description: '우유 30개 판매', targetType: 'MILK_SOLD', targetValue: 30, rewardGold: 300, isClaimed: false, type: 'DAILY', tier: 1 },
  { id: 'd_m_2', groupId: 'milk_d', title: '신선한 배달', description: '우유 100개 판매', targetType: 'MILK_SOLD', targetValue: 100, rewardGold: 1000, isClaimed: false, type: 'DAILY', tier: 2 },
  { id: 'd_m_3', groupId: 'milk_d', title: '신선한 배달', description: '우유 300개 판매', targetType: 'MILK_SOLD', targetValue: 300, rewardGold: 3000, isClaimed: false, type: 'DAILY', tier: 3 },
  { id: 'd_w_1', groupId: 'wolf_d', title: '목장 수비대', description: '늑대 1마리 처치', targetType: 'WOLF_KILLED', targetValue: 1, rewardGold: 500, isClaimed: false, type: 'DAILY', tier: 1 },
  { id: 'd_w_2', groupId: 'wolf_d', title: '목장 수비대', description: '늑대 3마리 처치', targetType: 'WOLF_KILLED', targetValue: 3, rewardGold: 1500, isClaimed: false, type: 'DAILY', tier: 2 },
  { id: 'd_w_3', groupId: 'wolf_d', title: '목장 수비대', description: '늑대 10마리 처치', targetType: 'WOLF_KILLED', targetValue: 10, rewardGold: 5000, isClaimed: false, type: 'DAILY', tier: 3 },
  { id: 'd_c_1', groupId: 'click_d', title: '부지런한 손길', description: '젖소 클릭 50회', targetType: 'MILK_ACTION', targetValue: 50, rewardGold: 200, isClaimed: false, type: 'DAILY', tier: 1 },
  { id: 'd_c_2', groupId: 'click_d', title: '부지런한 손길', description: '젖소 클릭 200회', targetType: 'MILK_ACTION', targetValue: 200, rewardGold: 800, isClaimed: false, type: 'DAILY', tier: 2 },
  { id: 'd_c_3', groupId: 'click_d', title: '부지런한 손길', description: '젖소 클릭 500회', targetType: 'MILK_ACTION', targetValue: 500, rewardGold: 2000, isClaimed: false, type: 'DAILY', tier: 3 },
  { id: 'd_g_1', groupId: 'gold_d', title: '오늘의 목표', description: '1,000골드 벌기', targetType: 'GOLD_EARNED', targetValue: 1000, rewardGold: 400, isClaimed: false, type: 'DAILY', tier: 1 },
  { id: 'd_g_2', groupId: 'gold_d', title: '오늘의 목표', description: '5,000골드 벌기', targetType: 'GOLD_EARNED', targetValue: 5000, rewardGold: 2000, isClaimed: false, type: 'DAILY', tier: 2 },
];

const INITIAL_WEEKLY: Quest[] = [
  { id: 'w_m_1', groupId: 'milk_w', title: '주간 우유 왕', description: '우유 500개 판매', targetType: 'MILK_SOLD', targetValue: 500, rewardGold: 5000, isClaimed: false, type: 'WEEKLY', tier: 1 },
  { id: 'w_m_2', groupId: 'milk_w', title: '주간 우유 왕', description: '우유 2,000개 판매', targetType: 'MILK_SOLD', targetValue: 2000, rewardGold: 20000, isClaimed: false, type: 'WEEKLY', tier: 2 },
  { id: 'w_m_3', groupId: 'milk_w', title: '주간 우유 왕', description: '우유 5,000개 판매', targetType: 'MILK_SOLD', targetValue: 5000, rewardGold: 50000, isClaimed: false, type: 'WEEKLY', tier: 3 },
  { id: 'w_w_1', groupId: 'wolf_w', title: '주간 수호자', description: '늑대 20마리 처치', targetType: 'WOLF_KILLED', targetValue: 20, rewardGold: 8000, isClaimed: false, type: 'WEEKLY', tier: 1 },
  { id: 'w_w_2', groupId: 'wolf_w', title: '주간 수호자', description: '늑대 100마리 처치', targetType: 'WOLF_KILLED', targetValue: 100, rewardGold: 40000, isClaimed: false, type: 'WEEKLY', tier: 2 },
  { id: 'w_c_1', groupId: 'cow_w', title: '목장 확장', description: '젖소 3마리 보유', targetType: 'COW_COUNT', targetValue: 3, rewardGold: 3000, isClaimed: false, type: 'WEEKLY', tier: 1 },
  { id: 'w_c_2', groupId: 'cow_w', title: '목장 확장', description: '젖소 10마리 보유', targetType: 'COW_COUNT', targetValue: 10, rewardGold: 10000, isClaimed: false, type: 'WEEKLY', tier: 2 },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'a_m_1', groupId: 'milk_a', title: '우유의 달인', description: '누적 우유 1,000개 판매', targetType: 'MILK_SOLD', targetValue: 1000, rewardDia: 10, isClaimed: false, tier: 1 },
  { id: 'a_m_2', groupId: 'milk_a', title: '우유의 달인', description: '누적 우유 10,000개 판매', targetType: 'MILK_SOLD', targetValue: 10000, rewardDia: 100, isClaimed: false, tier: 2 },
  { id: 'a_m_3', groupId: 'milk_a', title: '우유의 달인', description: '누적 우유 100,000개 판매', targetType: 'MILK_SOLD', targetValue: 100000, rewardDia: 1000, isClaimed: false, tier: 3 },
  { id: 'a_w_1', groupId: 'wolf_a', title: '전설의 사냥꾼', description: '누적 늑대 50마리 처치', targetType: 'WOLF_KILLED', targetValue: 50, rewardDia: 50, isClaimed: false, tier: 1 },
  { id: 'a_w_2', groupId: 'wolf_a', title: '전설의 사냥꾼', description: '누적 늑대 500마리 처치', targetType: 'WOLF_KILLED', targetValue: 500, rewardDia: 500, isClaimed: false, tier: 2 },
  { id: 'a_l_1', groupId: 'level_a', title: '목장 꿈나무', description: '유저 레벨 10 달성', targetType: 'PLAYER_LEVEL', targetValue: 10, rewardDia: 20, isClaimed: false, tier: 1 },
  { id: 'a_l_2', groupId: 'level_a', title: '목장 전문가', description: '유저 레벨 30 달성', targetType: 'PLAYER_LEVEL', targetValue: 30, rewardDia: 100, isClaimed: false, tier: 2 },
  { id: 'a_l_3', groupId: 'level_a', title: '목장의 전설', description: '유저 레벨 100 달성', targetType: 'PLAYER_LEVEL', targetValue: 100, rewardDia: 1000, isClaimed: false, tier: 3 },
  { id: 'a_g_1', groupId: 'gold_a', title: '백만장자', description: '누적 수익 100,000골드', targetType: 'GOLD_EARNED', targetValue: 100000, rewardDia: 100, isClaimed: false, tier: 1 },
  { id: 'a_g_2', groupId: 'gold_a', title: '억만장자', description: '누적 수익 1,000,000골드', targetType: 'GOLD_EARNED', targetValue: 1000000, rewardDia: 1000, isClaimed: false, tier: 2 },
];

interface UserState {
  _hasHydrated: boolean;
  userName: string; avatar: string; gold: number; dia: number; level: number; exp: number;
  attendanceDays: number; lastAttendanceDate: string | null;
  dailyQuests: Quest[]; weeklyQuests: Quest[]; achievements: Achievement[];
  settings: { bgmVolume: number; sfxVolume: number; vibration: boolean; pushEnabled: boolean; };
  tutorialPhase: number; // 0: initial, 1: in-progress, -1: finished
  tutorialStep: number;
  isTutorialSkipped: boolean;
  actions: {
    setHasHydrated: (s: boolean) => void;
    addGold: (a: number) => void; addDia: (a: number) => void; addExp: (a: number) => void;
    checkAttendance: () => { success: boolean; reward: AttendanceReward | null };
    claimQuestReward: (id: string, type: 'DAILY' | 'WEEKLY') => void;
    claimAchievementReward: (id: string) => void;
    updateSettings: (s: Partial<UserState['settings']>) => void;
    startTutorial: () => void;
    setTutorialStep: (s: number) => void;
    completeTutorial: () => void;
    skipTutorial: () => void;
  };
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      userName: "초보 목장주", avatar: "👨‍🌾", gold: 1000, dia: 10, level: 1, exp: 0,
      attendanceDays: 0, lastAttendanceDate: null,
      dailyQuests: INITIAL_DAILY, weeklyQuests: INITIAL_WEEKLY, achievements: INITIAL_ACHIEVEMENTS,
      settings: { bgmVolume: 80, sfxVolume: 100, vibration: true, pushEnabled: true },
      tutorialPhase: 0,
      tutorialStep: 0,
      isTutorialSkipped: false,
      actions: {
        setHasHydrated: (s) => set({ _hasHydrated: s }),
        addGold: (a) => set((s) => ({ gold: (s.gold || 0) + a })),
        addDia: (a) => set((s) => ({ dia: (s.dia || 0) + a })),
        addExp: (a) => set((s) => {
          let newLevel = s.level;
          let newExp = (s.exp || 0) + a;
          let expNeeded = getExpNeededForLevel(newLevel);

          while (newExp >= expNeeded) {
            newExp -= expNeeded;
            newLevel += 1;
            expNeeded = getExpNeededForLevel(newLevel);
          }

          return { level: newLevel, exp: newExp };
        }),
        checkAttendance: () => {
          const today = new Date().toISOString().split('T')[0];
          const { lastAttendanceDate, attendanceDays } = get();
          if (lastAttendanceDate !== today) {
            const nextDay = (attendanceDays % 7) + 1;
            const reward = ATTENDANCE_REWARDS[nextDay - 1];
            set((s) => ({ 
              attendanceDays: nextDay, 
              lastAttendanceDate: today, 
              gold: (s.gold || 0) + (reward.type === 'GOLD' ? reward.amount : 0), 
              dia: (s.dia || 0) + (reward.type === 'DIA' ? reward.amount : 0) 
            }));
            return { success: true, reward };
          }
          return { success: false, reward: null };
        },
        claimQuestReward: (id, type) => {
          const listName = type === 'DAILY' ? 'dailyQuests' : 'weeklyQuests';
          const quests = get()[listName];
          const quest = quests.find(q => q.id === id);
          if (quest) {
            set((s) => ({
              gold: (s.gold || 0) + quest.rewardGold,
              [listName]: s[listName].map((q) => q.id === id ? { ...q, isClaimed: true } : q)
            } as Partial<UserState>));
          }
        },
        claimAchievementReward: (id) => {
          const achievement = get().achievements.find(a => a.id === id);
          if (achievement) {
            set((s) => ({
              dia: (s.dia || 0) + achievement.rewardDia,
              achievements: s.achievements.map(a => a.id === id ? { ...a, isClaimed: true } : a)
            }));
          }
        },
        updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),
        startTutorial: () => set({ tutorialPhase: 1, tutorialStep: 0, isTutorialSkipped: false }),
        setTutorialStep: (s) => set({ tutorialStep: s }),
        completeTutorial: () => set({ tutorialPhase: -1, tutorialStep: 0, isTutorialSkipped: false }),
        skipTutorial: () => set({ tutorialPhase: -1, tutorialStep: 0, isTutorialSkipped: true }),
      },
    }),
    { 
      name: 'milk-tycoon-user-v2', 
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.actions.setHasHydrated(true);
      },
    }
  )
);
