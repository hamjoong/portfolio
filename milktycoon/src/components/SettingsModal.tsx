import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Music, Bell, ShieldCheck, Settings } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** 
 * @function SettingsModal
 * @description 게임의 사운드(BGM, SFX), 푸시 알림, 데이터 저장 등 시스템 설정을 관리하는 모달 컴포넌트입니다.
 * @param {SettingsModalProps} props - 모달 제어 props
 */
const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const settings = useUserStore((state) => state.settings);
  const actions = useUserStore((state) => state.actions);

  const togglePush = () => {
    actions.updateSettings({ pushEnabled: !settings.pushEnabled });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 pointer-events-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-h-brown-deep/60 backdrop-blur-md" 
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 50 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.8, opacity: 0, y: 50 }} 
            className="relative w-full max-w-md h-fit bg-h-cream rounded-[4rem] border-4 border-h-milk shadow-2.5d-lg flex flex-col overflow-hidden text-h-text p-10 font-game"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="bg-h-green-base p-3 rounded-2xl text-h-milk shadow-2.5d-green border-2 border-h-milk">
                  <Settings size={28} strokeWidth={3} />
                </div>
                <h2 className="text-4xl font-black tracking-tight drop-shadow-sm">게임 설정</h2>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose} 
                className="bg-h-milk/80 p-3 rounded-2xl text-h-brown-soft shadow-2.5d-white border-2 border-h-brown-soft/10 active:shadow-none active:translate-y-1 transition-all"
              >
                <X size={24} strokeWidth={3} />
              </motion.button>
            </div>

            <div className="space-y-10">
              {/* BGM Volume */}
              <div className="space-y-4">
                <div className="flex justify-between font-black text-h-text text-xl tracking-tight">
                  <span className="flex items-center gap-3"><Music size={22} className="text-h-brown-soft" /> 배경음악</span>
                  <span className="text-h-brown-soft opacity-70">{settings.bgmVolume}%</span>
                </div>
                <div className="relative h-4 bg-h-brown-deep/10 rounded-full border-2 border-h-milk/50 shadow-inner overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${settings.bgmVolume}%` }}
                    className="absolute h-full bg-h-green-base"
                  />
                  <input 
                    type="range" 
                    value={settings.bgmVolume} 
                    onChange={(e) => actions.updateSettings({ bgmVolume: Number(e.target.value) })} 
                    className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" 
                  />
                </div>
              </div>

              {/* SFX Volume */}
              <div className="space-y-4">
                <div className="flex justify-between font-black text-h-text text-xl tracking-tight">
                  <span className="flex items-center gap-3"><Volume2 size={22} className="text-h-brown-soft" /> 효과음</span>
                  <span className="text-h-brown-soft opacity-70">{settings.sfxVolume}%</span>
                </div>
                <div className="relative h-4 bg-h-brown-deep/10 rounded-full border-2 border-h-milk/50 shadow-inner overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${settings.sfxVolume}%` }}
                    className="absolute h-full bg-h-sky-base"
                  />
                  <input 
                    type="range" 
                    value={settings.sfxVolume} 
                    onChange={(e) => actions.updateSettings({ sfxVolume: Number(e.target.value) })} 
                    className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" 
                  />
                </div>
              </div>

              {/* Push Toggle - High Visibility Gray Border Version */}
              <div className="flex justify-between items-center py-5 bg-h-brown-deep/5 px-6 rounded-[2.5rem] border-4 border-h-milk shadow-inner">
                <span className="font-black text-h-text text-xl flex items-center gap-3 tracking-tight">
                  <Bell size={24} className="text-h-brown-soft" /> 푸시 알림
                </span>
                <button 
                  onClick={togglePush}
                  className={`w-20 h-10 rounded-full relative transition-all duration-300 border-4 border-[#475569] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] ${settings.pushEnabled ? 'bg-h-green-base' : 'bg-slate-300'}`}
                >
                  <motion.div 
                    animate={{ x: settings.pushEnabled ? 40 : 4 }}
                    className="absolute top-1 w-6 h-6 rounded-full shadow-md border-2 border-[#475569] bg-white flex items-center justify-center transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${settings.pushEnabled ? 'bg-h-green-base' : 'bg-slate-400'}`} />
                  </motion.div>
                </button>
              </div>

              {/* Cloud Save Button */}
              <div className="pt-8 border-t-4 border-h-brown-soft/5 flex flex-col gap-6">
                <p className="text-xs text-center text-h-brown-soft/50 font-black uppercase tracking-[0.3em]">Account Management</p>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95, y: 6 }}
                  className="w-full py-6 bg-h-milk text-h-text font-black text-lg rounded-[2.5rem] shadow-2.5d-white border-4 border-h-green-light/30 flex items-center justify-center gap-4 transition-all duration-75 active:shadow-none active:translate-y-2"
                >
                  <ShieldCheck size={24} strokeWidth={3} className="text-h-green-base" />
                  <span>데이터 클라우드 저장</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
