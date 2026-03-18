import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MainScreen from './components/MainScreen';
import LobbyScreen from './components/LobbyScreen';
import RanchScreen from './components/RanchScreen';
import AttendanceModal from './components/AttendanceModal';
import SplashScreen from './components/SplashScreen';
import SettingsModal from './components/SettingsModal';
import RankingModal from './components/RankingModal';
import ShopModal from './components/ShopModal';
import QuestModal from './components/QuestModal';
import AchievementModal from './components/AchievementModal';
import IAPModal from './components/IAPModal';
import UpgradeModal from './components/UpgradeModal';
import FactoryModal from './components/FactoryModal';
import StableModal from './components/StableModal';
import TutorialOverlay from './components/TutorialOverlay';
import { useGameLoop } from './hooks/useGameLoop';
import { useUIStore } from './store/useUIStore';
import { useUserStore } from './store/useUserStore';

/**
 * @function App
 * @description 애플리케이션의 최상위 루트 컴포넌트입니다.
 * 화면 렌더링, 전역 모달 관리, 게임 루프 초기화 등의 핵심 로직을 담당합니다.
 * @returns {JSX.Element}
 */
function App() {
  const { 
    currentScreen,
    isSettingsOpen, isRankingOpen, isShopOpen, 
    isQuestOpen, isAchievementOpen, isAttendanceOpen, 
    isStableOpen,
    actions: uiActions 
  } = useUIStore();

  const [isLoading, setIsLoading] = useState(true);

  const { tutorialPhase, actions: userActions } = useUserStore();
  
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
      case 'LOBBY': return <LobbyScreen onEnterRanch={() => uiActions.setScreen('RANCH')} onBack={() => ui.actions.setScreen('MAIN')} />;
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
