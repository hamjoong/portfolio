import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Target, Sparkles, Zap, Shield, Crosshair } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import type { WeaponType, CowType } from '../types/game';
import { useUserStore } from '../store/useUserStore';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COW_TYPES = [
  { type: 'BASIC' as CowType, name: '얼룩소', price: 1000, icon: '🐄', rate: '1.5', desc: '가장 평범하고 친근한 젖소입니다.' },
  { type: 'JERSEY' as CowType, name: '저지소', price: 5000, icon: '🐂', rate: '2.5', desc: '풍부한 유지방의 우유를 생산합니다.' },
  { type: 'PREMIUM' as CowType, name: '홀스타인', price: 15000, icon: '🐃', rate: '4.0', desc: '최고급 품종으로 생산량이 뛰어납니다.' },
  { type: 'GOLDEN' as CowType, name: '황금소', price: 50000, icon: '🐄', rate: '8.0', desc: '전설 속의 소! 엄청난 속도로 우유를 생산합니다.' },
];

const WEAPON_TYPES = [
  { type: 'SLINGSHOT' as const, name: '나무 새총', price: 0, icon: <Zap size={40} />, desc: '기본적인 방어 도구입니다.' },
  { type: 'PISTOL' as const, name: '낡은 권총', price: 3000, icon: <Target size={40} />, desc: '더 빠른 사격이 가능합니다.' },
  { type: 'RIFLE' as const, name: '사냥용 소총', price: 10000, icon: <Crosshair size={40} />, desc: '강력한 위력으로 늑대를 쫓아냅니다.' },
  { type: 'SNIPER' as const, name: '최첨단 저격총', price: 30000, icon: <Shield size={40} />, desc: '늑대들의 저승사자입니다.' },
];

const AMMO_PRODUCTS = [
  { amount: 50, price: 500, name: '탄약 상자 (소)', icon: '📦' },
  { amount: 200, price: 1500, name: '탄약 상자 (대)', icon: '🎁' },
];

/** 
 * @function ShopModal
 * @description 젖소 입양, 무기 구매, 탄약 보충 등이 가능한 상점 모달 컴포넌트입니다.
 * @param {ShopModalProps} props - 모달 제어 props
 */
const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose }) => {
  const cows = useGameStore((state) => state.cows);
  const ownedWeapons = useGameStore((state) => state.ownedWeapons);
  const inventory = useGameStore((state) => state.inventory);
  const facilities = useGameStore((state) => state.facilities);
  const gameActions = useGameStore((state) => state.actions);
  
  const gold = useUserStore((state) => state.gold);
  const userActions = useUserStore((state) => state.actions);

  const handleBuyCow = (type: CowType, price: number) => {
    if (gold < price) return alert("골드가 부족합니다!");
    if (cows.length >= facilities.house.maxCows) return alert("목장이 꽉 찼습니다!");
    
    userActions.addGold(-price);
    const success = gameActions.buyCow(type);
    
    if (success) {
      alert(`${type === 'GOLDEN' ? '황금소' : '젖소'}를 입양했습니다!`);
    } else {
      userActions.addGold(price);
      alert("입양에 실패했습니다.");
    }
  };

  const handleBuyWeapon = (type: WeaponType, price: number) => {
    if (ownedWeapons.includes(type)) return;
    if (gold < price) return alert("골드가 부족합니다!");
    userActions.addGold(-price);
    gameActions.buyWeapon(type);
  };

  const handleBuyAmmo = (amount: number, price: number) => {
    if (gold < price) return alert("골드가 부족합니다!");
    userActions.addGold(-price);
    gameActions.buyAmmo(amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-h-brown-deep/60 backdrop-blur-md pointer-events-auto" />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: 50 }} 
            className="bg-h-cream w-full max-w-2xl h-[85vh] rounded-[5rem] shadow-2.5d-lg pointer-events-auto relative z-10 border-4 border-h-milk flex flex-col overflow-hidden text-h-text font-game"
          >
            <div className="p-10 pb-8 flex justify-between items-center bg-h-milk/40 border-b-4 border-h-brown-soft/10">
              <div className="flex items-center gap-6">
                <div className="bg-h-green-base p-4 rounded-[2.5rem] text-h-milk shadow-2.5d-green border-4 border-h-milk"><ShoppingBag size={42} strokeWidth={3} /></div>
                <div>
                  <h2 className="text-5xl font-black tracking-tight">상점</h2>
                  <p className="text-sm font-black text-h-brown-soft uppercase tracking-[0.3em] mt-1 ml-1 opacity-70">상점</p>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="bg-h-milk/80 p-5 rounded-3xl text-h-brown-soft shadow-2.5d-white border-2 border-h-brown-soft/10 transition-all"><X size={32} strokeWidth={3} /></motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
              {/* Cow Section */}
              <section>
                <div className="flex items-center gap-4 mb-6 ml-4"><div className="w-3 h-8 bg-h-orange-warm rounded-full" /><h3 className="text-3xl font-black text-h-brown-deep">젖소 입양</h3></div>
                <div className="space-y-6">
                  {COW_TYPES.map((item) => (
                    <ShopItem key={item.type} icon={<span className={`text-5xl ${item.type === 'GOLDEN' ? 'brightness-110 saturate-150' : ''}`}>{item.icon}</span>} title={item.name} desc={`${item.desc} (생산 속도: ${item.rate}x)`} price={item.price} onClick={() => handleBuyCow(item.type, item.price)} color={item.type === 'GOLDEN' ? 'bg-yellow-400/20' : 'bg-h-orange-warm/10'} isGolden={item.type === 'GOLDEN'} currentGold={gold} />
                  ))}
                </div>
              </section>

              {/* Weapon Section */}
              <section>
                <div className="flex items-center gap-4 mb-6 ml-4"><div className="w-3 h-8 bg-red-400 rounded-full" /><h3 className="text-3xl font-black text-h-brown-deep">방어 장비</h3></div>
                <div className="space-y-6">
                  {WEAPON_TYPES.map((w) => (
                    <ShopItem key={w.type} icon={w.icon} title={w.name} desc={w.desc} price={w.price} onClick={() => handleBuyWeapon(w.type, w.price)} isOwned={ownedWeapons.includes(w.type)} color="bg-red-400/10" currentGold={gold} />
                  ))}
                </div>
              </section>

              {/* Ammo Section */}
              <section>
                <div className="flex items-center gap-4 mb-6 ml-4"><div className="w-3 h-8 bg-h-sky-base rounded-full" /><h3 className="text-3xl font-black text-h-brown-deep">탄약 보충</h3></div>
                <div className="space-y-6">
                  {AMMO_PRODUCTS.map((a, i) => (
                    <ShopItem key={i} icon={<span className="text-5xl">{a.icon}</span>} title={a.name} desc={`${a.amount}발 즉시 충전 (보유: ${inventory.ammo}발)`} price={a.price} onClick={() => handleBuyAmmo(a.amount, a.price)} color="bg-h-sky-base/10" currentGold={gold} />
                  ))}
                </div>
              </section>
            </div>

            <div className="p-8 bg-h-milk/20 flex justify-center border-t-4 border-h-brown-soft/5">
               <div className="flex items-center gap-3 text-h-brown-soft/40 font-black text-sm uppercase tracking-widest"><Sparkles size={16} /><span>최고의 장비로 목장을 안전하게 보호하세요</span><Sparkles size={16} /></div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface ShopItemProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  price: number;
  onClick: () => void;
  isOwned?: boolean;
  color: string;
  isGolden?: boolean;
  currentGold: number;
}

const ShopItem: React.FC<ShopItemProps> = React.memo(({ icon, title, desc, price, onClick, isOwned, color, isGolden, currentGold }) => {
  const canAfford = currentGold >= price;
  const isDisabled = isOwned || !canAfford;

  return (
    <motion.div 
      whileHover={!isDisabled ? { x: 10, scale: 1.02 } : {}}
      className={`flex items-center gap-6 p-6 rounded-[3.5rem] border-4 transition-all ${isOwned ? 'opacity-70 bg-h-milk shadow-2.5d-white border-h-green-light/30' : !canAfford ? 'bg-gray-100 border-gray-200' : `bg-h-milk shadow-2.5d-white hover:bg-h-milk/80 ${isGolden ? 'border-yellow-400 shadow-2.5d-yellow' : 'border-h-green-light/30'}`}`}
    >
      <div className={`${color} p-5 rounded-[2rem] border-2 border-h-milk shadow-inner relative flex items-center justify-center shrink-0 ${!canAfford && !isOwned ? 'grayscale opacity-50' : ''}`}>
        {icon}
        {isGolden && <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full" />}
      </div>
      <div className="flex-1 min-w-0 py-1">
        <h3 className={`font-black text-2xl tracking-tight mb-1 break-keep ${isGolden ? 'text-yellow-600' : 'text-h-text'} ${!canAfford && !isOwned ? 'opacity-50' : ''}`}>{title}</h3>
        <p className="text-sm font-black text-h-brown-soft opacity-60 break-keep leading-tight">{desc}</p>
      </div>
      <div className="shrink-0 ml-auto">
        <motion.button 
          whileHover={!isDisabled ? { scale: 1.05, y: -4 } : {}}
          whileTap={!isDisabled ? { scale: 0.95, y: 4 } : {}}
          onClick={onClick} 
          disabled={isDisabled} 
          className={`px-8 py-4 rounded-[2.2rem] font-black text-xl flex items-center gap-2 transition-all duration-75 ${isOwned ? 'bg-h-green-base text-h-milk shadow-2.5d-green' : !canAfford ? 'bg-h-brown-soft/20 text-h-brown-soft opacity-50 cursor-not-allowed' : 'bg-h-yellow-base text-h-brown-deep shadow-2.5d-yellow border-4 border-h-milk active:shadow-none'}`}
        >
          {isOwned ? <span>보유 중</span> : <><span className="text-2xl">🪙</span><span>{price.toLocaleString()}</span></>}
        </motion.button>
      </div>
    </motion.div>
  );
});

export default ShopModal;
