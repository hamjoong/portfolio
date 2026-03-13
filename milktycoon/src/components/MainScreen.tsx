import React from 'react';
import { motion } from 'framer-motion';
import { Play, Settings, UserCheck, Star } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';

/**
 * @interface MainScreenProps
 * @description MainScreen 컴포넌트의 props를 정의합니다.
 * @property {() => void} onStart - '게임 시작' 버튼 클릭 시 호출될 함수입니다.
 */
interface MainScreenProps {
  onStart: () => void;
}

/**
 * @function MainScreen
 * @description 게임의 메인 시작 화면을 렌더링하는 컴포넌트입니다.
 * @param {MainScreenProps} props - 컴포넌트 props
 * @returns {JSX.Element}
 */
const MainScreen: React.FC<MainScreenProps> = React.memo(({ onStart }) => {
  const uiActions = useUIStore((state) => state.actions);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-h-sky-base via-h-sky-soft to-h-green-light font-game">
      
      {/* 1. 움직이는 배경 ( 살아있는 목장 ) - 명확성을 위해 투명도 감소 */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
        <div className="absolute top-[5%] left-[10%] text-[8vw] animate-float opacity-80 drop-shadow-md">☁️</div>
        <div className="absolute top-[12%] right-[8%] text-[6vw] animate-float opacity-70 drop-shadow-md" style={{ animationDelay: '1s' }}>☁️</div>
        <div className="absolute bottom-0 w-[120%] left-[-10%] h-[40%] bg-h-green-base rounded-t-[30%] translate-y-10 shadow-[inset_0_20px_40px_rgba(255,255,255,0.3)]" />
        <div className="absolute bottom-[20%] right-[5%] text-[12vw] drop-shadow-2xl animate-soft-pulse">🏡</div>
        <div className="absolute bottom-[15%] left-[5%] text-[6vw] drop-shadow-lg animate-wiggle">🌳</div>
      </div>

      {/* 2. 콘텐츠 레이어 - 겹침 방지를 위해 동적 간격 사용 */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 md:p-12">
        
        {/* 유연한 중앙 정렬을 위한 상단 스페이서 */}
        <div className="flex-1 min-h-[20px]" />

        {/* 로고 & 타이틀 섹션 - 안전을 위해 vmin을 사용하여 크기 조정 */}
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center mb-[5vh]"
        >
          <div className="relative mb-[2vh]">
             <motion.div 
               animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
               transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
               className="text-[25vmin] drop-shadow-[0_15px_30px_rgba(0,0,0,0.15)] leading-none select-none"
             >
               🐄
             </motion.div>
             <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                transition={{ scale: { repeat: Infinity, duration: 2 }, rotate: { repeat: Infinity, duration: 15, ease: "linear" } }}
                className="absolute -top-[1vh] -right-[1vh] bg-h-yellow-base p-[1.5vmin] rounded-full shadow-2.5d-yellow border-[0.5vmin] border-h-milk"
             >
               <Star className="text-white fill-white w-[4vmin] h-[4vmin]" />
             </motion.div>
          </div>
          
          <div className="flex items-center gap-[1vw]">
            <h1 className="text-[12vmin] font-black text-h-text tracking-tighter text-center drop-shadow-[0_0.8vmin_0_rgba(255,255,255,1)] leading-tight select-none">
              짜요 타이쿤
            </h1>
            <div className="bg-[#FFEDD5] px-[0.8vw] py-[1vh] rounded-[0.8rem] shadow-2.5d-sm border-[0.2vmin] border-h-orange-warm flex flex-col items-center justify-center gap-0.5 z-20">
              {['리', '마', '스', '터'].map((char, i) => (
                <span key={i} className="text-h-orange-warm font-black text-[1.2vmin] leading-none tracking-tighter uppercase">{char}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 중간 스페이서 */}
        <div className="flex-1 min-h-[20px]" />

        {/* 액션 버튼 섹션 - 고정된 최대 너비, 반응형 패딩 */}
        <div className="w-full max-w-[450px] flex flex-col gap-[2vh] z-30">
          <motion.button 
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97, y: 4 }}
            onClick={onStart}
            className="w-full py-[4vh] bg-h-green-base text-h-milk text-[5vmin] font-black rounded-[2.5rem] shadow-2.5d-green border-[0.5vmin] border-h-green-light flex items-center justify-center gap-4 transition-all active:shadow-none"
          >
            <Play fill="currentColor" strokeWidth={4} className="w-[6vmin] h-[6vmin]" />
            <span>게임 시작</span>
          </motion.button>

          <div className="flex gap-[2vw]">
            <motion.button 
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97, y: 3 }}
              onClick={uiActions.openSettings}
              className="flex-1 py-[2.5vh] bg-h-milk text-h-text font-black text-[2.5vmin] rounded-[1.5rem] shadow-2.5d-white border-[0.3vmin] border-h-green-light flex items-center justify-center gap-2 transition-all active:shadow-none"
            >
              <Settings strokeWidth={3} className="w-[3.5vmin] h-[3.5vmin]" />
              <span>설정</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97, y: 3 }}
              onClick={() => alert('서비스 준비 중')}
              className="flex-1 py-[2.5vh] bg-h-sky-base text-h-milk font-black text-[2.5vmin] rounded-[1.5rem] shadow-2.5d-blue border-[0.3vmin] border-h-sky-soft flex items-center justify-center gap-2 transition-all active:shadow-none"
            >
              <UserCheck strokeWidth={3} className="w-[3.5vmin] h-[3.5vmin]" />
              <span>연동</span>
            </motion.button>
          </div>
        </div>

        {/* 하단 스페이서 */}
        <div className="flex-1 min-h-[40px]" />

        {/* 바닥글 - 겹침을 방지하기 위해 절대 위치가 아닌 하단에 상대적으로 위치 */}
        <div className="text-h-brown-soft/50 text-[1.5vmin] font-black tracking-[0.4em] uppercase pb-4 select-none">
          Copyright(C) 22026. Hjuk. All right reserved. 본 사이트는 비상업적인 용도로 제작된 포트폴리오 사이트입니다
        </div>
      </div>
    </div>
  );
});

export default MainScreen;
