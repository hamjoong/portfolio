'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductResponse } from '@/types/product';

interface ProductCardProps {
  product: ProductResponse;
}

/**
 * 상품 정보를 요약해서 보여주는 카드 컴포넌트입니다.
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formattedPrice = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(product.price);

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          <Image
            src={product.mainImageUrl || '/img/placeholder.png'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.stockQuantity === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-bold px-3 py-1 border-2 border-white rounded-md">
                품절
              </span>
            </div>
          )}
        </div>

        {/* 상품 정보 영역 */}
        <div className="p-4 space-y-1">
          <p className="text-xs text-gray-500 font-medium">{product.categoryName}</p>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[40px]">
            {product.name}
          </h3>
          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-bold text-blue-600">{formattedPrice}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
