import React from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';

interface PlayerProps {
  x: number;
  y: number;
  isMoving: boolean;
}

/** 
 * @function Player
 * @description 목장 내에서 플레이어를 시각적으로 나타내는 캐릭터 컴포넌트입니다.
 * 플레이어의 현재 위치와 이동 애니메이션을 처리합니다.
 * @param {PlayerProps} props - 플레이어 위치 및 상태 props
 */
const Player: React.FC<PlayerProps> = ({ x, y, isMoving }) => {
  const { avatar } = useUserStore();

  return (
    <motion.div
      animate={{ 
        x: `${x}vw`, 
        y: `${y}vh`,
        rotateY: isMoving ? [0, 10, -10, 0] : 0
      }}
      transition={{ type: "spring", stiffness: 100, damping: 25 }}
      className="absolute z-30 iso-item pointer-events-none"
      style={{ left: 0, top: 0 }}
    >
      <div className="relative flex flex-col items-center">
        {/* Shadow */}
        <div className="w-16 h-6 bg-black/20 rounded-full blur-md mb-[-10px] scale-x-125" />
        
        {/* Character */}
        <motion.div
          animate={isMoving ? { y: [0, -15, 0] } : { y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: isMoving ? 0.4 : 2 }}
          className="text-8xl filter drop-shadow-2xl"
        >
          {avatar}
        </motion.div>

        {/* Player Name Tag */}
        <div className="mt-2 bg-black/60 px-3 py-1 rounded-full border border-white/20 shadow-lg">
          <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">You</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Player;
