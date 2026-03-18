import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Crown, Heart, ShoppingCart } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';

const GOLD_PRODUCTS = [
  { id: 'g1', amount: 5000, price: '1,500원', icon: '💰', tag: null },
  { id: 'g2', amount: 30000, price: '5,500원', icon: '💰💰', tag: '인기' },
  { id: 'g3', amount: 100000, price: '15,000원', icon: '🏦', tag: '최고 가치' },
];

const DIA_PRODUCTS = [
  { id: 'd1', amount: 10, price: '2,500원', icon: '💎', tag: null },
  { id: 'd2', amount: 60, price: '11,000원', icon: '💎💎', tag: '인기' },
  { id: 'd3', amount: 200, price: '33,000원', icon: '👑', tag: '에픽' },
];

const PASS_REWARDS = [
  { lv: 1, free: '500G', premium: '10 DIA' },
  { lv: 2, free: '10 Ammo', premium: '2000G' },
  { lv: 3, free: '1000G', premium: 'Gold Cow' },
];

/** 
 * @function IAPModal
 * @description 실제 결제(In-App Purchase)를 통해 골드, 다이아몬드, 카우 패스 등을 구매할 수 있는 프리미엄 상점 모달입니다.
 */
const IAPModal: React.FC = () => {
  const { isIAPOpen, iapTab, actions: uiActions } = useUIStore();
  const products = iapTab === 'GOLD' ? GOLD_PRODUCTS : DIA_PRODUCTS;

  return (
    <AnimatePresence>
      {isIAPOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 pointer-events-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={uiActions.closeIAP}
            className="absolute inset-0 bg-h-brown-deep/70 backdrop-blur-md" 
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.85, opacity: 0, y: 60 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.85, opacity: 0, y: 60 }} 
            className="relative w-full max-w-5xl h-fit max-h-[95vh] bg-h-cream rounded-[4rem] border-4 border-h-milk shadow-2.5d-lg flex flex-col overflow-hidden font-game text-h-text"
          >
            {/* Header (Compressed) */}
            <div className="p-8 flex justify-between items-center bg-h-milk/40 border-b-4 border-h-brown-soft/10 shrink-0">
              <div className="flex items-center gap-5">
                <div className="bg-h-orange-warm p-4 rounded-[2rem] text-h-milk shadow-2.5d-orange border-4 border-h-milk">
                  <ShoppingCart size={32} strokeWidth={3} />
                </div>
                <div>
                  <h2 className="text-4xl font-black tracking-tight drop-shadow-sm">프리미엄 상점</h2>
                  <p className="text-[10px] font-black text-h-brown-soft uppercase tracking-[0.3em] mt-0.5 ml-1 opacity-70">프리미엄 상점</p>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={uiActions.closeIAP} 
                className="bg-h-milk/80 p-4 rounded-2xl text-h-brown-soft shadow-2.5d-white border-2 border-h-brown-soft/10 active:shadow-none active:translate-y-2 transition-all"
              >
                <X size={28} strokeWidth={3} />
              </motion.button>
            </div>

            {/* Tabs (Compressed) */}
            <div className="px-8 mt-6 shrink-0">
              <div className="flex bg-h-brown-deep/5 p-1.5 rounded-[3rem] gap-2 border-2 border-h-brown-deep/5 shadow-inner">
                <TabButton active={iapTab === 'GOLD'} onClick={() => uiActions.setIAPTab('GOLD')} label="골드" icon="🪙" />
                <TabButton active={iapTab === 'DIA'} onClick={() => uiActions.setIAPTab('DIA')} label="다이아" icon="💎" />
                <TabButton active={iapTab === 'PASS'} onClick={() => uiActions.setIAPTab('PASS')} label="카우 패스" icon="🎫" />
              </div>
            </div>

            {/* List Area (Optimized for single view) */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {iapTab === 'PASS' ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-400 rounded-[3rem] p-8 text-h-milk shadow-2.5d-lg relative overflow-hidden border-4 border-h-milk/30">
                    <Crown size={120} className="absolute top-[-10px] right-[-10px] opacity-20 rotate-12" />
                    <div className="relative z-10">
                      <div className="inline-block bg-h-milk/20 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 backdrop-blur-sm">Season 1 Limited</div>
                      <h3 className="text-4xl font-black mb-2 drop-shadow-md tracking-tight">카우 패스 (Cow Pass)</h3>
                      <p className="text-lg font-black opacity-90 mb-6 leading-tight">특별 보상을 모두 획득하세요!</p>
                      <motion.button 
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95, y: 8 }}
                        className="bg-h-yellow-base border-4 border-h-milk text-h-brown-deep px-10 py-4 rounded-[2rem] font-black text-xl shadow-2.5d-yellow active:shadow-none"
                      >
                        5,500원으로 활성화
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="bg-h-milk/60 rounded-[3rem] p-6 shadow-2.5d-sm border-4 border-h-green-light/20">
                    <div className="space-y-3">
                      {PASS_REWARDS.map(r => (
                        <div key={r.lv} className="flex items-center gap-4 p-3 bg-h-milk/40 rounded-[2rem] border-2 border-h-milk/50">
                          <div className="w-12 h-12 bg-h-brown-deep/10 rounded-[1rem] flex items-center justify-center font-black text-h-brown-soft text-lg italic shadow-inner">Lv.{r.lv}</div>
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="bg-h-milk/80 p-3 rounded-[1.5rem] text-base font-black text-h-brown-soft text-center shadow-2.5d-sm">
                              {r.free}
                            </div>
                            <div className="bg-purple-100/80 p-3 rounded-[1.5rem] text-base font-black text-purple-600 text-center border-2 border-purple-200 shadow-2.5d-sm">
                              {r.premium}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-2">
                  {products.map(item => (
                    <motion.div 
                      key={item.id} 
                      whileHover={{ y: -5, scale: 1.01 }}
                      className="bg-h-milk p-6 rounded-[3rem] border-4 border-h-green-light/30 shadow-2.5d-white flex flex-col items-center text-center relative overflow-hidden"
                    >
                      {item.tag && (
                        <div className="absolute top-4 right-[-35px] bg-h-orange-warm text-h-milk px-10 py-0.5 rotate-45 font-black text-[9px] shadow-md uppercase tracking-widest border-2 border-h-milk">
                          {item.tag}
                        </div>
                      )}
                      <div className="text-6xl mb-6 drop-shadow-xl animate-float">{item.icon}</div>
                      <h3 className="font-black text-3xl text-h-text mb-1 tracking-tight">
                        {item.amount.toLocaleString()} <span className="text-xl opacity-60 ml-1">{iapTab === 'GOLD' ? '골드' : '다이아'}</span>
                      </h3>
                      <p className="text-[10px] font-black text-h-brown-soft opacity-40 mb-8 uppercase tracking-[0.3em]">
                        {iapTab === 'GOLD' ? '골드 패키지' : '다이아몬드 패키지'}
                      </p>
                      <motion.button 
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95, y: 8 }}
                        className={`w-full py-4 rounded-[2rem] font-black text-xl shadow-2.5d-md border-4 border-h-milk flex items-center justify-center gap-2 active:shadow-none transition-all duration-75 ${iapTab === 'GOLD' ? 'bg-h-yellow-base text-h-brown-deep shadow-2.5d-yellow' : 'bg-h-sky-base text-h-milk shadow-2.5d-blue'}`}
                      >
                        {item.price}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer (Compressed) */}
            <div className="p-6 bg-h-milk/20 flex justify-center border-t-2 border-h-brown-soft/5 shrink-0">
               <div className="flex items-center gap-3 text-h-brown-soft/50 font-black text-[10px] uppercase tracking-[0.3em]">
                  <Sparkles size={14} />
                  <span>구매 즉시 지급됩니다</span>
                  <Heart size={14} fill="currentColor" />
                  <span>행복한 목장 생활!</span>
                  <Sparkles size={14} />
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, label, icon }) => (
  <motion.button 
    whileTap={{ scale: 0.96 }}
    onClick={onClick} 
    className={`flex-1 py-5 rounded-[3rem] font-black text-xl flex items-center justify-center gap-3 transition-all ${active ? 'bg-h-milk shadow-2.5d-sm text-h-text' : 'text-h-brown-soft opacity-50'}`}
  >
    <span className="text-2xl drop-shadow-sm">{icon}</span> 
    <span className="tracking-tight">{label}</span>
  </motion.button>
);

export default IAPModal;
