import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';
import { useUIStore } from '../store/useUIStore';
import CowComponent from './Cow';
import Wolf from './Wolf';
import MerchantTruck from './MerchantTruck';
import MerchantModal from './MerchantModal';
import { 
  MansionIsometric, 
  SiloIsometric, 
  FactoryIsometric, 
  FencePerimeter, 
  GrassBackground 
} from './IsometricAssets';
import { RanchHUD, ShootingButton } from './RanchUI';

/**
 * @interface RanchScreenProps
 * @description RanchScreen 컴포넌트의 props를 정의합니다.
 * @property {() => void} onBack - '뒤로가기' 버튼 클릭 시 호출될 함수입니다.
 */
interface RanchScreenProps {
  onBack: () => void;
}

/** 
 * @function RanchScreen
 * @description 목장의 메인 게임 화면을 렌더링하는 컴포넌트입니다.
 * 젖소들의 배치, 시설물 관리, 늑대 이벤트 등을 시각적으로 표현합니다.
 * @param {RanchScreenProps} props - 컴포넌트 props
 * @returns {JSX.Element}
 */
const RanchScreen: React.FC<RanchScreenProps> = ({ onBack }) => {
  const cows = useGameStore((state) => state.cows);
  const facilities = useGameStore((state) => state.facilities);
  const inventory = useGameStore((state) => state.inventory);
  const activeProductions = useGameStore((state) => state.activeProductions);
  const isWolfEventActive = useGameStore((state) => state.isWolfEventActive);
  const wolfStats = useGameStore((state) => state.wolfStats);
  const isMerchantPresent = useGameStore((state) => state.isMerchantPresent);
  const merchantTimer = useGameStore((state) => state.merchantTimer);
  const gameActions = useGameStore((state) => state.actions);
  
  const gold = useUserStore((state) => state.gold);
  const userActions = useUserStore((state) => state.actions);
  
  const uiActions = useUIStore((state) => state.actions);

  const prevMerchantPresent = useRef(isMerchantPresent);

  /**
   * @effect
   * @description 상인이 나타났을 때 상인 모달을 자동으로 열어주는 효과입니다.
   * 이전 상인 상태와 현재 상태를 비교하여, 상인이 새로 나타났을 때만 모달을 엽니다.
   */
  useEffect(() => {
    if (!prevMerchantPresent.current && isMerchantPresent) {
      uiActions.openMerchant();
    }
    prevMerchantPresent.current = isMerchantPresent;
  }, [isMerchantPresent, uiActions]);

  /**
   * @function handleShoot
   * @description 늑대 사냥 이벤드 중 '쏘기' 버튼을 클릭했을 때 호출되는 함수입니다.
   * 탄약이 있을 경우 늑대에게 데미지를 입히고, 늑대를 처치하면 보상을 받습니다.
   */
  const handleShoot = () => {
    if (!isWolfEventActive || inventory.ammo <= 0) return;
    const { killed, reward } = gameActions.damageWolf(0); // 0은 무기 데미지를 사용함을 의미
    if (killed) {
      userActions.addGold(reward);
    }
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-[#B4D4FF] font-game select-none">
      {/* 배경 */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#9ADE7B] to-[#79AC78]">
        <GrassBackground />
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: `radial-gradient(#2d3a1e 2px, transparent 2px)`,
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute bottom-0 w-full h-[6%] bg-[#706233] border-t-4 border-[#435334]" />
        <FencePerimeter />
      </div>

      <div className="absolute inset-0 w-full h-full">
        {/* 시설물: 목장 본채 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[12vw] max-w-[180px] aspect-square" style={{ zIndex: 35 }}>
          <FacilityWrapper label="목장 본채"><MansionIsometric /></FacilityWrapper>
        </div>

        {/* 시설물: 우유 사일로 */}
        <div className="absolute bottom-[15%] left-[0.5%] w-[12vw] max-w-[180px] aspect-square" style={{ zIndex: 80 }}>
          <FacilityWrapper label="우유 사일로">
            <SiloIsometric fillLevel={(inventory.milk / facilities.storage.capacity) * 100} />
          </FacilityWrapper>
        </div>

        {/* 시설물: 가공 공장 */}
        <div className="absolute bottom-[15%] right-[0.5%] w-[12vw] max-w-[180px] aspect-square" style={{ zIndex: 80 }}>
          <FacilityWrapper label="가공 공장" onClick={uiActions.openFactory}>
            <div className="relative w-full h-full">
              <FactoryIsometric />
              {activeProductions.length > 0 && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black animate-pulse">
                  {activeProductions.length}
                </div>
              )}
            </div>
          </FacilityWrapper>
        </div>

        {/* 소 렌더링 */}
        <div className="absolute inset-0 pointer-events-none">
          {cows.map((cow) => (
            <motion.div 
              key={cow.id}
              animate={{ 
                left: `${cow.position.x}%`, 
                top: `${cow.position.y}%`,
                zIndex: Math.floor(cow.position.y)
              }}
              transition={{ duration: 8, ease: "linear" }}
              className="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative group pointer-events-auto">
                <CowComponent 
                  id={cow.id}
                  type={cow.type}
                  milkGauge={cow.milkGauge}
                  status={cow.status}
                  onMilk={() => {
                    const success = gameActions.produceMilk(cow.type);
                    if (success) {
                      gameActions.updateCowGauge(cow.id, -10);
                    }
                    return success;
                  }}
                  onOverload={() => gameActions.setCowStatus(cow.id, 'EXHAUSTED', 10)}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* 상인 트럭 */}
        <AnimatePresence>
          {isMerchantPresent && (
            <div className="absolute bottom-[40%] left-[5%] z-[90]">
              <MerchantTruck onClick={uiActions.openMerchant} />
            </div>
          )}
        </AnimatePresence>

        {/* 늑대 이벤트 */}
        <AnimatePresence>
          {isWolfEventActive && (
            <div className="absolute inset-0 z-[85] pointer-events-none">
              <Wolf 
                hp={wolfStats.hp} 
                maxHp={wolfStats.maxHp} 
                level={wolfStats.level} 
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 늑대 사냥 버튼 */}
      <ShootingButton 
        isActive={isWolfEventActive}
        ammo={inventory.ammo}
        onShoot={handleShoot}
      />

      {/* 목장 HUD */}
      <RanchHUD 
        onBack={onBack}
        isMerchantPresent={isMerchantPresent}
        merchantTimer={merchantTimer}
        gold={gold}
        milk={inventory.milk}
      />

      <MerchantModal />
    </div>
  );
};

/**
 * @interface FacilityWrapperProps
 * @description FacilityWrapper 컴포넌트의 props를 정의합니다.
 * @property {React.ReactNode} children - 래핑할 자식 요소입니다.
 * @property {string} label - 시설물의 이름을 표시하는 라벨입니다.
 * @property {() => void} [onClick] - 시설물 클릭 시 호출될 함수입니다. (선택 사항)
 */
interface FacilityWrapperProps {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}

/**
 * @function FacilityWrapper
 * @description 목장 내의 시설물들을 감싸는 래퍼 컴포넌트입니다.
 * 호버 시 라벨을 표시하는 기능을 가집니다.
 * @param {FacilityWrapperProps} props - 컴포넌트 props
 * @returns {JSX.Element}
 */
const FacilityWrapper: React.FC<FacilityWrapperProps> = ({ children, label, onClick }) => (
  <motion.button 
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.95, y: 2 }}
    onClick={onClick}
    className={`w-full h-full flex flex-col items-center group relative ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
  >
    <div className="w-full h-full relative z-10">{children}</div>
    <div className="absolute bottom-[22%] bg-[#706233]/90 px-3 py-1 rounded-full text-white font-black text-[10px] opacity-0 group-hover:opacity-100 group-hover:bottom-[24%] transition-all z-20 shadow-md backdrop-blur-sm pointer-events-none">
      {label}
    </div>
  </motion.button>
);

export default RanchScreen;
