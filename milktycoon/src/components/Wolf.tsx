import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/** 
 * @interface WolfProps
 * @description Wolf 컴포넌트의 props를 정의합니다.
 */
interface WolfProps {
  /** 늑대의 현재 체력 */
  hp: number;
  /** 늑대의 최대 체력 */
  maxHp: number;
  /** 늑대의 레벨 (난이도 및 보상 결정) */
  level: number;
}

/** 
 * @function Wolf
 * @description 목장을 습격하는 늑대를 렌더링하는 컴포넌트입니다.
 * 랜덤하게 위치를 이동하며, 체력바와 레벨 정보를 표시합니다.
 */
const Wolf: React.FC<WolfProps> = ({ hp, maxHp, level }) => {
  const [position, setPosition] = useState({ x: 30, y: 40 });

  // Move wolf randomly every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({
        x: 20 + Math.random() * 60,
        y: 30 + Math.random() * 40,
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const progress = (hp / maxHp) * 100;

  return (
    <motion.div
      animate={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        zIndex: Math.floor(position.y) + 10
      }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="absolute w-32 h-32 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center"
    >
      {/* Wolf Info (HP Bar & Level) */}
      <div className="mb-2 flex flex-col items-center gap-1 w-20">
        <div className="bg-black/70 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-red-500/50 flex items-center gap-1 whitespace-nowrap">
          <span className="text-red-400">Lv.{level}</span> 습격 중!
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full border border-gray-600 overflow-hidden shadow-sm">
          <motion.div 
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-red-600 to-orange-500"
          />
        </div>
      </div>

      {/* Wolf Visual (Emoji style matching Cow) */}
      <div className="relative group">
        {/* Contact Shadow */}
        <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-12 h-3 bg-black/20 rounded-full blur-[4px] z-0" />
        
        <motion.div
          animate={{ 
            y: [0, -8, 0],
            rotate: [-3, 3, -3],
            scale: [1, 1.05, 1]
          }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          className="text-[80px] leading-none relative z-10 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)] filter grayscale-[0.2]"
        >
          🐺
          {/* Angry Eyes/Aura effect */}
          <motion.div 
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 text-2xl"
          >
            💢
          </motion.div>
        </motion.div>
      </div>

      {/* Target Marker (Visual only) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 border-2 border-red-500/30 rounded-full border-dashed animate-spin-slow" />
      </div>
    </motion.div>
  );
};

export default Wolf;
