'use client';

import React, { useEffect, useState } from 'react';
import { ProductResponse } from '@/types/product';
import { ProductCard } from '@/components/common/ProductCard';
import { ArrowLeft, Trash2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * 최근 본 상품 페이지 컴포넌트입니다.
 * [이유] 사용자가 최근에 관심을 가졌던 상품들을 다시 쉽게 찾아볼 수 있도록
 * 로컬 스토리지에 저장된 데이터를 시각화하여 제공합니다.
 */
export default function RecentViewedPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponse[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentViewedProducts');
    if (saved) {
      setProducts(JSON.parse(saved));
    }
  }, []);

  const clearRecent = () => {
    if (confirm('최근 본 상품 내역을 모두 삭제하시겠습니까?')) {
      localStorage.removeItem('recentViewedProducts');
      setProducts([]);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-10">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors"
          >
            <ArrowLeft size={20} />
            돌아가기
          </button>
          
          {products.length > 0 && (
            <button 
              onClick={clearRecent}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold text-sm transition-colors"
            >
              <Trash2 size={18} />
              전체 삭제
            </button>
          )}
        </div>

        <div className="mb-12">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Clock size={32} className="text-blue-600" />
            최근 본 상품
          </h1>
          <p className="text-gray-500 font-medium mt-2">최근 10개까지의 상품이 보관됩니다.</p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
            <Clock size={64} className="mx-auto text-gray-100 mb-6" />
            <p className="text-gray-400 font-bold text-xl">최근 본 상품이 없습니다.</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-6 text-blue-600 font-black hover:underline"
            >
              쇼핑하러 가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
