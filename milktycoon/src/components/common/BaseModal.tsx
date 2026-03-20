import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const BaseModal: React.FC<BaseModalProps> = ({ isOpen, onClose, title, subtitle, icon, children }) => (
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
          <div className="p-8 pb-6 flex justify-between items-center bg-white border-b-2 border-gray-50">
            <div className="flex items-center gap-4">
              {icon && <div className="bg-purple-100 p-3 rounded-2xl text-purple-600 shadow-sm">{icon}</div>}
              <div>
                <h2 className="text-3xl font-black tracking-tight">{title}</h2>
                {subtitle && <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{subtitle}</p>}
              </div>
            </div>
            <button onClick={onClose} className="bg-gray-100 p-3 rounded-2xl text-gray-500 active:translate-y-1"><X size={24} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default BaseModal;
