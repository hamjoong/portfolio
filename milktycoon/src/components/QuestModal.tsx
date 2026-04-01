import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Clock } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import type { Quest } from '../types/user';
import { useGameStore } from '../store/useGameStore';
import BaseModal from './common/BaseModal';
import { calculateProgress } from '../utils/gameHelpers';

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuestModal: React.FC<QuestModalProps> = ({ isOpen, onClose }) => {
  const dailyQuests = useUserStore((state) => state.dailyQuests);
  const weeklyQuests = useUserStore((state) => state.weeklyQuests);
  const stats = useGameStore((state) => state.stats);
  const cows = useGameStore((state) => state.cows);
  const ranchLevel = useGameStore((state) => state.ranchLevel);
  const [activeTab, setActiveTab] = useState<'DAILY' | 'WEEKLY'>('DAILY');

  const allQuests = activeTab === 'DAILY' ? dailyQuests : weeklyQuests;

  const visibleQuests = useMemo(() => {
    const groups: { [key: string]: Quest[] } = {};
    allQuests.forEach(q => {
      if (!groups[q.groupId]) groups[q.groupId] = [];
      groups[q.groupId].push(q);
    });

    return Object.values(groups)
      .map(group => group.sort((a, b) => a.tier - b.tier).find(q => !q.isClaimed))
      .filter((q): q is Quest => q !== undefined);
  }, [allQuests]);

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="퀘스트" 
      subtitle="퀘스트 미션"
      icon={<Trophy size={32} />}
    >
      <div className="px-2 mb-6">
        <div className="flex bg-gray-100 p-1.5 rounded-[1.5rem]">
          <button onClick={() => setActiveTab('DAILY')} className={`flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'DAILY' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}><Clock size={18} /> 일일 퀘스트</button>
          <button onClick={() => setActiveTab('WEEKLY')} className={`flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'WEEKLY' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}><Calendar size={18} /> 주간 퀘스트</button>
        </div>
      </div>

      {visibleQuests.map((quest) => {
        const current = calculateProgress(quest.targetType, stats, cows, ranchLevel);
        const isCompleted = current >= quest.targetValue;
        const totalTiers = allQuests.filter(q => q.groupId === quest.groupId).length;

        return (
          <div key={quest.id} className={`p-6 mb-4 rounded-[2rem] border-2 transition-all ${quest.isClaimed ? 'bg-gray-50 opacity-60' : isCompleted ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-50 shadow-sm'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-gray-800 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Step {quest.tier}/{totalTiers}</span>
                  <h3 className="font-black text-xl">{quest.title}</h3>
                </div>
                <p className="text-sm text-gray-500 font-bold leading-tight">{quest.description}</p>
              </div>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full mb-4 overflow-hidden shadow-inner">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((current/quest.targetValue)*100, 100)}%` }} className={`h-full ${isCompleted ? 'bg-blue-500' : 'bg-blue-300'}`} />
            </div>
          </div>
        );
      })}
    </BaseModal>
  );
};

export default QuestModal;
