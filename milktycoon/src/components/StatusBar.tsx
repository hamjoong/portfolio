import React from 'react';
import { useUserStore } from '../store/useUserStore';
import { useGameStore } from '../store/useGameStore';
import { useUIStore } from '../store/useUIStore';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const StatusBar: React.FC = () => {
  const userName = useUserStore((state) => state.userName);
  const avatar = useUserStore((state) => state.avatar);
  const gold = useUserStore((state) => state.gold);
  const dia = useUserStore((state) => state.dia);
  
  const inventory = useGameStore((state) => state.inventory);
  const facilities = useGameStore((state) => state.facilities);
  const ranchLevel = useGameStore((state) => state.ranchLevel);
  const experience = useGameStore((state) => state.experience);
  
  const uiActions = useUIStore((state) => state.actions);
  
  const nextExp = ranchLevel * 1000;
  const expPercent = (experience / nextExp) * 100;
  const milkPercent = (inventory.milk / (facilities.storage?.capacity || 100)) * 100;

  return (
    <div className="flex items-center gap-6 pointer-events-auto scale-90 md:scale-100 origin-top-left relative z-[100]">
      {/* 1. Profile Section */}
      <div className="relative group cursor-pointer">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-24 h-24 bg-h-milk rounded-[2rem] shadow-2.5d-white border-[5px] border-h-milk overflow-hidden flex items-center justify-center text-5xl relative z-10"
        >
          {avatar}
        </motion.div>
        <div className="absolute -bottom-3 -right-3 bg-h-green-base text-h-milk w-12 h-12 rounded-2xl border-[5px] border-h-milk shadow-2.5d-green flex items-center justify-center font-black italic text-lg z-20">
          {ranchLevel}
        </div>
      </div>

      {/* 2. Stats Section */}
      <div className="flex flex-col gap-3">
        {/* Name and EXP Bar */}
        <div className="bg-h-brown-deep/60 backdrop-blur-lg px-5 py-2.5 rounded-[1.5rem] border-2 border-h-milk/20 shadow-2.5d-md min-w-[220px]">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-h-milk font-black text-base tracking-tight drop-shadow-sm">{userName}</p>
            <span className="text-[10px] text-h-green-base font-black uppercase tracking-[0.2em] italic">MASTER</span>
          </div>
          <div className="w-full h-3 bg-h-brown-deep/40 rounded-full overflow-hidden shadow-inner border border-h-milk/10">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${expPercent}%` }} 
              className="h-full bg-gradient-to-r from-h-green-base to-emerald-400" 
            />
          </div>
        </div>

        {/* Resources */}
        <div className="flex gap-2">
          <ResourceItem 
            icon="🪙" 
            value={gold.toLocaleString()} 
            color="text-h-brown-deep" 
            shadow="shadow-2.5d-yellow"
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); uiActions.openIAP('GOLD'); }} 
          />
          <ResourceItem 
            icon="💎" 
            value={dia.toLocaleString()} 
            color="text-blue-500" 
            shadow="shadow-2.5d-blue"
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); uiActions.openIAP('DIA'); }} 
          />
          
          {/* Milk Gauge */}
          <div className="bg-h-milk/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2.5d-white border-2 border-h-green-light/30 flex flex-col min-w-[120px]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-lg">🥛</span>
              <span className="text-[10px] font-black text-h-sky-base">{inventory.milk} / {facilities.storage?.capacity || 100}</span>
            </div>
            <div className="w-full h-1.5 bg-h-sky-soft rounded-full overflow-hidden shadow-inner">
              <motion.div 
                animate={{ width: `${milkPercent}%` }} 
                className="h-full bg-h-sky-base" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ResourceItemProps {
  icon: string;
  value: string;
  color: string;
  shadow: string;
  onClick: (e: React.MouseEvent) => void;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ icon, value, color, shadow, onClick }) => (
  <motion.button 
    whileHover={{ y: -4, scale: 1.05 }}
    whileTap={{ scale: 0.95, y: 2 }}
    onClick={onClick}
    className={`bg-h-milk/95 backdrop-blur-md px-5 py-2.5 rounded-[1.5rem] ${shadow} border-2 border-h-green-light/30 flex items-center gap-4 min-w-[130px] relative group pointer-events-auto active:shadow-none transition-all duration-75`}
  >
    <span className="text-2xl drop-shadow-sm">{icon}</span>
    <span className={`font-black text-base ${color} tracking-tight`}>{value}</span>
    <div className="absolute -top-2 -right-2 bg-h-green-base rounded-full p-1.5 border-4 border-h-milk shadow-2.5d-green opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
      <Plus size={14} className="text-h-milk font-black" strokeWidth={4} />
    </div>
  </motion.button>
);

export default StatusBar;
