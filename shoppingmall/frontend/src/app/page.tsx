'use client';

import React, { useEffect, Suspense } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { productService } from '@/services/product.service';
import { useQuery } from '@tanstack/react-query';
import { useSearch } from '@/hooks/useSearch';
import { useSearchParams } from 'next/navigation';
import { Sparkles, TrendingUp } from 'lucide-react';

/**
 * 실제 메인 컨텐츠 컴포넌트입니다.
 * [이유] useSearchParams를 사용하므로 Suspense 래핑이 필수입니다.
 */
function HomeContent() {
  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';

  // 1. 전체 상품 조회 (검색어 여부에 따라 API 전환)
  const { data: productPage, isLoading, refetch } = useQuery({
    queryKey: ['products', searchKeyword],
    queryFn: () => searchKeyword 
      ? productService.searchProducts(searchKeyword).then(data => ({ content: data, totalElements: data.length }))
      : productService.getProducts(0, 20),
  });

  // 검색어가 바뀔 때마다 스크롤을 상단으로 올림
  useEffect(() => {
    if (searchKeyword) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      refetch();
    }
  }, [searchKeyword, refetch]);

  // 2. 인기 검색어 조회
  const { usePopularKeywords } = useSearch('');
  const { data: popularKeywords } = usePopularKeywords();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="h-[300px] md:h-[400px] bg-gray-200 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {/* 히어로 배너 */}
      <section className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center px-8 md:px-16">
        <div className="relative z-10 max-w-lg text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            가장 앞선 쇼핑 경험,<br />Hjuk Shopping Mall
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            실시간 검색과 빠른 배송으로 완성되는<br />당신만의 라이프스타일 큐레이션.
          </p>
          <button 
            onClick={() => document.getElementById('recommended-products')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg"
          >
            지금 둘러보기
          </button>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20 hidden md:block">
          <Sparkles className="w-96 h-96" />
        </div>
      </section>

      {/* 검색 결과 제목 (검색 시에만 노출) */}
      {searchKeyword && (
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <h2 className="text-xl font-bold text-blue-900">
            &apos;<span className="text-blue-600">{searchKeyword}</span>&apos; 검색 결과
          </h2>
          <p className="text-blue-400 text-sm font-medium mt-1">총 {productPage?.totalElements || 0}개의 상품을 찾았습니다.</p>
        </div>
      )}

      {/* 인기 검색어 트렌드 */}
      {popularKeywords && popularKeywords.length > 0 && (
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-gray-900">지금 뜨는 키워드</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularKeywords.map((keyword, index) => (
              <span
                key={keyword}
                className="px-4 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-full border border-gray-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-all"
              >
                <span className="text-blue-500 mr-1">{index + 1}</span> {keyword}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 상품 목록 */}
      <section id="recommended-products">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{searchKeyword ? '검색 결과' : '추천 상품'}</h2>
          <p className="text-gray-500 text-sm">전체 {productPage?.totalElements || 0}개</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {productPage?.content && productPage.content.length > 0 ? (
            productPage.content.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-gray-400 font-bold">
              해당하는 상품이 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/**
 * 쇼핑몰의 메인 페이지입니다.
 */
export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold">쇼핑몰을 불러오는 중...</div>}>
      <HomeContent />
    </Suspense>
  );
}
