'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Truck, ShieldCheck, RotateCcw, Minus, Plus } from 'lucide-react';
import { ProductResponse, ProductOptionResponse } from '@/types/product';

interface ProductInfoProps {
  product: ProductResponse;
  quantity: number;
  setQuantity: (q: number) => void;
  onAddToCart: (selectedOption?: ProductOptionResponse) => void;
  onBuyNow: (selectedOption?: ProductOptionResponse) => void;
  reviewCount: number;
}

export function ProductInfo({ product, quantity, setQuantity, onAddToCart, onBuyNow, reviewCount }: ProductInfoProps) {
  const [selectedOption, setSelectedOption] = useState<ProductOptionResponse | null>(null);
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity < 10;

  const handleAddToCart = () => {
    if (product.options.length > 0 && !selectedOption) {
      alert('옵션을 선택해주세요.');
      return;
    }
    onAddToCart(selectedOption || undefined);
  };

  const handleBuyNow = () => {
    if (product.options.length > 0 && !selectedOption) {
      alert('옵션을 선택해주세요.');
      return;
    }
    onBuyNow(selectedOption || undefined);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* 상품 이미지 */}
      <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm relative">
        <Image
          src={product.mainImageUrl || '/images/placeholder-product.png'}
          alt={product.name}
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* 주문 옵션 영역 */}
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-blue-600 font-bold text-sm mb-2">{product.categoryName}</p>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-0 leading-tight">
              {product.name}
            </h1>
            {isOutOfStock ? (
              <span className="bg-gray-100 text-gray-500 text-xs font-black px-3 py-1 rounded-full uppercase">품절</span>
            ) : isLowStock ? (
              <span className="bg-red-50 text-red-500 text-xs font-black px-3 py-1 rounded-full uppercase animate-pulse">품절임박</span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-700">4.8</span>
            <span className="text-sm text-gray-400">({reviewCount}개의 리뷰)</span>
          </div>
        </div>

        <div className="border-y border-gray-100 py-6">
          <div className="flex items-baseline gap-3 mb-4">
            <span className={`text-3xl font-black ${isOutOfStock ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              {(((product.price || 0) + (selectedOption?.additionalPrice || 0)) * quantity).toLocaleString()}원
            </span>
            {!isOutOfStock && <span className="text-sm text-green-600 font-bold mb-1">무료배송</span>}
          </div>
          
          <div className="space-y-3">
             {/* 옵션 선택 */}
             {product.options.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">옵션 선택</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={selectedOption?.id || ''}
                    onChange={(e) => {
                      const option = product.options.find(o => o.id === e.target.value);
                      setSelectedOption(option || null);
                    }}
                  >
                    <option value="">옵션을 선택하세요</option>
                    {product.options.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.optionType}: {option.optionName} (+{option.additionalPrice.toLocaleString()}원)
                      </option>
                    ))}
                  </select>
                </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="w-4 h-4" />
              <span>{!isOutOfStock ? '내일(수) 도착 보장' : '재입고 알림 신청 가능'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ShieldCheck className="w-4 h-4" />
              <span>정품 보장 / 공식 입점사</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RotateCcw className="w-4 h-4" />
              <span>7일 이내 무료 반품</span>
            </div>
          </div>
        </div>

        {/* 수량 선택 */}
        <div className={`flex flex-col gap-3 ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
          <span className="text-sm font-bold text-gray-700">수량 선택</span>
          <div className="flex items-center gap-4 w-fit bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={isOutOfStock}
              className="p-2 hover:bg-white rounded-md transition-colors shadow-sm disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-lg font-bold min-w-[20px] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stockQuantity || 1, quantity + 1))}
              disabled={isOutOfStock || quantity >= (product.stockQuantity || 0)}
              className="p-2 hover:bg-white rounded-md transition-colors shadow-sm disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 구매 버튼 */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 h-14 border-2 font-bold rounded-xl transition-colors ${
              isOutOfStock 
                ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                : 'border-blue-600 text-blue-600 hover:bg-blue-50'
            }`}
          >
            {isOutOfStock ? '품절' : '장바구니'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`flex-[2] h-14 font-bold rounded-xl transition-colors shadow-lg ${
              isOutOfStock 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            {isOutOfStock ? '상품 준비 중' : '바로 구매하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

