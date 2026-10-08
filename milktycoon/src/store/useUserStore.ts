import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ATTENDANCE_REWARDS } from '../types/user';
import type { 
  Quest, 
  Achievement, 
  AttendanceReward
} from '../types/user';
import type { GameStats } from '../types/game';
import { calculateProgress } from '../utils/gameHelpers';
import { useGameStore } from './useGameStore';

const EMPTY_STATS: GameStats = { totalMilkSold: 0, totalWolvesKilled: 0, totalGoldEarned: 0, totalMilkClicks: 0 };

/** 기기 로컬 시간 기준 YYYY-MM-DD. toISOString()은 UTC라 한국에서는 오전 9시에 날짜가 바뀐다. */
const toLocalDateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** 해당 주 월요일의 날짜 키. 주간 퀘스트 초기화 기준으로 쓴다. */
const toWeekKey = (d: Date): string => {
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return toLocalDateKey(monday);
};

const resetQuests = (quests: Quest[]): Quest[] => quests.map(q => ({ ...q, isClaimed: false }));

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
  { id: 'a_m_1', groupId: 'milk_a', title: '우유의 달인', description: '누적 우유 1,000개 판매', targetType: 'MILK_SOLD', targetValue: 1000, rewardGold: 1000, isClaimed: false, tier: 1 },
  { id: 'a_m_2', groupId: 'milk_a', title: '우유의 달인', description: '누적 우유 10,000개 판매', targetType: 'MILK_SOLD', targetValue: 10000, rewardGold: 10000, isClaimed: false, tier: 2 },
  { id: 'a_m_3', groupId: 'milk_a', title: '우유의 달인', description: '누적 우유 100,000개 판매', targetType: 'MILK_SOLD', targetValue: 100000, rewardGold: 100000, isClaimed: false, tier: 3 },
  { id: 'a_w_1', groupId: 'wolf_a', title: '전설의 사냥꾼', description: '누적 늑대 50마리 처치', targetType: 'WOLF_KILLED', targetValue: 50, rewardGold: 5000, isClaimed: false, tier: 1 },
  { id: 'a_w_2', groupId: 'wolf_a', title: '전설의 사냥꾼', description: '누적 늑대 500마리 처치', targetType: 'WOLF_KILLED', targetValue: 500, rewardGold: 50000, isClaimed: false, tier: 2 },
  { id: 'a_l_1', groupId: 'level_a', title: '목장 꿈나무', description: '목장 레벨 3 달성', targetType: 'PLAYER_LEVEL', targetValue: 3, rewardGold: 2000, isClaimed: false, tier: 1 },
  { id: 'a_l_2', groupId: 'level_a', title: '목장 전문가', description: '목장 레벨 5 달성', targetType: 'PLAYER_LEVEL', targetValue: 5, rewardGold: 10000, isClaimed: false, tier: 2 },
  { id: 'a_l_3', groupId: 'level_a', title: '목장의 전설', description: '목장 레벨 7 달성', targetType: 'PLAYER_LEVEL', targetValue: 7, rewardGold: 100000, isClaimed: false, tier: 3 },
  { id: 'a_g_1', groupId: 'gold_a', title: '백만장자', description: '누적 수익 100,000골드', targetType: 'GOLD_EARNED', targetValue: 100000, rewardGold: 10000, isClaimed: false, tier: 1 },
  { id: 'a_g_2', groupId: 'gold_a', title: '억만장자', description: '누적 수익 1,000,000골드', targetType: 'GOLD_EARNED', targetValue: 1000000, rewardGold: 100000, isClaimed: false, tier: 2 },
];

interface UserState {
  _hasHydrated: boolean;
  userName: string; avatar: string; gold: number;
  attendanceDays: number; lastAttendanceDate: string | null;
  /** 일일·주간 퀘스트를 마지막으로 초기화한 날짜/주 키와 그 시점의 누적 통계(기간 내 진행도 계산용) */
  dailyResetKey: string | null; weeklyResetKey: string | null;
  dailyBaseline: GameStats; weeklyBaseline: GameStats;
  dailyQuests: Quest[]; weeklyQuests: Quest[]; achievements: Achievement[];
  settings: { bgmVolume: number; sfxVolume: number; vibration: boolean; pushEnabled: boolean; };
  tutorialPhase: number; // 0: initial, 1: in-progress, -1: finished
  tutorialStep: number;
  isTutorialSkipped: boolean;
  actions: {
    setHasHydrated: (s: boolean) => void;
    addGold: (a: number) => void;
    refreshQuests: () => void;
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
      userName: "초보 목장주", avatar: "👨‍🌾", gold: 1000,
      attendanceDays: 0, lastAttendanceDate: null,
      dailyResetKey: null, weeklyResetKey: null, dailyBaseline: EMPTY_STATS, weeklyBaseline: EMPTY_STATS,
      dailyQuests: INITIAL_DAILY, weeklyQuests: INITIAL_WEEKLY, achievements: INITIAL_ACHIEVEMENTS,
      settings: { bgmVolume: 80, sfxVolume: 100, vibration: true, pushEnabled: true },
      tutorialPhase: 0,
      tutorialStep: 0,
      isTutorialSkipped: false,
      actions: {
        setHasHydrated: (s) => set({ _hasHydrated: s }),
        addGold: (a) => set((s) => ({ gold: (s.gold || 0) + a })),
        refreshQuests: () => {
          const now = new Date();
          const todayKey = toLocalDateKey(now);
          const weekKey = toWeekKey(now);
          const { dailyResetKey, weeklyResetKey } = get();
          if (dailyResetKey === todayKey && weeklyResetKey === weekKey) return;
          const stats = { ...useGameStore.getState().stats };
          set((s) => ({
            ...(dailyResetKey !== todayKey && { dailyResetKey: todayKey, dailyBaseline: stats, dailyQuests: resetQuests(s.dailyQuests) }),
            ...(weeklyResetKey !== weekKey && { weeklyResetKey: weekKey, weeklyBaseline: stats, weeklyQuests: resetQuests(s.weeklyQuests) }),
          }));
        },
        checkAttendance: () => {
          const today = toLocalDateKey(new Date());
          const { lastAttendanceDate, attendanceDays } = get();
          if (lastAttendanceDate !== today) {
            const nextDay = (attendanceDays % 7) + 1;
            const reward = ATTENDANCE_REWARDS[nextDay - 1];
            set((s) => ({ 
              attendanceDays: nextDay, 
              lastAttendanceDate: today, 
              gold: (s.gold || 0) + (reward.type === 'GOLD' ? reward.amount : 0),
            }));
            // 탄약은 게임 스토어의 인벤토리에 지급한다.
            if (reward.type === 'AMMO') useGameStore.getState().actions.buyAmmo(reward.amount);
            return { success: true, reward };
          }
          return { success: false, reward: null };
        },
        claimQuestReward: (id, type) => {
          const listName = type === 'DAILY' ? 'dailyQuests' : 'weeklyQuests';
          const baseline = type === 'DAILY' ? get().dailyBaseline : get().weeklyBaseline;
          const quest = get()[listName].find(q => q.id === id);
          if (!quest || quest.isClaimed) return;
          const game = useGameStore.getState();
          // UI 버튼 외의 경로로 호출돼도 달성하지 못한 퀘스트는 받을 수 없게 한다.
          if (calculateProgress(quest.targetType, game.stats, game.cows, game.ranchLevel, baseline) < quest.targetValue) return;
          set((s) => ({
            gold: (s.gold || 0) + quest.rewardGold,
            [listName]: s[listName].map((q) => q.id === id ? { ...q, isClaimed: true } : q)
          } as Partial<UserState>));
        },
        claimAchievementReward: (id) => {
          const achievement = get().achievements.find(a => a.id === id);
          if (!achievement || achievement.isClaimed) return;
          const game = useGameStore.getState();
          if (calculateProgress(achievement.targetType, game.stats, game.cows, game.ranchLevel) < achievement.targetValue) return;
          set((s) => ({
            gold: (s.gold || 0) + achievement.rewardGold,
            achievements: s.achievements.map(a => a.id === id ? { ...a, isClaimed: true } : a)
          }));
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
      version: 2,
      storage: createJSONStorage(() => localStorage),
      // 업적 목표가 바뀌었으므로 저장본의 업적은 최신 정의로 교체하되, 수령 여부만 id로 이어받는다.
      migrate: (persisted) => {
        // v2: 다이아 재화를 없애고 업적 보상을 골드로 바꿨다. 저장본의 dia는 버린다.
        const old = { ...(persisted as Partial<UserState> & { dia?: number }) };
        delete old.dia;
        const claimed = new Set((old.achievements ?? []).filter(a => a.isClaimed).map(a => a.id));
        return { ...old, achievements: INITIAL_ACHIEVEMENTS.map(a => ({ ...a, isClaimed: claimed.has(a.id) })) } as UserState;
      },
      partialize: (state) => ({
        userName: state.userName,
        avatar: state.avatar,
        gold: state.gold,
        attendanceDays: state.attendanceDays,
        lastAttendanceDate: state.lastAttendanceDate,
        dailyResetKey: state.dailyResetKey,
        weeklyResetKey: state.weeklyResetKey,
        dailyBaseline: state.dailyBaseline,
        weeklyBaseline: state.weeklyBaseline,
        dailyQuests: state.dailyQuests,
        weeklyQuests: state.weeklyQuests,
        achievements: state.achievements,
        settings: state.settings,
        tutorialPhase: state.tutorialPhase,
        tutorialStep: state.tutorialStep,
        isTutorialSkipped: state.isTutorialSkipped
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.actions.setHasHydrated(true);
      },
    }
  )
);
