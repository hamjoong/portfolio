import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Medal, Calendar, Clock } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** 
 * @function RankingModal
 * @description 플레이어들의 일일 및 주간 랭킹 순위를 보여주는 모달 컴포넌트입니다.
 * @param {RankingModalProps} props - 모달 제어 props
 */
const RankingModal: React.FC<RankingModalProps> = ({ isOpen, onClose }) => {
  const dailyRanking = useGameStore((state) => state.dailyRanking);
  const weeklyRanking = useGameStore((state) => state.weeklyRanking);
  const [activeTab, setActiveTab] = useState<'DAILY' | 'WEEKLY'>('DAILY');

  const rankings = activeTab === 'DAILY' ? dailyRanking : weeklyRanking;
  const sortedRanking = [...rankings].sort((a, b) => b.score - a.score);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed inset-4 m-auto max-w-md h-fit max-h-[85vh] bg-white rounded-[3rem] p-8 z-[101] shadow-2xl flex flex-col overflow-hidden font-game">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black text-cow-black flex items-center gap-3">
                <Trophy className="text-yellow-500" />
                목장주 랭킹
              </h2>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={24} className="text-gray-600" /></button>
            </div>

            {/* 탭 메뉴 */}
            <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-6">
              <button onClick={() => setActiveTab('DAILY')} className={`flex-1 py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'DAILY' ? 'bg-white shadow-sm text-farm-green' : 'text-gray-400'}`}>
                <Clock size={18} /> 일간 순위
              </button>
              <button onClick={() => setActiveTab('WEEKLY')} className={`flex-1 py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'WEEKLY' ? 'bg-white shadow-sm text-farm-green' : 'text-gray-400'}`}>
                <Calendar size={18} /> 주간 순위
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {sortedRanking.map((user, index) => (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  key={user.name} 
                  className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all ${user.name.includes('나') ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-50 shadow-sm'}`}
                >
                  <div className="w-10 h-10 flex items-center justify-center font-black text-xl">
                    {index === 0 ? <Medal className="text-yellow-500 w-8 h-8" /> : index === 1 ? <Medal className="text-gray-400 w-8 h-8" /> : index === 2 ? <Medal className="text-orange-400 w-8 h-8" /> : <span className="text-gray-400">{index + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-cow-black">{user.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{activeTab} RECORD</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-farm-green">🪙 {user.score.toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center text-[10px] text-gray-400 font-bold">
              랭킹은 매일/매주 자정에 초기화됩니다.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RankingModal;
