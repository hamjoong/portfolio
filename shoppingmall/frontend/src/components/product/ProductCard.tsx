'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
}

/**
 * 상품 목록에서 개별 상품을 표시하는 카드 컴포넌트입니다.
 * [이유] 재사용 가능한 UI 컴포넌트로 분리하여 관리 효율성을 높이고
 * 공통적인 호버 효과 및 레이아웃을 적용하기 위함입니다.
 */
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { useAddToCart } = useCart();
  const addToCartMutation = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // 부모 Link 클릭 이벤트 방지
    addToCartMutation.mutate({ productId: product.id, quantity: 1 });
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
              {product.category?.name || '기타'}
            </span>
          </div>
          
          {/* 호버 시 나타나는 액션 버튼 */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button 
              onClick={handleAddToCart}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 hover:bg-blue-600 hover:text-white transition-colors shadow-lg"
              title="장바구니 담기"
            >
              <ShoppingCart size={18} />
            </button>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors shadow-lg">
              <Eye size={18} />
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-500 text-xs line-clamp-2 mb-3 h-8 leading-relaxed">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-black text-gray-900">
              {product.price?.toLocaleString()}원
            </span>
            {product.stockQuantity < 10 && (
              <span className="text-[10px] font-bold text-red-500">품절임박</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
