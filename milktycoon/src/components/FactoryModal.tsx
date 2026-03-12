import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Factory, Milk, Zap, CheckCircle2 } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { useGameStore } from '../store/useGameStore';
import { PRODUCT_CONFIG } from '../types/game';
import type { ProductType } from '../types/game';
import { RecipeItem, ProductionTaskItem } from './FactoryComponents';

/** 
 * @function FactoryModal
 * @description 우유를 재가공하여 부가가치가 높은 제품(요거트, 버터 등)을 생산하는 공장 인터페이스 모달입니다.
 */
const FactoryModal: React.FC = () => {
  const { isFactoryOpen, actions: uiActions } = useUIStore();
  const { inventory, ranchLevel, activeProductions, actions: gameActions } = useGameStore();
  
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({
    YOGURT: 1, BUTTER: 1, CHEESE: 1, CREAM: 1, ICE_CREAM: 1, GOLDEN_CHEESE: 1
  });

  // Reset quantities when modal opens or closes
  React.useEffect(() => {
    if (!isFactoryOpen) {
      setSelectedQuantities({
        YOGURT: 1, BUTTER: 1, CHEESE: 1, CREAM: 1, ICE_CREAM: 1, GOLDEN_CHEESE: 1
      });
    }
  }, [isFactoryOpen]);

  if (!isFactoryOpen) return null;

  const handleStart = (type: ProductType) => {
    const qty = selectedQuantities[type];
    const success = gameActions.startProduction(type, qty);
    if (success) {
      setSelectedQuantities(prev => ({ ...prev, [type]: 1 }));
    } else {
      alert("생산 조건을 만족하지 못했습니다. (우유 부족, 레벨 제한 등)");
    }
  };

  const updateQty = (type: ProductType, delta: number) => {
    const cost = PRODUCT_CONFIG[type].milkCost;
    const maxPossible = Math.floor(inventory.milk / cost);
    setSelectedQuantities(prev => ({
      ...prev,
      [type]: Math.max(1, Math.min(maxPossible || 1, prev[type] + delta))
    }));
  };

  const setMaxQty = (type: ProductType) => {
    const cost = PRODUCT_CONFIG[type].milkCost;
    const maxPossible = Math.floor(inventory.milk / cost);
    if (maxPossible > 0) {
      setSelectedQuantities(prev => ({ ...prev, [type]: maxPossible }));
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm font-game">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#F8F6F0] w-full max-w-5xl h-[85vh] rounded-[4rem] border-8 border-[#5D4037] shadow-2xl flex overflow-hidden"
      >
        {/* Left: Recipe List */}
        <div className="flex-1 flex flex-col border-r-4 border-[#5D4037]/10 bg-white/50">
          <div className="p-8 bg-[#5D4037] text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Factory size={32} />
              <h2 className="text-3xl font-black">가공 레시피</h2>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-2xl flex items-center gap-2">
              <Milk size={20} />
              <span className="font-black text-xl">{inventory.milk.toLocaleString()}L</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {Object.entries(PRODUCT_CONFIG).map(([key, config]) => {
              const type = key as ProductType;
              const isLevelLocked = ranchLevel < config.minLevel;
              const isQualityLocked = inventory.averageQuality < config.minFreshness;
              const isMilkShort = inventory.milk < (config.milkCost * selectedQuantities[type]);
              
              return (
                <RecipeItem 
                  key={key}
                  type={type}
                  config={config}
                  isLevelLocked={isLevelLocked}
                  isQualityLocked={isQualityLocked}
                  isMilkShort={isMilkShort}
                  qty={selectedQuantities[type]}
                  onUpdateQty={(delta) => updateQty(type, delta)}
                  onMaxQty={() => setMaxQty(type)}
                  onStart={() => handleStart(type)}
                />
              );
            })}
          </div>
        </div>

        {/* Right: Active Productions */}
        <div className="w-[380px] bg-[#EFEBE9] flex flex-col">
          <div className="p-8 border-b-4 border-[#D7CCC8] flex justify-between items-center bg-[#D7CCC8]/30">
            <div className="flex items-center gap-3">
              <Zap size={24} className="text-[#A1887F]" />
              <h3 className="text-2xl font-black text-[#5D4037]">실시간 가공 중</h3>
            </div>
            <button onClick={uiActions.closeFactory} className="p-2 hover:bg-black/10 rounded-full transition-all">
              <X size={24} strokeWidth={3} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {activeProductions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-[#5D4037]">
                <Factory size={64} strokeWidth={1} />
                <p className="mt-4 font-black">가동 중인 라인이 없습니다</p>
              </div>
            ) : (
              activeProductions.map((task) => (
                <ProductionTaskItem 
                  key={task.id}
                  task={task}
                  config={PRODUCT_CONFIG[task.type]}
                />
              ))
            )}
          </div>
          
          <div className="p-6 bg-white/40 border-t-2 border-[#D7CCC8]">
            <div className="flex items-center gap-3 text-[#8D6E63] text-xs font-black">
              <CheckCircle2 size={16} />
              <span>완료 시 자동으로 보관고에 입고됩니다.</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FactoryModal;
