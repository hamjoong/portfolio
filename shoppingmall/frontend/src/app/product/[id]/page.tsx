'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { useCart } from '@/hooks/useCart';
import { useReview } from '@/hooks/useReview';
import { Star, ShieldCheck, Truck, RotateCcw, Plus, Minus } from 'lucide-react';

/**
 * 상품 상세 페이지입니다.
 * [이유] 상품의 상세 정보, 리뷰, Q&A를 종합적으로 보여주고
 * 즉시 장바구니에 담거나 주문할 수 있는 기능을 제공하기 위함입니다.
 */
export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  // 1. 상품 정보 조회
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id as string),
    enabled: !!id,
  });

  // 2. 장바구니 및 리뷰 훅
  const { useAddToCart } = useCart();
  const addToCartMutation = useAddToCart();
  const { useProductReviews } = useReview();
  const { data: reviews } = useProductReviews(id as string);

  const handleAddToCart = () => {
    addToCartMutation.mutate({ productId: id as string, quantity }, {
      onSuccess: () => {
        if (confirm('장바구니에 담겼습니다. 장바구니로 이동할까요?')) {
          router.push('/cart');
        }
      }
    });
  };

  if (isLoading || !product) {
    return <div className="h-screen flex items-center justify-center">상품 정보를 불러오는 중...</div>;
  }

  return (
    <div className="flex flex-col gap-12 max-w-6xl mx-auto">
      {/* 상단: 이미지 및 기본 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* 상품 이미지 */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm relative">
          <Image
            src={product.mainImageUrl || 'https://picsum.photos/800/800?random=' + product.id}
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
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">4.8</span>
              <span className="text-sm text-gray-400">({reviews?.length || 0}개의 리뷰)</span>
            </div>
          </div>

          <div className="border-y border-gray-100 py-6">
            <div className="flex items-end gap-2 mb-4">
              <span className="text-3xl font-black text-gray-900">{product.price.toLocaleString()}원</span>
              <span className="text-sm text-green-600 font-bold mb-1">무료배송</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="w-4 h-4" />
                <span>내일(수) 도착 보장</span>
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
          <div className="flex flex-col gap-3">
            <span className="text-sm font-bold text-gray-700">수량 선택</span>
            <div className="flex items-center gap-4 w-fit bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-white rounded-md transition-colors shadow-sm"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-bold min-w-[20px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-white rounded-md transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 구매 버튼 */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 h-14 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors"
            >
              장바구니
            </button>
            <button
              onClick={() => router.push(`/order?productId=${product.id}&quantity=${quantity}`)}
              className="flex-[2] h-14 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              바로 구매하기
            </button>
          </div>
        </div>
      </div>

      {/* 상세 설명 및 리뷰 탭 (간략화) */}
      <div className="border-t border-gray-100 pt-12">
        <h2 className="text-2xl font-bold mb-8">상품 상세 정보</h2>
        <div className="prose max-w-none text-gray-600">
          <p className="whitespace-pre-wrap">{product.description}</p>
        </div>
      </div>
    </div>
  );
}
