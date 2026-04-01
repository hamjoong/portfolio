import { useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MainScreen from './components/MainScreen';
import LobbyScreen from './components/LobbyScreen';
import RanchScreen from './components/RanchScreen';
import SplashScreen from './components/SplashScreen';
import { useGameLoop } from './hooks/useGameLoop';
import { useUIStore } from './store/useUIStore';
import { useUserStore } from './store/useUserStore';

const AttendanceModal = lazy(() => import('./components/AttendanceModal'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const RankingModal = lazy(() => import('./components/RankingModal'));
const ShopModal = lazy(() => import('./components/ShopModal'));
const QuestModal = lazy(() => import('./components/QuestModal'));
const AchievementModal = lazy(() => import('./components/AchievementModal'));
const IAPModal = lazy(() => import('./components/IAPModal'));
const UpgradeModal = lazy(() => import('./components/UpgradeModal'));
const FactoryModal = lazy(() => import('./components/FactoryModal'));
const StableModal = lazy(() => import('./components/StableModal'));
const TutorialOverlay = lazy(() => import('./components/TutorialOverlay'));

/**
 * @function App
 * @description 애플리케이션의 최상위 루트 컴포넌트입니다.
 * 화면 렌더링, 전역 모달 관리, 게임 루프 초기화 등의 핵심 로직을 담당합니다.
 * @returns {JSX.Element}
 */
function App() {
  const currentScreen = useUIStore((state) => state.currentScreen);
  const isSettingsOpen = useUIStore((state) => state.isSettingsOpen);
  const isRankingOpen = useUIStore((state) => state.isRankingOpen);
  const isShopOpen = useUIStore((state) => state.isShopOpen);
  const isQuestOpen = useUIStore((state) => state.isQuestOpen);
  const isAchievementOpen = useUIStore((state) => state.isAchievementOpen);
  const isAttendanceOpen = useUIStore((state) => state.isAttendanceOpen);
  const isStableOpen = useUIStore((state) => state.isStableOpen);
  const uiActions = useUIStore((state) => state.actions);

  const [isLoading, setIsLoading] = useState(true);

  const tutorialPhase = useUserStore((state) => state.tutorialPhase);
  const userActions = useUserStore((state) => state.actions);
  
  // 게임의 핵심 로직을 처리하는 커스텀 훅입니다.
  useGameLoop();

  /**
   * @function handleStart
   * @description '시작하기' 버튼 클릭 시 호출되는 함수입니다.
   * 화면을 로비로 전환하고, 튜토리얼을 시작합니다.
   */
  const handleStart = () => {
    uiActions.setScreen('LOBBY');
    if (tutorialPhase === 0) {
      userActions.startTutorial();
    }
  };

  /**
   * @function renderScreen
   * @description 현재 `currentScreen` 상태에 따라 적절한 화면을 렌더링합니다.
   * @returns {JSX.Element} 현재 화면에 해당하는 컴포넌트
   */
  const renderScreen = () => {
    switch (currentScreen) {
      case 'MAIN': return <MainScreen onStart={handleStart} />;
      case 'LOBBY': return <LobbyScreen onEnterRanch={() => uiActions.setScreen('RANCH')} onBack={() => uiActions.setScreen('MAIN')} />;
      case 'RANCH': return <RanchScreen onBack={() => uiActions.setScreen('LOBBY')} />;
      default: return <MainScreen onStart={handleStart} />;
    }
  };

  return (
    <div className="w-full h-screen bg-cow-black overflow-hidden font-game text-white relative">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <SplashScreen key="splash" onFinish={() => setIsLoading(false)} />
        ) : (
          <motion.div key="game-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative">
            {renderScreen()}

            {/* 전역 모달 */}
            <Suspense fallback={null}>
              <IAPModal />
              <SettingsModal isOpen={isSettingsOpen} onClose={uiActions.closeSettings} />
              <RankingModal isOpen={isRankingOpen} onClose={uiActions.closeRanking} />
              <ShopModal isOpen={isShopOpen} onClose={uiActions.closeShop} />
              <QuestModal isOpen={isQuestOpen} onClose={uiActions.closeQuest} />
              <AchievementModal isOpen={isAchievementOpen} onClose={uiActions.closeAchievement} />
              <AttendanceModal isOpen={isAttendanceOpen} onClose={uiActions.closeAttendance} />
              <UpgradeModal />
              <FactoryModal />
              <StableModal isOpen={isStableOpen} onClose={uiActions.closeStable} />
              <TutorialOverlay />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
