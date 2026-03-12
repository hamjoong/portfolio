import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, CalendarCheck } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { ATTENDANCE_REWARDS } from '../types/user';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** 
 * @function AttendanceModal
 * @description 매일 접속 시 지급되는 출석 보상 현황을 보여주는 모달 컴포넌트입니다.
 * @param {AttendanceModalProps} props - 모달 제어 props
 */
const AttendanceModal: React.FC<AttendanceModalProps> = ({ isOpen, onClose }) => {
  const { attendanceDays } = useUserStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/70 backdrop-blur-md" 
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
            className="relative w-full max-w-lg bg-white rounded-[3.5rem] border-b-[12px] border-black/10 shadow-2xl flex flex-col overflow-hidden font-game text-cow-black"
          >
            {/* Header */}
            <div className="p-8 pb-6 flex justify-between items-center bg-white border-b-2 border-gray-50">
              <div className="flex items-center gap-4">
                <div className="bg-pink-100 p-3 rounded-2xl text-pink-600 shadow-sm">
                  <CalendarCheck size={32} strokeWidth={3} />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">출석 보상</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">7일 출석</p>
                </div>
              </div>
              <button onClick={onClose} className="bg-gray-100 border-gray-200 p-3 rounded-2xl text-gray-500 active:translate-y-1 transition-all">
                <X size={24} strokeWidth={4} />
              </button>
            </div>

            <div className="p-8">
              <p className="text-sm text-gray-400 font-bold mb-8 text-center px-4">매일매일 목장을 방문하고 성장에 필요한 재화를 획득하세요!</p>
              
              <div className="grid grid-cols-4 gap-4 mb-8">
                {ATTENDANCE_REWARDS.map((reward, index) => {
                  const isReceived = index < attendanceDays;
                  const isCurrent = index === attendanceDays - 1;
                  return (
                    <div key={reward.day} className={`relative p-5 rounded-[2rem] border-2 flex flex-col items-center justify-center gap-2 transition-all ${isReceived ? 'bg-green-50 border-green-200 opacity-60' : isCurrent ? 'bg-yellow-50 border-yellow-400 scale-105 shadow-lg z-10' : 'bg-white border-gray-100 shadow-sm'}`}>
                      <span className="text-[10px] font-black text-gray-400 uppercase leading-none">Day {reward.day}</span>
                      <div className="text-2xl py-1">{reward.type === 'GOLD' ? '🪙' : reward.type === 'DIA' ? '💎' : '🚀'}</div>
                      <span className="text-[10px] font-black">{reward.amount.toLocaleString()}</span>
                      {isReceived && (
                        <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center rounded-[2rem]">
                          <CheckCircle2 className="text-green-600 w-8 h-8" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={onClose} 
                className="w-full py-6 bg-green-500 border-green-700 text-white text-2xl font-black rounded-[2.5rem] shadow-xl active:translate-y-2 active:shadow-none transition-all"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AttendanceModal;
