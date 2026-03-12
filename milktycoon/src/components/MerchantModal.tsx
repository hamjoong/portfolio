import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { PRODUCT_CONFIG } from '../types/game';
import type { ProductType } from '../types/game';
import { useUserStore } from '../store/useUserStore';
import { useUIStore } from '../store/useUIStore';
import { X, Coins, ShoppingCart } from 'lucide-react';
import { MerchantProductItem } from './MerchantComponents';

/** 
 * @function MerchantModal
 * @description 목장에 방문한 상인과 거래(제품 판매)를 진행하는 모달 컴포넌트입니다.
 * 오늘의 시세를 확인하고 인벤토리의 제품을 일괄 판매하여 골드를 획득할 수 있습니다.
 */
const MerchantModal: React.FC = () => {
  const { isMerchantOpen, actions: uiActions } = useUIStore();
  const { inventory, merchantRates, actions: gameActions } = useGameStore();
  const { actions: userActions } = useUserStore();

  const [quantities, setQuantities] = useState<Record<string, number>>({
    milk: 0, yogurt: 0, butter: 0, cheese: 0, cream: 0, iceCream: 0, goldenCheese: 0
  });

  if (!isMerchantOpen) return null;

  const handleSell = () => {
    let totalGold = 0;
    Object.entries(quantities).forEach(([type, amount]) => {
      if (amount > 0) {
        const price = merchantRates[type];
        const earned = gameActions.sellProduct(type.toUpperCase(), amount, price);
        totalGold += earned;
      }
    });

    if (totalGold > 0) {
      userActions.addGold(totalGold);
      // Reset quantities
      setQuantities({
        milk: 0, yogurt: 0, butter: 0, cheese: 0, cream: 0, iceCream: 0, goldenCheese: 0
      });
      // Merchant leaves once after transaction is complete
      gameActions.dismissMerchant();
      uiActions.closeMerchant();
    }
  };

  const updateQuantity = (type: string, delta: number) => {
    const currentInv = inventory[type as keyof typeof inventory] as number;
    setQuantities(prev => ({
      ...prev,
      [type]: Math.max(0, Math.min(currentInv, prev[type] + delta))
    }));
  };

  const setMaxQuantity = (type: string) => {
    const currentInv = inventory[type as keyof typeof inventory] as number;
    setQuantities(prev => ({ ...prev, [type]: currentInv }));
  };

  const products = [
    { id: 'milk', label: '우유', icon: '🥛', color: 'bg-blue-100' },
    { id: 'yogurt', label: '요구르트', icon: '🥛', color: 'bg-green-100' },
    { id: 'butter', label: '버터', icon: '🧈', color: 'bg-yellow-100' },
    { id: 'cheese', label: '치즈', icon: '🧀', color: 'bg-orange-100' },
    { id: 'cream', label: '생크림', icon: '🍦', color: 'bg-pink-100' },
    { id: 'iceCream', label: '아이스크림', icon: '🍨', color: 'bg-purple-100' },
    { id: 'goldenCheese', label: '황금 치즈', icon: '🏆', color: 'bg-amber-200' },
  ];

  const calculateTotal = () => {
    return Object.entries(quantities).reduce((acc, [type, amount]) => {
      return acc + (amount * merchantRates[type]);
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border-4 border-[#706233]"
      >
        <div className="bg-[#706233] p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black">유제품 수집 상인</h2>
              <p className="text-xs opacity-80">오늘의 시세로 신선한 제품을 판매하세요!</p>
            </div>
          </div>
          <button onClick={uiActions.closeMerchant} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-4">
            {products.map((product) => {
              const currentInv = inventory[product.id as keyof typeof inventory] as number;
              const price = merchantRates[product.id];
              const basePrice = product.id === 'milk' ? 10 : PRODUCT_CONFIG[product.id.toUpperCase() as ProductType]?.basePrice || 10;

              return (
                <MerchantProductItem 
                  key={product.id}
                  product={product}
                  currentInv={currentInv}
                  price={price}
                  basePrice={basePrice}
                  quantity={quantities[product.id]}
                  onUpdateQuantity={(delta) => updateQuantity(product.id, delta)}
                  onSetQuantity={(val) => setQuantities(prev => ({ ...prev, [product.id]: val }))}
                  onSetMaxQuantity={() => setMaxQuantity(product.id)}
                />
              );
            })}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t-2 border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold">총 판매 예상 금액</p>
            <div className="flex items-center gap-2">
              <Coins className="text-amber-500" size={24} />
              <span className="text-2xl font-black text-[#706233]">{calculateTotal().toLocaleString()}</span>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSell}
            disabled={calculateTotal() === 0}
            className={`px-8 py-3 rounded-2xl font-black text-lg shadow-lg transition-all ${
              calculateTotal() > 0 
                ? 'bg-[#9ADE7B] text-[#435334] hover:bg-[#86cf61]' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
            }`}
          >
            판매하기
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default MerchantModal;
