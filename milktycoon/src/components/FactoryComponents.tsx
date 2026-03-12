import React from 'react';
import { motion } from 'framer-motion';
import { Milk, Timer, Minus, Plus, Play } from 'lucide-react';
import type { ProductType } from '../types/game';

interface ProductConfig {
  milkCost: number;
  time: number;
  label: string;
  icon: string;
  minLevel: number;
  minFreshness: number;
  basePrice: number;
}

/** 
 * @interface RecipeItemProps
 * @description 가공 공장의 개별 레피시 아이템을 표시하는 컴포넌트의 props입니다.
 */
interface RecipeItemProps {
  /** 제품 종류 */
  type: ProductType;
  /** 제품의 설정 정보 (비용, 시간, 요구 레벨 등) */
  config: ProductConfig;
  /** 레벨 제한으로 인한 잠금 상태 여부 */
  isLevelLocked: boolean;
  /** 평균 품질 제한으로 인한 잠금 상태 여부 */
  isQualityLocked: boolean;
  /** 원유(우유) 부족 여부 */
  isMilkShort: boolean;
  /** 생산하고자 하는 수량 */
  qty: number;
  /** 수량 변경 핸들러 */
  onUpdateQty: (delta: number) => void;
  /** 최대 생산 가능 수량 설정 핸들러 */
  onMaxQty: () => void;
  /** 생산 시작 핸들러 */
  onStart: () => void;
}

/** 
 * @function RecipeItem
 * @description 가공 공장에서 특정 제품을 생산하기 위한 인터페이스를 렌더링합니다.
 */
export const RecipeItem: React.FC<RecipeItemProps> = React.memo(({ 
  config, isLevelLocked, isQualityLocked, isMilkShort, qty, onUpdateQty, onMaxQty, onStart 
}) => {
  const canProduce = !isLevelLocked && !isQualityLocked && !isMilkShort;

  return (
    <div className={`p-6 rounded-3xl border-4 transition-all ${isLevelLocked ? 'bg-gray-200 border-gray-300 opacity-60' : 'bg-white border-[#D7CCC8] hover:border-[#A1887F] shadow-sm'}`}>
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-[#EFEBE9] rounded-2xl flex items-center justify-center text-4xl shadow-inner border-2 border-[#D7CCC8]">
          {config.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-black text-[#5D4037]">{config.label}</h3>
            {isLevelLocked && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">LV.{config.minLevel} 필요</span>}
            {isQualityLocked && !isLevelLocked && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">품질 {config.minFreshness} 필요</span>}
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-[#8D6E63] whitespace-nowrap">
            <span className={`flex items-center gap-1 ${isMilkShort ? 'text-red-500' : ''}`}><Milk size={12} /> {config.milkCost}L / 개</span>
            <span className="flex items-center gap-1"><Timer size={12} /> {config.time}초 / 개</span>
          </div>
        </div>

        {!isLevelLocked && (
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-1 bg-white p-1.5 rounded-[2rem] border-4 border-[#D7CCC8] shadow-inner">
              <motion.button 
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => onUpdateQty(-1)} 
                className="w-10 h-10 flex items-center justify-center bg-[#E0E0E0] text-[#616161] rounded-full hover:bg-[#BDBDBD] transition-colors"
              >
                <Minus size={20} strokeWidth={3} />
              </motion.button>
              
              <div className="w-14 h-12 flex items-center justify-center bg-[#F5F5F5] mx-1 rounded-xl border-2 border-[#EEEEEE]">
                <span className="text-2xl font-black text-[#3E2723]">{qty}</span>
              </div>

              <motion.button 
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => onUpdateQty(1)} 
                className="w-10 h-10 flex items-center justify-center bg-[#FF8A65] text-white rounded-full hover:bg-[#FF7043] shadow-sm transition-colors"
              >
                <Plus size={20} strokeWidth={3} />
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={onMaxQty} 
                className="ml-2 px-4 h-10 bg-[#4DB6AC] text-white rounded-2xl font-black text-xs hover:bg-[#26A69A] shadow-sm uppercase tracking-tighter"
              >
                MAX
              </motion.button>
            </div>
            <button 
              onClick={onStart}
              disabled={!canProduce}
              className={`px-8 py-4 rounded-[2.5rem] font-black text-xl flex items-center gap-2 shadow-2.5d-green transition-all ${canProduce ? 'bg-[#9ADE7B] text-[#2d3a1e] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none' : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none grayscale opacity-50'}`}
            >
              <Play size={20} fill="currentColor" />
              <span>{(config.milkCost * qty).toLocaleString()}L 소모</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

interface ProductionTaskItemProps {
  task: {
    id: string;
    type: ProductType;
    quantity: number;
    remainingTime: number;
    totalTime: number;
  };
  config: ProductConfig;
}

/** 
 * @function ProductionTaskItem
 * @description 현재 진행 중인 생산 작업을 표시하는 컴포넌트입니다.
 * 생산될 제품의 종류, 수량, 남은 시간 및 진행률을 시각적으로 보여줍니다.
 * @param {ProductionTaskItemProps} props - 컴포넌트 props
 */
export const ProductionTaskItem: React.FC<ProductionTaskItemProps> = React.memo(({ task, config }) => {
  const progress = ((task.totalTime - task.remainingTime) / task.totalTime) * 100;

  return (
    <div className="bg-white p-5 rounded-3xl border-4 border-white shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl shadow-inner">
            {config.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-[#5D4037]">{config.label}</span>
              <span className="text-xs bg-orange-400 text-white px-2 py-0.5 rounded-md font-black">x{task.quantity}</span>
            </div>
            <p className="text-[10px] font-bold text-orange-500 flex items-center gap-1">
              <Timer size={10} /> {task.remainingTime}초 남음
            </p>
          </div>
        </div>
      </div>
      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-50 shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="absolute inset-0 bg-gradient-to-r from-orange-300 to-orange-500"
        />
      </div>
    </div>
  );
});
