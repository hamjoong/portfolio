import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onFinish: () => void;
}

/** 
 * @function SplashScreen
 * @description 게임 시작 시 표시되는 로딩 화면입니다.
 * 에셋 로딩 상태를 시뮬레이션하며 프로그레스 바를 통해 진행률을 시각화합니다.
 * @param {SplashScreenProps} props - 로딩 완료 시 실행될 콜백
 */
const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-b from-sky-blue to-farm-green z-[1000] flex flex-col items-center justify-center p-12"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-8xl mb-8"
      >
        🐄
      </motion.div>
      
      <h1 className="text-4xl font-black text-white mb-2 drop-shadow-lg">
        Milk Tycoon
      </h1>
      <p className="text-white/60 font-bold uppercase tracking-widest mb-12">
        Loading Assets...
      </p>

      {/* 로딩 바 */}
      <div className="w-full max-w-xs h-3 bg-white/20 rounded-full overflow-hidden border border-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-yellow-400"
        />
      </div>
      
      <p className="text-white/80 font-black mt-4 text-sm">
        {progress}%
      </p>
    </motion.div>
  );
};

export default SplashScreen;
