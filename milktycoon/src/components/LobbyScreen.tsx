import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';
import { useGameStore } from '../store/useGameStore';
import { useUIStore } from '../store/useUIStore';
import StatusBar from './StatusBar';
import { 
  Home, ShoppingBag, ClipboardList, 
  Settings, Award, CalendarCheck, ChevronRight, HelpCircle, Hammer
} from 'lucide-react';
import { LobbyBackground, RankingBoard } from './LobbyComponents';

interface LobbyScreenProps {
  onEnterRanch: () => void;
}

/** 
 * @function LobbyScreen
 * @description 게임의 메인 로비 화면을 렌더링하는 컴포넌트입니다.
 * 퀘스트, 업적, 상점, 랭킹 등 다양한 메뉴로 진입하는 허브 역할을 합니다.
 * @param {LobbyScreenProps} props - 컴포넌트 props
 */
const LobbyScreen: React.FC<LobbyScreenProps> = ({ onEnterRanch }) => {
  const _hasHydrated = useUserStore((state) => state._hasHydrated);
  const tutorialPhase = useUserStore((state) => state.tutorialPhase);
  const isTutorialSkipped = useUserStore((state) => state.isTutorialSkipped);
  const dailyQuests = useUserStore((state) => state.dailyQuests);
  const weeklyQuests = useUserStore((state) => state.weeklyQuests);
  const achievements = useUserStore((state) => state.achievements);
  const userActions = useUserStore((state) => state.actions);

  const dailyRanking = useGameStore((state) => state.dailyRanking);
  const weeklyRanking = useGameStore((state) => state.weeklyRanking);
  const stats = useGameStore((state) => state.stats);
  const cows = useGameStore((state) => state.cows);
  const ranchLevel = useGameStore((state) => state.ranchLevel);

  const uiActions = useUIStore((state) => state.actions);
  
  const checkHandled = useRef(false);

  // 보상 가능 여부 확인
  const hasClaimableQuest = [...dailyQuests, ...weeklyQuests].some(q => {
    if (q.isClaimed) return false;
    let progress = 0;
    switch (q.targetType) {
      case 'MILK_SOLD': progress = stats.totalMilkSold || 0; break;
      case 'WOLF_KILLED': progress = stats.totalWolvesKilled || 0; break;
      case 'COW_COUNT': progress = cows?.length || 0; break;
      case 'GOLD_EARNED': progress = stats.totalGoldEarned || 0; break;
      case 'MILK_ACTION': progress = stats.totalMilkClicks || 0; break;
    }
    return progress >= q.targetValue;
  });

  const hasClaimableAchievement = achievements.some(a => {
    if (a.isClaimed) return false;
    let progress = 0;
    switch (a.targetType) {
      case 'MILK_SOLD': progress = stats.totalMilkSold || 0; break;
      case 'WOLF_KILLED': progress = stats.totalWolvesKilled || 0; break;
      case 'COW_COUNT': progress = cows?.length || 0; break;
      case 'GOLD_EARNED': progress = stats.totalGoldEarned || 0; break;
      case 'PLAYER_LEVEL': progress = ranchLevel || 1; break;
    }
    return progress >= a.targetValue;
  });

  useEffect(() => {
    if (_hasHydrated && !checkHandled.current) {
      if (userActions && typeof userActions.checkAttendance === 'function') {
        checkHandled.current = true;
        const result = userActions.checkAttendance();
        if (result && result.success) {
          const timer = setTimeout(() => uiActions.openAttendance(), 1000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [_hasHydrated, userActions, uiActions]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-h-sky-base via-h-sky-soft to-h-green-light font-game text-h-text flex">
      <LobbyBackground />

      {/* 2. LEFT MENU AREA (1/3 Width) */}
      <div className="w-[32%] h-full flex flex-col relative z-10 p-8 pt-6">
        <div className="mb-10 drop-shadow-xl"><StatusBar /></div>
        
        <div className="flex-1 flex flex-col gap-4 justify-center py-4 overflow-y-auto custom-scrollbar pr-2">
          <MenuListItem 
            icon={<ClipboardList size={28} strokeWidth={3} />} 
            label="퀘스트" 
            color="bg-h-sky-base" 
            shadow="shadow-2.5d-blue" 
            onClick={uiActions.openQuest} 
            showBadge={hasClaimableQuest}
          />
          <MenuListItem 
            icon={<Award size={28} strokeWidth={3} />} 
            label="업적" 
            color="bg-purple-400" 
            shadow="shadow-[0_6px_0_0_#9333ea]" 
            onClick={uiActions.openAchievement} 
            showBadge={hasClaimableAchievement}
          />
          <MenuListItem 
            icon={<Home size={28} strokeWidth={3} />} 
            label="보관소" 
            color="bg-h-green-base" 
            shadow="shadow-2.5d-green" 
            onClick={uiActions.openStable} 
          />
          <MenuListItem icon={<Hammer size={28} strokeWidth={3} />} label="시설 관리" color="bg-orange-400" shadow="shadow-[0_6px_0_0_#ea580c]" onClick={uiActions.openUpgrade} />
          <MenuListItem icon={<CalendarCheck size={28} strokeWidth={3} />} label="출석" color="bg-pink-400" shadow="shadow-[0_6px_0_0_#db2777]" onClick={uiActions.openAttendance} />
          <MenuListItem icon={<ShoppingBag size={28} strokeWidth={3} />} label="상점" color="bg-yellow-500" shadow="shadow-[0_6px_0_0_#ca8a04]" onClick={uiActions.openShop} />
          
          {(isTutorialSkipped || tutorialPhase !== -1) && (
            <MenuListItem 
              icon={<HelpCircle size={28} strokeWidth={3} />} 
              label="튜토리얼" 
              color="bg-h-orange-warm" 
              shadow="shadow-2.5d-orange"
              onClick={userActions.startTutorial} 
            />
          )}
        </div>

        <div className="mt-auto pt-4">
          <motion.button 
            whileHover={{ scale: 1.05, y: -4 }} 
            whileTap={{ scale: 0.95, y: 8 }} 
            onClick={onEnterRanch} 
            className="w-full py-8 bg-h-green-base text-h-milk text-3xl font-black rounded-[3rem] shadow-2.5d-green border-4 border-h-green-light flex items-center justify-center gap-4 transition-all duration-75 active:shadow-none"
          >
            <Home size={40} strokeWidth={4} /> 목장 입장
          </motion.button>
        </div>
      </div>

      {/* 3. RIGHT RANKING BOARD (2/3 Width) */}
      <div className="w-[68%] h-full relative z-20 p-8 flex flex-col">
        {/* Settings Button */}
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          onClick={uiActions.openSettings} 
          className="absolute top-10 right-10 w-16 h-16 bg-h-milk/90 backdrop-blur rounded-[1.5rem] shadow-2.5d-white border-4 border-h-green-light flex items-center justify-center text-h-brown-deep transition-all z-30 active:shadow-none active:translate-y-2"
        >
          <Settings size={32} strokeWidth={3} />
        </motion.button>

        <RankingBoard dailyRanking={dailyRanking} weeklyRanking={weeklyRanking} />
      </div>
    </div>
  );
};

interface MenuListItemProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  shadow: string;
  onClick: () => void;
  showBadge?: boolean;
}

const MenuListItem: React.FC<MenuListItemProps> = React.memo(({ icon, label, color, shadow, onClick, showBadge }) => (
  <motion.button 
    whileHover={{ x: 20, scale: 1.02 }} 
    whileTap={{ scale: 0.96, x: 10 }} 
    onClick={onClick} 
    className="flex items-center gap-6 group w-full text-left bg-h-milk/40 p-2 rounded-[2.5rem] border-2 border-h-milk/50 hover:bg-h-milk/70 transition-all shrink-0 relative"
  >
    <div className={`${color} ${shadow} w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-h-milk border-4 border-h-milk/30 group-active:shadow-none group-active:translate-y-1 transition-all duration-75 relative`}>
      {icon}
      {showBadge && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 border-4 border-white rounded-full shadow-lg flex items-center justify-center"
        >
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </motion.div>
      )}
    </div>
    <div className="flex-1">
      <span className="font-black text-2xl text-h-text block tracking-tighter mb-0.5 drop-shadow-sm">{label}</span>
      <span className="text-[10px] font-black text-h-brown-soft/60 uppercase tracking-[0.2em]">Open Menu</span>
    </div>
    <div className="bg-h-milk/60 p-3 rounded-full mr-4 group-hover:bg-h-green-base group-hover:text-h-milk transition-all">
      <ChevronRight size={24} strokeWidth={4} />
    </div>
  </motion.button>
));

export default LobbyScreen;
