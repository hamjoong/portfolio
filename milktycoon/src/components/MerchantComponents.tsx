import React from 'react';
import { Coins, TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';

interface MerchantProductItemProps {
  product: {
    id: string;
    label: string;
    icon: string;
    color: string;
  };
  currentInv: number;
  price: number;
  basePrice: number;
  quantity: number;
  onUpdateQuantity: (delta: number) => void;
  onSetQuantity: (val: number) => void;
  onSetMaxQuantity: () => void;
}

/** 
 * @function MerchantProductItem
 * @description 상인 모달 내에서 개별 제품의 판매량 조절 및 시세를 표시하는 아이템 컴포넌트입니다.
 * @param {MerchantProductItemProps} props - 제품 정보 및 수량 변경 핸들러
 */
export const MerchantProductItem: React.FC<MerchantProductItemProps> = React.memo(({
  product, currentInv, price, basePrice, quantity, onUpdateQuantity, onSetQuantity, onSetMaxQuantity
}) => {
  const isHigh = price >= basePrice;

  return (
    <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100 flex items-center gap-4 group hover:border-[#B4D4FF] transition-all">
      <div className={`w-16 h-16 ${product.color} rounded-2xl flex items-center justify-center text-3xl shadow-inner`}>
        {product.icon}
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-black text-gray-800">{product.label}</h3>
          <div className="flex items-center gap-1">
            <Coins size={14} className="text-amber-500" />
            <span className={`font-black ${isHigh ? 'text-green-600' : 'text-red-500'}`}>
              {price.toLocaleString()}
            </span>
            {isHigh ? <TrendingUp size={14} className="text-green-600" /> : <TrendingDown size={14} className="text-red-500" />}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mb-2">보유량: <span className="font-bold text-gray-700">{currentInv.toLocaleString()}</span></div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
            <button 
              onClick={() => onUpdateQuantity(-1)}
              className="px-2 py-1 hover:bg-gray-100 text-gray-600"
            >
              <Minus size={16} />
            </button>
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                onSetQuantity(Math.max(0, Math.min(currentInv, val)));
              }}
              className="w-16 text-center font-bold text-sm outline-none"
            />
            <button 
              onClick={() => onUpdateQuantity(1)}
              className="px-2 py-1 hover:bg-gray-100 text-gray-600"
            >
              <Plus size={16} />
            </button>
          </div>
          <button 
            onClick={onSetMaxQuantity}
            className="text-[10px] font-bold bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 transition-colors"
          >
            MAX
          </button>
          <div className="ml-auto text-sm font-black text-amber-600">
            +{(quantity * price).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
});
