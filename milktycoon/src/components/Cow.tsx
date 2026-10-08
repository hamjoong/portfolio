import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Moon } from 'lucide-react';
import type { CowType, CowStatus } from '../types/game';
import { useGameStore } from '../store/useGameStore';
import { cn } from '../utils/cn';

/** 
 * @interface CowProps
 * @description Cow 컴포넌트의 props를 정의합니다.
 */
interface CowProps {
  /** 소의 고유 ID */
  id: string;
  /** 소의 종류: 기본, 저지, 프리미엄, 골든 */
  type: CowType;
  /** 현재 우유 생산 게이지 (0-100) */
  milkGauge: number;
  /** 소의 현재 상태 (정상, 가득 참, 기절/탈진) */
  status: CowStatus;
}

const Cow: React.FC<CowProps> = React.memo(({ id, type, milkGauge, status }) => {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [milkPopups, setMilkPopups] = useState<{id: number, type: 'MILK' | 'FULL'}[]>([]);
  
  const actions = useGameStore((state) => state.actions);

  const cowEmoji = {
    'BASIC': '🐄',
    'JERSEY': '🐂',
    'PREMIUM': '🐃',
    'GOLDEN': '🐄'
  }[type];

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 이미 기절 상태면 클릭 무시
    if (status !== 'NORMAL') return;

    // 게이지가 0인데 착유 시도 시 즉시 기절 (탈진 페널티)
    if (milkGauge <= 0) {
      actions.setCowStatus(id, 'EXHAUSTED', 10);
      return;
    }

    const now = Date.now();
    const diff = now - lastClickTime;
    
    if (diff < 150) {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount > 12) {
        actions.setCowStatus(id, 'EXHAUSTED', 10);
        setClickCount(0);
        return;
      }
    } else {
      setClickCount(0);
    }
    setLastClickTime(now);

    const success = actions.produceMilk(type);
    const popupId = Math.random();
    
    if (success) {
      actions.updateCowGauge(id, -10);
      setMilkPopups(prev => [...prev, { id: popupId, type: 'MILK' as const }].slice(-5));
    } else {
      setMilkPopups(prev => [...prev, { id: popupId, type: 'FULL' as const }].slice(-5));
    }
    
    setTimeout(() => setMilkPopups(prev => prev.filter(p => p.id !== popupId)), 800);
  }, [id, type, milkGauge, status, actions, lastClickTime, clickCount]);

  return (
    <div className="relative flex flex-col items-center select-none cursor-pointer group" onClick={handleClick}>
      
      {/* Status Icons */}
      <div className="absolute -top-24 z-30 pointer-events-none">
        <AnimatePresence mode="wait">
          {status === 'FULL' && (
            <motion.div key="full" initial={{ scale: 0, y: 10 }} animate={{ scale: 1.2, y: 0 }} exit={{ scale: 0 }} className="bg-red-500 p-2 rounded-xl border-b-4 border-red-700 shadow-xl text-white">
              <AlertTriangle size={24} />
            </motion.div>
          )}
          {status === 'EXHAUSTED' && (
            <motion.div key="zzz" initial={{ scale: 0, y: 10 }} animate={{ scale: 1.2, y: 0 }} exit={{ scale: 0 }} className="bg-blue-500 p-2 rounded-xl border-b-4 border-blue-700 shadow-xl text-white">
              <Moon size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Milk & Status Popups */}
      <div className="absolute inset-0 pointer-events-none z-40">
        <AnimatePresence>
          {milkPopups.map(p => (
            <motion.div 
              key={p.id} 
              initial={{ y: -20, opacity: 1, scale: 0.5 }} 
              animate={{ y: -120, opacity: 0, scale: 1.5 }} 
              className={cn(
                "absolute left-1/2 -translate-x-1/2 font-black whitespace-nowrap",
                p.type === 'FULL' ? "text-red-500 text-sm" : "text-4xl"
              )}
            >
              {p.type === 'FULL' ? '저장 공간 부족!' : '🥛'}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Grounding Shadow (Separate from emoji) */}
      <div className="absolute bottom-[12px] w-10 h-2.5 bg-black/10 rounded-full blur-[3px] pointer-events-none z-0" />

      {/* Cow Image (Emoji to match splash screen) */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        animate={status === 'EXHAUSTED' ? { 
          opacity: 0.5, 
          filter: 'grayscale(1) brightness(0.8)',
          rotate: -90,
          y: 12,
          scaleX: 0.75
        } : { 
          y: [0, -5, 0],
          rotate: [0, 2, -2, 0],
          scaleX: 0.75 + (milkGauge / 100) * 0.25 
        }}
        transition={status === 'EXHAUSTED' ? { type: "spring" } : { 
          y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
          rotate: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
          scaleX: { type: "spring", stiffness: 100 }
        }}
        className={cn(
          "relative z-10 text-[64px] leading-none mb-1 drop-shadow-lg",
          type === 'GOLDEN' && "filter drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]"
        )}
      >
        <span className={cn(type === 'GOLDEN' && "brightness-110 saturate-150")}>
          {cowEmoji}
        </span>
        {type === 'GOLDEN' && (
          <motion.div 
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 flex items-center justify-center text-2xl pointer-events-none"
          >
            ✨
          </motion.div>
        )}
      </motion.div>

      {/* Gauge Bar */}
      <div className="mt-[-5px] w-14 h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300 z-20">
        <motion.div 
          animate={{ width: `${milkGauge}%` }}
          className={cn(
            "h-full",
            status === 'FULL' ? "bg-red-500" : type === 'GOLDEN' ? "bg-yellow-300" : "bg-yellow-400"
          )}
        />
      </div>
    </div>
  );
});

export default Cow;
