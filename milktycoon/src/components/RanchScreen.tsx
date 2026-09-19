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
import type { Cow } from '../types/game';

interface RanchScreenProps {
  onBack: () => void;
}

const CowRenderer: React.FC<{ cow: Cow }> = React.memo(({ cow }) => {
  return (
    <motion.div 
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
        />
      </div>
    </motion.div>
  );
});

const CowList: React.FC = React.memo(() => {
  const cows = useGameStore((state) => state.cows);
  return (
    <div className="absolute inset-0 pointer-events-none">
      {cows.map((cow) => (
        <CowRenderer key={cow.id} cow={cow} />
      ))}
    </div>
  );
});

const Facilities: React.FC = React.memo(() => {
  const facilities = useGameStore((state) => state.facilities);
  const inventory = useGameStore((state) => state.inventory);
  const activeProductions = useGameStore((state) => state.activeProductions);
  const uiActions = useUIStore((state) => state.actions);

  return (
    <>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[12vw] max-w-[180px] aspect-square" style={{ zIndex: 35 }}>
        <FacilityWrapper label="목장 본채"><MansionIsometric level={facilities.house.level} /></FacilityWrapper>
      </div>

      <div className="absolute bottom-[15%] left-[0.5%] w-[12vw] max-w-[180px] aspect-square" style={{ zIndex: 80 }}>
        <FacilityWrapper label="우유 사일로">
          <SiloIsometric level={facilities.storage.level} fillLevel={(inventory.milk / facilities.storage.capacity) * 100} />
        </FacilityWrapper>
      </div>

      <div className="absolute bottom-[15%] right-[0.5%] w-[12vw] max-w-[180px] aspect-square" style={{ zIndex: 80 }}>
        <FacilityWrapper label="가공 공장" onClick={uiActions.openFactory}>
          <div className="relative w-full h-full">
            <FactoryIsometric level={facilities.processing.level} />
            {activeProductions.length > 0 && (
              <div className="absolute top-0 right-0 bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black animate-pulse">
                {activeProductions.length}
              </div>
            )}
          </div>
        </FacilityWrapper>
      </div>
    </>
  );
});

const WolfRenderer: React.FC = React.memo(() => {
  const isWolfEventActive = useGameStore((state) => state.isWolfEventActive);
  const wolfStats = useGameStore((state) => state.wolfStats);
  return (
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
  );
});

const MerchantRenderer: React.FC = React.memo(() => {
  const isMerchantPresent = useGameStore((state) => state.isMerchantPresent);
  const uiActions = useUIStore((state) => state.actions);
  const prevMerchantPresent = useRef(isMerchantPresent);

  useEffect(() => {
    if (!prevMerchantPresent.current && isMerchantPresent) {
      uiActions.openMerchant();
    }
    prevMerchantPresent.current = isMerchantPresent;
  }, [isMerchantPresent, uiActions]);

  return (
    <AnimatePresence>
      {isMerchantPresent && (
        <div className="absolute bottom-[40%] left-[5%] z-[90]">
          <MerchantTruck onClick={uiActions.openMerchant} />
        </div>
      )}
    </AnimatePresence>
  );
});

const RanchScreen: React.FC<RanchScreenProps> = ({ onBack }) => {
  const inventory = useGameStore((state) => state.inventory);
  const isWolfEventActive = useGameStore((state) => state.isWolfEventActive);
  const isMerchantPresent = useGameStore((state) => state.isMerchantPresent);
  const merchantTimer = useGameStore((state) => state.merchantTimer);
  const gameActions = useGameStore((state) => state.actions);
  const gold = useUserStore((state) => state.gold);
  const userActions = useUserStore((state) => state.actions);

  const handleShoot = () => {
    if (!isWolfEventActive || inventory.ammo <= 0) return;
    const { killed, reward } = gameActions.damageWolf(0);
    if (killed) {
      userActions.addGold(reward);
    }
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-[#B4D4FF] font-game select-none">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#9ADE7B] to-[#79AC78]">
        <GrassBackground />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(#2d3a1e 2px, transparent 2px)`, backgroundSize: '60px 60px' }} />
        <div className="absolute bottom-0 w-full h-[6%] bg-[#706233] border-t-4 border-[#435334]" />
        <FencePerimeter />
      </div>

      <div className="absolute inset-0 w-full h-full">
        <Facilities />
        <CowList />
        <MerchantRenderer />
        <WolfRenderer />
      </div>

      <ShootingButton 
        isActive={isWolfEventActive}
        ammo={inventory.ammo}
        onShoot={handleShoot}
      />

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

interface FacilityWrapperProps {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}

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
