import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, CheckCircle, Lock, Calendar, Clock } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import type { Quest } from '../types/user';
import { useGameStore } from '../store/useGameStore';

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** 
 * @function QuestModal
 * @description 일일 및 주간 퀘스트 목록을 보여주고 보상을 수령하는 모달 컴포넌트입니다.
 * @param {QuestModalProps} props - 모달 제어 props
 */
const QuestModal: React.FC<QuestModalProps> = ({ isOpen, onClose }) => {
  const dailyQuests = useUserStore((state) => state.dailyQuests);
  const weeklyQuests = useUserStore((state) => state.weeklyQuests);
  const userActions = useUserStore((state) => state.actions);
  
  const stats = useGameStore((state) => state.stats);
  const cows = useGameStore((state) => state.cows);
  
  const [activeTab, setActiveTab] = useState<'DAILY' | 'WEEKLY'>('DAILY');

  const allQuests = activeTab === 'DAILY' ? dailyQuests : weeklyQuests;

  // 그룹별로 묶어서 현재 진행 중인 단계만 추출
  const getVisibleQuests = (quests: Quest[]) => {
    const groups: { [key: string]: Quest[] } = {};
    quests.forEach(q => {
      if (!groups[q.groupId]) groups[q.groupId] = [];
      groups[q.groupId].push(q);
    });

    return Object.values(groups)
      .map(group => {
        // 1. 아직 보상을 받지 않은(unclaimed) 가장 낮은 단계를 찾음
        const current = group.sort((a, b) => a.tier - b.tier).find(q => !q.isClaimed);
        // 모든 단계를 완료했다면 undefined 반환하여 필터링
        return current;
      })
      .filter((q): q is Quest => q !== undefined);
  };

  const visibleQuests = getVisibleQuests(allQuests);

  const getProgress = (quest: Quest) => {
    if (!stats) return 0;
    switch (quest.targetType) {
      case 'MILK_SOLD': return stats.totalMilkSold || 0;
      case 'WOLF_KILLED': return stats.totalWolvesKilled || 0;
      case 'COW_COUNT': return cows?.length || 0;
      case 'GOLD_EARNED': return stats.totalGoldEarned || 0;
      case 'MILK_ACTION': return stats.totalMilkClicks || 0;
      default: return 0;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-auto font-game">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl h-fit max-h-[85vh] bg-white rounded-[3.5rem] border-b-[12px] border-black/10 shadow-2xl flex flex-col overflow-hidden text-cow-black">
            <div className="p-8 pb-4 flex justify-between items-center bg-white">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 shadow-sm"><Trophy size={32} /></div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">퀘스트</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">퀘스트 미션</p>
                </div>
              </div>
              <button onClick={onClose} className="btn-chunky bg-gray-100 p-3 rounded-2xl text-gray-500"><X size={24} /></button>
            </div>

            <div className="px-8 mb-6">
              <div className="flex bg-gray-100 p-1.5 rounded-[1.5rem]">
                <button onClick={() => setActiveTab('DAILY')} className={`flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'DAILY' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}><Clock size={18} /> 일일 퀘스트</button>
                <button onClick={() => setActiveTab('WEEKLY')} className={`flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'WEEKLY' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}><Calendar size={18} /> 주간 퀘스트</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-4 custom-scrollbar">
              {visibleQuests.map((quest) => {
                const current = getProgress(quest);
                const isCompleted = current >= quest.targetValue;
                const totalTiers = allQuests.filter(q => q.groupId === quest.groupId).length;

                return (
                  <div key={quest.id} className={`p-6 rounded-[2rem] border-2 transition-all ${quest.isClaimed ? 'bg-gray-50 opacity-60' : isCompleted ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-50 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-gray-800 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Step {quest.tier}/{totalTiers}</span>
                          <h3 className="font-black text-xl">{quest.title}</h3>
                        </div>
                        <p className="text-sm text-gray-500 font-bold leading-tight">{quest.description}</p>
                      </div>
                      <div className="ml-4">
                        {quest.isClaimed ? <CheckCircle className="text-green-500 w-8 h-8" /> : isCompleted ? <div className="bg-yellow-400 p-2 rounded-xl text-white animate-bounce shadow-md"><Trophy size={20} /></div> : <Lock className="text-gray-300 w-6 h-6" />}
                      </div>
                    </div>
                    
                    <div className="w-full h-4 bg-gray-100 rounded-full mb-4 overflow-hidden shadow-inner">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((current/quest.targetValue)*100, 100)}%` }} className={`h-full ${isCompleted ? 'bg-blue-500' : 'bg-blue-300'}`} />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-gray-400">{current.toLocaleString()} / {quest.targetValue.toLocaleString()}</span>
                      {!quest.isClaimed && (
                        <button onClick={() => userActions.claimQuestReward(quest.id, quest.type)} disabled={!isCompleted} className={`btn-chunky px-6 py-2.5 rounded-2xl font-black text-sm transition-all ${isCompleted ? 'bg-blue-600 border-blue-800 text-white shadow-lg' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`}>
                          보상 받기 🪙 {quest.rewardGold.toLocaleString()}
                        </button>
                      )}
                      {quest.isClaimed && <span className="font-black text-blue-600 italic">CLEARED</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuestModal;
