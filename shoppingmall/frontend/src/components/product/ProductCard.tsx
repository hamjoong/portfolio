'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductResponse } from '@/types/product';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: ProductResponse;
}

/**
 * 상품 정보를 보여주는 카드 컴포넌트입니다.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const { useAddToCart } = useCart();
  const addToCartMutation = useAddToCart();

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCartMutation.mutate({ productId: product.id, quantity: 1 }, {
      onSuccess: () => alert(`${product.name} 상품이 장바구니에 담겼습니다.`)
    });
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.mainImageUrl || 'https://picsum.photos/seed/' + product.id + '/400/400'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2">
            <span className="bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded text-gray-700 uppercase">
              {product.categoryName || 'General'}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 h-10 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-gray-600">4.5</span>
          <span className="text-[10px] text-gray-400">(120)</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-gray-900">
            {product.price.toLocaleString()}원
          </p>
          <button 
            onClick={handleCartClick}
            className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
