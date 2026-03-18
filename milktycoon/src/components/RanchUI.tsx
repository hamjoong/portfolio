import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Timer, Coins, Milk } from 'lucide-react';

interface RanchHUDProps {
  onBack: () => void;
  isMerchantPresent: boolean;
  merchantTimer: number;
  gold: number;
  milk: number;
}

/** 
 * @function RanchHUD
 * @description 목장 화면 상단에 표시되는 헤드업 디스플레이(HUD)입니다.
 * 메인으로 돌아가기 버튼, 상인 도착 타이머, 현재 재화 상태를 보여줍니다.
 * @param {RanchHUDProps} props - HUD 표시 데이터 및 핸들러
 */
export const RanchHUD: React.FC<RanchHUDProps> = React.memo(({ 
  onBack, isMerchantPresent, merchantTimer, gold, milk 
}) => {
  return (
    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-[100]">
      <div className="flex flex-col gap-2">
        <motion.button 
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={onBack} 
          className="pointer-events-auto bg-white/90 p-2 rounded-xl shadow-lg border-[2px] border-[#706233] text-[#706233] self-start"
        >
          <ArrowLeft size={18} strokeWidth={3} />
        </motion.button>

        {isMerchantPresent ? (
          <div className="pointer-events-auto bg-[#9ADE7B]/90 px-3 py-1 rounded-full border-2 border-[#435334] flex items-center gap-2 shadow-sm">
            <ShoppingCart size={14} className="text-[#435334]" />
            <span className="text-[10px] font-black text-[#435334]">상인 거래 가능</span>
          </div>
        ) : (
          <div className="pointer-events-auto bg-white/80 px-3 py-1 rounded-full border-2 border-blue-400 flex items-center gap-2 shadow-sm animate-pulse">
            <Timer size={14} className="text-blue-500" />
            <span className="text-[10px] font-black text-blue-700">상인 방문까지 {merchantTimer}초</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-row gap-2 pointer-events-auto items-center">
        <div className="bg-white/90 px-3 py-1 rounded-full shadow-md border-[2px] border-[#FEE8B0] flex items-center gap-2">
           <Coins className="text-[#B97A20]" size={16} />
           <span className="font-black text-sm text-[#435334]">{gold.toLocaleString()}</span>
        </div>
        <div className="bg-white/90 px-3 py-1 rounded-full shadow-md border-[2px] border-[#B4D4FF] flex items-center gap-2">
           <Milk className="text-[#3b82f6]" size={16} />
           <span className="font-black text-sm text-[#435334]">{milk.toLocaleString()}L</span>
        </div>
      </div>
    </div>
  );
});

interface ShootingButtonProps {
  isActive: boolean;
  ammo: number;
  onShoot: () => void;
}

/** 
 * @function ShootingButton
 * @description 늑대 출현 이벤트 발생 시 나타나는 사격 버튼 컴포넌트입니다.
 * 탄약 잔량을 표시하며 클릭 시 늑대에게 데미지를 입힙니다.
 * @param {ShootingButtonProps} props - 활성화 여부 및 사격 핸들러
 */
export const ShootingButton: React.FC<ShootingButtonProps> = React.memo(({ 
  isActive, ammo, onShoot 
}) => {
  return (
    <div className="absolute bottom-10 right-10 z-[150]">
      <AnimatePresence>
        {isActive && (
          <motion.button
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onShoot();
            }}
            className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl transition-all ${
              ammo > 0 
                ? 'bg-red-500 border-red-700 text-white active:bg-red-600' 
                : 'bg-gray-400 border-gray-600 text-gray-200 grayscale cursor-not-allowed'
            }`}
          >
            <div className="text-3xl mb-1">🎯</div>
            <div className="text-[10px] font-black uppercase tracking-widest">Shoot</div>
            <div className="text-xs font-bold">{ammo} / ∞</div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
});
