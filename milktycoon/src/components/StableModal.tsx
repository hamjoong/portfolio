import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Info, CheckCircle2, Circle } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MAX_COW_CAPACITY } from '../types/game';

interface StableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** 
 * @function StableModal
 * @description 보유 중인 젖소 목록을 확인하고, 목장에 배치하거나 배치를 해제하여 보관할 수 있는 관리 모달입니다.
 * @param {StableModalProps} props - 모달 제어 props
 */
const StableModal: React.FC<StableModalProps> = ({ isOpen, onClose }) => {
  const { ownedCows = [], cows = [], facilities, actions } = useGameStore();

  const isPlaced = (id: string) => cows.some(c => c.id === id);
  const currentCapacity = facilities.house.maxCows;

  const getCowIcon = (type: string) => {
    switch (type) {
      case 'BASIC': return '🐮';
      case 'JERSEY': return '🐄';
      case 'PREMIUM': return '🐃';
      case 'GOLDEN': return '✨🐄';
      default: return '🐮';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-auto font-game text-h-text">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
            className="relative w-full max-w-2xl bg-h-milk rounded-[3rem] shadow-2.5d-lg border-4 border-h-green-light overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-8 pb-6 bg-h-green-base text-h-milk flex justify-between items-center border-b-8 border-h-green-dark/20">
              <div className="flex items-center gap-4">
                <div className="bg-h-milk/20 p-3 rounded-2xl border-2 border-h-milk/30">
                  <Home size={32} strokeWidth={3} />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">젖소 보관소</h2>
                  <p className="text-sm font-bold opacity-80 uppercase tracking-widest">젖소 보관소</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="bg-h-milk/20 p-3 rounded-2xl hover:bg-h-milk/30 transition-all border-2 border-h-milk/30 active:translate-y-1"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            {/* Capacity Info */}
            <div className="px-8 pt-6">
              <div className="bg-h-sky-base/10 border-2 border-h-sky-base/30 rounded-[2rem] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="text-h-sky-base" size={24} />
                  <span className="font-black text-lg">목장 수용량</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-h-sky-base">{cows.length}</span>
                  <span className="text-h-brown-soft/50 font-black">/</span>
                  <span className="text-xl font-black text-h-brown-soft">{currentCapacity}</span>
                  {currentCapacity < MAX_COW_CAPACITY && (
                    <span className="ml-2 text-[10px] font-black bg-h-orange-warm text-h-milk px-2 py-0.5 rounded-full">업그레이드 필요</span>
                  )}
                </div>
              </div>
            </div>

            {/* Cow List */}
            <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-4 custom-scrollbar">
              {ownedCows.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(ownedCows.reduce((acc, cow) => {
                    if (!acc[cow.type]) acc[cow.type] = [];
                    acc[cow.type].push(cow);
                    return acc;
                  }, {} as Record<string, typeof ownedCows>)).map(([type, typeCows]) => {
                    const placedCows = typeCows.filter(c => isPlaced(c.id));
                    const unplacedCows = typeCows.filter(c => !isPlaced(c.id));
                    const representativeCow = typeCows[0];
                    const typeLabel = {
                      'BASIC': '일반',
                      'JERSEY': '저지',
                      'PREMIUM': '프리미엄',
                      'GOLDEN': '황금'
                    }[type] || type;

                    return (
                      <motion.div 
                        key={type}
                        whileHover={{ scale: 1.01 }}
                        className={`flex items-center gap-6 p-5 rounded-[2.5rem] border-4 transition-all bg-h-milk border-h-brown-soft/10 shadow-2.5d-white`}
                      >
                        <div className="w-20 h-20 bg-h-milk rounded-[1.5rem] border-4 border-h-brown-soft/10 flex items-center justify-center text-4xl shadow-inner">
                          {getCowIcon(type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-black text-xl">{typeLabel} 젖소</h3>
                            <span className="text-[10px] font-black bg-h-brown-deep text-h-milk px-2 py-0.5 rounded-md">x{typeCows.length}</span>
                          </div>
                          <p className="text-xs font-bold text-h-brown-soft">생산량: {(representativeCow.productionRate * 60).toFixed(0)}/min</p>
                          <p className="text-[10px] font-black text-h-green-base mt-1">배치됨: {placedCows.length} / {typeCows.length}</p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button 
                            disabled={unplacedCows.length === 0 || cows.length >= currentCapacity}
                            onClick={() => unplacedCows.length > 0 && actions.toggleCowPlacement(unplacedCows[0].id)}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-black text-xs border-b-4 transition-all active:translate-y-1 active:border-b-0 ${
                              unplacedCows.length === 0 || cows.length >= currentCapacity
                                ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed' 
                                : 'bg-h-green-base border-h-green-dark text-h-milk shadow-lg'
                            }`}
                          >
                            <CheckCircle2 size={14} /> 배치 하기
                          </button>
                          <button 
                            disabled={placedCows.length === 0}
                            onClick={() => placedCows.length > 0 && actions.toggleCowPlacement(placedCows[0].id)}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-black text-xs border-b-4 transition-all active:translate-y-1 active:border-b-0 ${
                              placedCows.length === 0
                                ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed' 
                                : 'bg-h-orange-warm border-h-orange-deep text-h-milk'
                            }`}
                          >
                            <Circle size={14} /> 배치 해제
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-h-brown-soft/30 gap-4">
                  <Home size={64} opacity={0.3} />
                  <p className="font-black text-xl italic">보유한 젖소가 없습니다.</p>
                </div>
              )}
            </div>
            
            <div className="p-8 pt-0 text-center">
              <p className="text-[10px] font-black text-h-brown-soft/40 uppercase tracking-[0.2em]">
                최대 수용량은 목장 본채 레벨에 의해 제한됩니다 (최대 15)
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StableModal;