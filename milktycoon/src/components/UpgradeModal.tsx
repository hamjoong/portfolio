import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hammer, ArrowUpCircle, Home, Box, Factory, Sparkles, Droplets } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { useGameStore } from '../store/useGameStore';
import { MAX_RANCH_LEVEL } from '../types/game';
import { useUserStore } from '../store/useUserStore';

const FACILITY_COST_BASE = 1000;

/** 
 * @function UpgradeModal
 * @description 목장의 각종 시설(저장고, 가공 공장, 축사 등)을 업그레이드하는 인터페이스 모달입니다.
 * 각 시설의 레벨에 따라 생산 효율과 수용량이 증가합니다.
 */
const UpgradeModal: React.FC = () => {
  const { isUpgradeOpen, actions: uiActions } = useUIStore();
  const { facilities, ranchLevel, actions: gameActions } = useGameStore();
  const { gold, actions: userActions } = useUserStore();

  const handleUpgrade = (type: 'STORAGE' | 'PROCESSING' | 'HOUSE' | 'EXTRACTION') => {
    const facilityMap = {
      STORAGE: facilities.storage,
      PROCESSING: facilities.processing,
      HOUSE: facilities.house,
      EXTRACTION: facilities.extraction
    };

    if (type === 'HOUSE' && ranchLevel >= MAX_RANCH_LEVEL) {
      alert("이미 최대 레벨입니다!");
      return;
    }

    const cost = facilityMap[type].level * FACILITY_COST_BASE;

    if (gold < cost) {
      alert("골드가 부족합니다!");
      return;
    }

    userActions.addGold(-cost);
    gameActions.upgradeFacility(type);
  };

  return (
    <AnimatePresence>
      {isUpgradeOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 pointer-events-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={uiActions.closeUpgrade} className="absolute inset-0 bg-h-brown-deep/60 backdrop-blur-md" />
          <motion.div 
            initial={{ scale: 0.85, opacity: 0, y: 60 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0, y: 60 }} 
            className="relative w-full max-w-4xl h-fit max-h-[90vh] bg-h-cream rounded-[5rem] border-4 border-h-milk shadow-2.5d-lg flex flex-col overflow-hidden font-game text-h-text"
          >
            <div className="p-10 flex justify-between items-center bg-h-milk/40 border-b-4 border-h-brown-soft/10">
              <div className="flex items-center gap-6">
                <div className="bg-orange-400 p-5 rounded-[2.5rem] text-h-milk shadow-2.5d-orange border-4 border-h-milk"><Hammer size={38} strokeWidth={3} /></div>
                <div>
                  <h2 className="text-5xl font-black tracking-tight">시설 관리</h2>
                  <p className="text-sm font-black text-h-brown-soft uppercase tracking-[0.3em] mt-1 ml-1 opacity-70">시설 관리</p>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={uiActions.closeUpgrade} className="bg-h-milk/80 p-5 rounded-3xl text-h-brown-soft shadow-2.5d-white border-2 border-h-brown-soft/10 transition-all"><X size={32} strokeWidth={3} /></motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
              <UpgradeItem icon={<Home size={40} />} title="목장 레벨업" desc={`현재 인원: ${facilities.house.maxCows}마리 배치 가능`} level={ranchLevel} cost={facilities.house.level * FACILITY_COST_BASE} onUpgrade={() => handleUpgrade('HOUSE')} currentGold={gold} color="bg-h-green-base" isMax={ranchLevel >= MAX_RANCH_LEVEL} />
              <UpgradeItem icon={<Box size={40} />} title="우유 사일로" desc={`현재 용량: ${facilities.storage.capacity}L 저장 가능`} level={facilities.storage.level} cost={facilities.storage.level * FACILITY_COST_BASE} onUpgrade={() => handleUpgrade('STORAGE')} currentGold={gold} color="bg-h-sky-base" />
              <UpgradeItem icon={<Factory size={40} />} title="가공 공장" desc={`현재 배율: x${facilities.processing.multiplier.toFixed(1)} 판매 수익`} level={facilities.processing.level} cost={facilities.processing.level * FACILITY_COST_BASE} onUpgrade={() => handleUpgrade('PROCESSING')} currentGold={gold} color="bg-purple-400" />
              <UpgradeItem icon={<Droplets size={40} />} title="착즙 기술" desc={`클릭당 생산량: ${facilities.extraction.amountPerClick}L 획득`} level={facilities.extraction.level} cost={facilities.extraction.level * FACILITY_COST_BASE} onUpgrade={() => handleUpgrade('EXTRACTION')} currentGold={gold} color="bg-pink-400" />
            </div>

            <div className="p-8 bg-h-milk/20 flex justify-center border-t-2 border-h-brown-soft/5">
               <div className="flex items-center gap-3 text-h-brown-soft/40 font-black text-xs uppercase tracking-[0.4em]"><Sparkles size={16} /><span>시설을 업그레이드하여 더 위대한 목장을 만드세요</span><Sparkles size={16} /></div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface UpgradeItemProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  level: number;
  cost: number;
  onUpgrade: () => void;
  currentGold: number;
  color: string;
  isMax?: boolean;
}

const UpgradeItem: React.FC<UpgradeItemProps> = ({ icon, title, desc, level, cost, onUpgrade, currentGold, color, isMax }) => {
  const canAfford = currentGold >= cost && !isMax;
  return (
    <div className="bg-h-milk p-8 rounded-[3.5rem] border-4 border-h-green-light/30 shadow-2.5d-white flex items-center gap-8">
      <div className={`${color} p-6 rounded-[2rem] text-h-milk shadow-inner border-2 border-h-milk/30`}>{icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1"><h3 className="font-black text-3xl text-h-text tracking-tight">{title}</h3><span className="bg-h-yellow-soft text-h-brown-deep px-3 py-0.5 rounded-full text-xs font-black border border-h-yellow-base shadow-sm">LV.{level}</span></div>
        <p className="text-lg font-black text-h-brown-soft opacity-70">{desc}</p>
      </div>
      <motion.button 
        whileHover={canAfford ? { scale: 1.05, y: -4 } : {}} 
        whileTap={canAfford ? { scale: 0.95, y: 4 } : {}} 
        onClick={onUpgrade} 
        disabled={!canAfford} 
        className={`px-10 py-5 rounded-[2.5rem] font-black text-2xl flex items-center gap-3 transition-all duration-75 ${!canAfford ? 'bg-h-brown-soft/20 text-h-brown-soft opacity-50 cursor-not-allowed' : 'bg-h-green-base text-h-milk shadow-2.5d-green border-4 border-h-milk active:shadow-none'}`}
      >
        {isMax ? (
          <span>최고 레벨</span>
        ) : (
          <><ArrowUpCircle size={28} /><span>🪙 {cost.toLocaleString()}</span></>
        )}
      </motion.button>
    </div>
  );
};

export default UpgradeModal;
