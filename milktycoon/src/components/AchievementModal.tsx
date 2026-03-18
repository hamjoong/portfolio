import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, CheckCircle, Lock } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import type { Achievement } from '../types/user';
import { useGameStore } from '../store/useGameStore';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** 
 * @function AchievementModal
 * @description 게임 내 업적 달성 현황을 확인하고 보상(다이아몬드)을 수령하는 모달 컴포넌트입니다.
 * @param {AchievementModalProps} props - 모달 제어 props
 */
const AchievementModal: React.FC<AchievementModalProps> = ({ isOpen, onClose }) => {
  const achievements = useUserStore((state) => state.achievements);
  const userActions = useUserStore((state) => state.actions);
  
  const stats = useGameStore((state) => state.stats);
  const cows = useGameStore((state) => state.cows);
  const ranchLevel = useGameStore((state) => state.ranchLevel);

  // 그룹별로 묶어서 현재 진행 중인 단계만 추출
  const getVisibleAchievements = (items: Achievement[]) => {
    const groups: { [key: string]: Achievement[] } = {};
    items.forEach(a => {
      if (!groups[a.groupId]) groups[a.groupId] = [];
      groups[a.groupId].push(a);
    });

    return Object.values(groups)
      .map(group => {
        // 아직 보상을 받지 않은 가장 낮은 단계를 찾음
        const current = group.sort((a, b) => a.tier - b.tier).find(a => !a.isClaimed);
        // 모든 단계를 완료했다면 undefined 반환하여 필터링
        return current;
      })
      .filter((a): a is Achievement => a !== undefined);
  };

  const visibleAchievements = getVisibleAchievements(achievements);

  const getProgress = (achievement: Achievement) => {
    if (!stats) return 0;
    switch (achievement.targetType) {
      case 'MILK_SOLD': return stats.totalMilkSold || 0;
      case 'WOLF_KILLED': return stats.totalWolvesKilled || 0;
      case 'COW_COUNT': return cows?.length || 0;
      case 'GOLD_EARNED': return stats.totalGoldEarned || 0;
      case 'PLAYER_LEVEL': return ranchLevel || 1;
      default: return 0;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-auto font-game">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
            className="relative w-full max-w-2xl h-fit max-h-[85vh] bg-white rounded-[3.5rem] border-b-[12px] border-black/10 shadow-2xl flex flex-col overflow-hidden text-cow-black"
          >
            {/* Unified Header */}
            <div className="p-8 pb-6 flex justify-between items-center bg-white border-b-2 border-gray-50">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-2xl text-purple-600 shadow-sm"><Award size={32} /></div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">업적</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">업적 미션</p>
                </div>
              </div>
              <button onClick={onClose} className="btn-chunky bg-gray-100 p-3 rounded-2xl text-gray-500 active:translate-y-1"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-4 custom-scrollbar">
              <p className="text-sm text-gray-400 font-bold mb-4 px-2 italic">평생에 걸친 위대한 목표를 달성하고 다이아몬드를 획득하세요!</p>
              
              {visibleAchievements.map((achievement) => {
                const current = getProgress(achievement);
                const isCompleted = current >= achievement.targetValue;
                const totalTiers = achievements.filter(a => a.groupId === achievement.groupId).length;
                const progressPercent = Math.min((current / achievement.targetValue) * 100, 100);

                return (
                  <div key={achievement.id} className={`p-6 rounded-[2rem] border-2 transition-all ${achievement.isClaimed ? 'bg-gray-50 opacity-60' : isCompleted ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-50 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Step {achievement.tier}/{totalTiers}</span>
                          <h3 className="font-black text-xl">{achievement.title}</h3>
                        </div>
                        <p className="text-sm text-gray-500 font-bold leading-tight">{achievement.description}</p>
                      </div>
                      <div className="ml-4">
                        {achievement.isClaimed ? <CheckCircle className="text-green-500 w-8 h-8" /> : isCompleted ? <div className="bg-purple-500 p-2 rounded-xl text-white animate-bounce shadow-md"><Award size={20} /></div> : <Lock className="text-gray-300 w-6 h-6" />}
                      </div>
                    </div>
                    
                    <div className="w-full h-4 bg-gray-100 rounded-full mb-4 overflow-hidden shadow-inner">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} className={`h-full ${isCompleted ? 'bg-purple-500' : 'bg-purple-300'}`} />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-gray-400">{current.toLocaleString()} / {achievement.targetValue.toLocaleString()}</span>
                      {!achievement.isClaimed && (
                        <button onClick={() => userActions.claimAchievementReward(achievement.id)} disabled={!isCompleted} className={`btn-chunky px-6 py-2.5 rounded-2xl font-black text-sm transition-all ${isCompleted ? 'bg-purple-600 border-purple-800 text-white shadow-lg' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`}>
                          보상 받기 💎 {achievement.rewardDia}
                        </button>
                      )}
                      {achievement.isClaimed && <span className="font-black text-purple-600 italic">LEGENDARY</span>}
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

export default AchievementModal;
