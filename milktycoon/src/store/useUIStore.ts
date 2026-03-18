import { create } from 'zustand';

export type ScreenType = 'MAIN' | 'LOBBY' | 'RANCH';
export type IAPTabType = 'GOLD' | 'DIA' | 'PASS';

/**
 * @interface UIState
 * @description UI 관련 상태와 액션을 관리하는 Zustand 스토어의 인터페이스입니다.
 * 화면 전환, 모달 열고 닫기 등의 상태를 포함합니다.
 */
interface UIState {
  /** @property {ScreenType} currentScreen - 현재 표시되고 있는 화면의 종류 */
  currentScreen: ScreenType;
  /** @property {boolean} isSettingsOpen - 설정 모달 오픈 여부 */
  isSettingsOpen: boolean;
  /** @property {boolean} isRankingOpen - 랭킹 모달 오픈 여부 */
  isRankingOpen: boolean;
  /** @property {boolean} isQuestOpen - 퀘스트 모달 오픈 여부 */
  isQuestOpen: boolean;
  /** @property {boolean} isAchievementOpen - 업적 모달 오픈 여부 */
  isAchievementOpen: boolean;
  /** @property {boolean} isShopOpen - 상점 모달 오픈 여부 */
  isShopOpen: boolean;
  /** @property {boolean} isAttendanceOpen - 출석 모달 오픈 여부 */
  isAttendanceOpen: boolean;
  /** @property {boolean} isIAPOpen - 인앱결제(IAP) 모달 오픈 여부 */
  isIAPOpen: boolean;
  /** @property {boolean} isUpgradeOpen - 시설 업그레이드 모달 오픈 여부 */
  isUpgradeOpen: boolean;
  /** @property {boolean} isFactoryOpen - 공장 모달 오픈 여부 */
  isFactoryOpen: boolean;
  /** @property {boolean} isMerchantOpen - 상인 모달 오픈 여부 */
  isMerchantOpen: boolean;
  /** @property {boolean} isStableOpen - 보관소(Stable) 모달 오픈 여부 */
  isStableOpen: boolean;
  /** @property {IAPTabType} iapTab - 인앱결제 모달에서 현재 선택된 탭 */
  iapTab: IAPTabType;
  /** @property {object} actions - UI 상태를 변경하는 액션 함수들 */
  actions: {
    setScreen: (screen: ScreenType) => void;
    setIAPTab: (tab: IAPTabType) => void;
    openSettings: () => void; closeSettings: () => void;
    openRanking: () => void; closeRanking: () => void;
    openQuest: () => void; closeQuest: () => void;
    openAchievement: () => void; closeAchievement: () => void;
    openShop: () => void; closeShop: () => void;
    openAttendance: () => void; closeAttendance: () => void;
    openIAP: (tab: IAPTabType) => void; closeIAP: () => void;
    openUpgrade: () => void; closeUpgrade: () => void;
    openFactory: () => void; closeFactory: () => void;
    openMerchant: () => void; closeMerchant: () => void;
    openStable: () => void; closeStable: () => void;
  };
}

/**
 * @store useUIStore
 * @description UI 상태를 관리하는 Zustand 스토어입니다.
 */
export const useUIStore = create<UIState>((set) => ({
  currentScreen: 'MAIN',
  isSettingsOpen: false,
  isRankingOpen: false,
  isQuestOpen: false,
  isAchievementOpen: false,
  isShopOpen: false,
  isAttendanceOpen: false,
  isIAPOpen: false,
  isUpgradeOpen: false,
  isFactoryOpen: false,
  isMerchantOpen: false,
  isStableOpen: false,
  iapTab: 'GOLD',
  actions: {
    setScreen: (currentScreen) => set({ currentScreen }),
    setIAPTab: (iapTab) => set({ iapTab }),
    openSettings: () => set({ isSettingsOpen: true }),
    closeSettings: () => set({ isSettingsOpen: false }),
    openRanking: () => set({ isRankingOpen: true }),
    closeRanking: () => set({ isRankingOpen: false }),
    openQuest: () => set({ isQuestOpen: true }),
    closeQuest: () => set({ isQuestOpen: false }),
    openAchievement: () => set({ isAchievementOpen: true }),
    closeAchievement: () => set({ isAchievementOpen: false }),
    openShop: () => set({ isShopOpen: true }),
    closeShop: () => set({ isShopOpen: false }),
    openAttendance: () => set({ isAttendanceOpen: true }),
    closeAttendance: () => set({ isAttendanceOpen: false }),
    openIAP: (tab) => set({ isIAPOpen: true, iapTab: tab }),
    closeIAP: () => set({ isIAPOpen: false }),
    openUpgrade: () => set({ isUpgradeOpen: true }),
    closeUpgrade: () => set({ isUpgradeOpen: false }),
    openFactory: () => set({ isFactoryOpen: true }),
    closeFactory: () => set({ isFactoryOpen: false }),
    openMerchant: () => set({ isMerchantOpen: true }),
    closeMerchant: () => set({ isMerchantOpen: false }),
    openStable: () => set({ isStableOpen: true }),
    closeStable: () => set({ isStableOpen: false }),
  },
}));
