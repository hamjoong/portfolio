import React from 'react';
import { motion } from 'framer-motion';

const MerchantTruck: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <motion.div 
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -200, opacity: 0 }}
      transition={{ type: "spring", stiffness: 50, damping: 15 }}
      onClick={onClick}
      className="relative w-48 h-32 cursor-pointer group"
    >
      <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-2xl">
        <defs>
          <linearGradient id="truckBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="cabinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>
        
        {/* Wheels shadow */}
        <ellipse cx="50" cy="110" rx="15" ry="5" fill="black" opacity="0.2" />
        <ellipse cx="150" cy="110" rx="15" ry="5" fill="black" opacity="0.2" />
        
        {/* Main Refrigerated Container */}
        <rect x="60" y="20" width="130" height="80" rx="4" fill="url(#truckBody)" stroke="#94a3b8" strokeWidth="2" />
        <line x1="125" y1="20" x2="125" y2="100" stroke="#cbd5e1" strokeWidth="1" />
        
        {/* Cooling Unit on top */}
        <rect x="80" y="10" width="40" height="10" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
        
        {/* Cabin */}
        <path d="M10 100 L60 100 L60 40 L40 40 L10 70 Z" fill="url(#cabinGrad)" stroke="#1e3a8a" strokeWidth="2" />
        
        {/* Window */}
        <path d="M42 48 L55 48 L55 65 L42 65 Z" fill="#bae6fd" stroke="#1e3a8a" strokeWidth="1.5" />
        <rect x="42" y="48" width="13" height="17" fill="white" opacity="0.3" />
        
        {/* Wheels */}
        <circle cx="50" cy="100" r="12" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        <circle cx="50" cy="100" r="5" fill="#94a3b8" />
        
        <circle cx="150" cy="100" r="12" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        <circle cx="150" cy="100" r="5" fill="#94a3b8" />
        
        {/* Logo/Text on side */}
        <text x="125" y="65" textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="black" fontFamily="sans-serif">FRESH MILK</text>
        <path d="M110 75 Q125 85 140 75" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
        
        {/* Headlight */}
        <rect x="10" y="75" width="5" height="10" rx="1" fill="#fde68a" />
      </svg>
      
      {/* Alert Bubble */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg border-2 border-blue-500 whitespace-nowrap"
      >
        <span className="text-[10px] font-black text-blue-600">신선한 우유 삽니다! 🥛</span>
      </motion.div>
    </motion.div>
  );
};

export default MerchantTruck;
