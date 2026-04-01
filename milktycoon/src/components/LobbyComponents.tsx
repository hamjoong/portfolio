import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Calendar, Medal } from 'lucide-react';
import type { RankingEntry } from '../types/game';

interface RankingBoardProps {
  dailyRanking: RankingEntry[];
  weeklyRanking: RankingEntry[];
}

/** 
 * @function RankingBoard
 * @description 로비 화면에서 일일/주간 랭킹을 시각적으로 보여주는 보드 컴포넌트입니다.
 * @param {RankingBoardProps} props - 랭킹 데이터 props
 */
export const RankingBoard: React.FC<RankingBoardProps> = React.memo(({ dailyRanking, weeklyRanking }) => {
  const [rankTab, setRankTab] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  
  const currentRanking = rankTab === 'DAILY' ? dailyRanking : weeklyRanking;
  
  const sortedRanking = useMemo(() => {
    return [...currentRanking].sort((a, b) => b.score - a.score);
  }, [currentRanking]);

  return (
    <div className="w-full h-full bg-h-cream/95 backdrop-blur-md rounded-[4rem] border-l-[16px] border-h-brown-deep/5 shadow-2.5d-lg flex flex-col overflow-hidden border-4 border-h-milk/50">
      {/* Board Header */}
      <div className="p-10 pb-6 bg-h-milk/30 flex justify-between items-end border-b-4 border-h-brown-soft/10">
        <div className="flex items-center gap-6">
          <div className="bg-h-yellow-base p-4 rounded-[2rem] text-h-brown-deep shadow-2.5d-yellow border-4 border-h-milk animate-wiggle">
            <Trophy size={48} strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-5xl font-black tracking-tighter text-h-text drop-shadow-sm">목장 랭킹</h2>
            <p className="text-sm font-black text-h-brown-soft uppercase tracking-[0.3em] mt-1 ml-1 opacity-70">목장 랭킹</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-h-brown-deep/5 p-2 rounded-[2.5rem] min-w-[280px] border-2 border-h-brown-deep/5">
          <button 
            onClick={() => setRankTab('DAILY')} 
            className={`flex-1 py-4 px-8 rounded-[2rem] font-black text-lg flex items-center justify-center gap-2 transition-all ${rankTab === 'DAILY' ? 'bg-h-milk shadow-2.5d-sm text-h-brown-deep' : 'text-h-brown-soft opacity-60'}`}
          >
            <Clock size={20} /> 일간
          </button>
          <button 
            onClick={() => setRankTab('WEEKLY')} 
            className={`flex-1 py-4 px-8 rounded-[2rem] font-black text-lg flex items-center justify-center gap-2 transition-all ${rankTab === 'WEEKLY' ? 'bg-h-milk shadow-2.5d-sm text-h-brown-deep' : 'text-h-brown-soft opacity-60'}`}
          >
            <Calendar size={20} /> 주간
          </button>
        </div>
      </div>

      {/* Ranking List */}
      <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div 
            key={rankTab} 
            initial={{ opacity: 0, x: 40 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -40 }} 
            className="space-y-4"
          >
            {sortedRanking.length > 0 ? sortedRanking.map((user, index) => (
              <motion.div 
                initial={{ y: 30, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }} 
                key={user.name} 
                className={`flex items-center gap-8 p-8 rounded-[3rem] border-4 transition-all ${user.name.includes('나') ? 'bg-h-yellow-soft/50 border-h-yellow-base shadow-2.5d-yellow' : 'bg-h-milk border-h-green-light/30 shadow-2.5d-white'}`}
              >
                <div className="w-16 h-16 flex items-center justify-center relative scale-100">
                  {index <= 2 ? (
                    <Medal className={`${index === 0 ? 'text-h-yellow-base' : index === 1 ? 'text-gray-300' : 'text-h-orange-warm'} w-12 h-12 drop-shadow-md`} strokeWidth={3} />
                  ) : (
                    <span className="font-black text-3xl text-h-brown-soft/30 italic">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-2xl text-h-text truncate tracking-tight">{user.name}</p>
                  <p className="text-xs font-black text-h-brown-soft opacity-60 uppercase tracking-widest mt-1">{rankTab} BEST SCORE</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-4xl text-h-green-base tracking-tighter drop-shadow-sm">
                    <span className="text-2xl mr-1">🪙</span> {user.score.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-h-brown-soft py-20 opacity-30">
                <Trophy size={80} className="mb-4" />
                <p className="text-2xl font-black">데이터 로딩 중...</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});

/** 
 * @function LobbyBackground
 * @description 로비 화면에 애니메이션 효과가 포함된 배경(구름, 집, 나무 등)을 렌더링하는 컴포넌트입니다.
 */
export const LobbyBackground: React.FC = React.memo(() => (
  <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
    <div className="absolute top-[8%] left-[15%] text-[120px] animate-float drop-shadow-md">☁️</div>
    <div className="absolute top-[25%] left-[45%] text-[80px] animate-float drop-shadow-md opacity-60" style={{ animationDelay: '2s' }}>☁️</div>
    <div className="absolute bottom-0 w-full h-[45%] bg-h-green-base/40 rounded-t-[20rem] translate-y-12 shadow-[inset_0_20px_40px_rgba(255,255,255,0.3)]" />
    <div className="absolute bottom-[18%] left-[8%] text-[160px] rotate-[-12deg] drop-shadow-2xl animate-soft-pulse">🏡</div>
    <div className="absolute bottom-[22%] left-[25%] text-7xl animate-wiggle">🌳</div>
  </div>
));
