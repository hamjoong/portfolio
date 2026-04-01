import React, { useMemo } from 'react';
import { Award } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import type { Achievement } from '../types/user';
import { useGameStore } from '../store/useGameStore';
import BaseModal from './common/BaseModal';
import { motion } from 'framer-motion';
import { calculateProgress } from '../utils/gameHelpers';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AchievementModal: React.FC<AchievementModalProps> = ({ isOpen, onClose }) => {
  const achievements = useUserStore((state) => state.achievements);
  
  const stats = useGameStore((state) => state.stats);
  const cows = useGameStore((state) => state.cows);
  const ranchLevel = useGameStore((state) => state.ranchLevel);

  const visibleAchievements = useMemo(() => {
    const groups: { [key: string]: Achievement[] } = {};
    achievements.forEach(a => {
      if (!groups[a.groupId]) groups[a.groupId] = [];
      groups[a.groupId].push(a);
    });

    return Object.values(groups)
      .map(group => group.sort((a, b) => a.tier - b.tier).find(a => !a.isClaimed))
      .filter((a): a is Achievement => a !== undefined);
  }, [achievements]);

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="업적" 
      subtitle="업적 미션"
      icon={<Award size={32} />}
    >
      <p className="text-sm text-gray-400 font-bold mb-4 px-2 italic">평생에 걸친 위대한 목표를 달성하고 다이아몬드를 획득하세요!</p>
      {visibleAchievements.map((achievement) => {
        const current = calculateProgress(achievement.targetType, stats, cows, ranchLevel);
        const isCompleted = current >= achievement.targetValue;
        const totalTiers = achievements.filter(a => a.groupId === achievement.groupId).length;
        const progressPercent = Math.min((current / achievement.targetValue) * 100, 100);

        return (
          <div key={achievement.id} className={`p-6 mb-4 rounded-[2rem] border-2 transition-all ${achievement.isClaimed ? 'bg-gray-50 opacity-60' : isCompleted ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-50 shadow-sm'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Step {achievement.tier}/{totalTiers}</span>
                  <h3 className="font-black text-xl">{achievement.title}</h3>
                </div>
                <p className="text-sm text-gray-500 font-bold leading-tight">{achievement.description}</p>
              </div>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full mb-4 overflow-hidden shadow-inner">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} className={`h-full ${isCompleted ? 'bg-purple-500' : 'bg-purple-300'}`} />
            </div>
          </div>
        );
      })}
    </BaseModal>
  );
};
export default AchievementModal;
