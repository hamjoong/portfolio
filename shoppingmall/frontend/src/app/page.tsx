'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { useSearch } from '@/hooks/useSearch';
import { HeroBanner } from '@/components/home/HeroBanner';
import { PopularKeywordsTrend } from '@/components/home/PopularKeywordsTrend';
import { MainProductList } from '@/components/home/MainProductList';

function HomeContent() {
  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';

  const { data: productPage, isLoading, refetch } = useQuery({
    queryKey: ['products', searchKeyword],
    queryFn: () => searchKeyword 
      ? productService.searchProducts(searchKeyword).then(data => ({ content: data, totalElements: data.length }))
      : productService.getProducts(0, 20),
  });

  useEffect(() => {
    if (searchKeyword) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      refetch();
    }
  }, [searchKeyword, refetch]);

  const { usePopularKeywords } = useSearch('');
  const { data: popularKeywords } = usePopularKeywords();

  if (isLoading) return <HomeSkeleton />;

  return (
    <div className="flex flex-col gap-12">
      <HeroBanner onExploreClick={() => document.getElementById('recommended-products')?.scrollIntoView({ behavior: 'smooth' })} />

      {searchKeyword && (
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <h2 className="text-xl font-bold text-blue-900">
            &apos;<span className="text-blue-600">{searchKeyword}</span>&apos; 검색 결과
          </h2>
          <p className="text-blue-400 text-sm font-medium mt-1">총 {productPage?.totalElements || 0}개의 상품을 찾았습니다.</p>
        </div>
      )}

      <PopularKeywordsTrend keywords={popularKeywords || []} />

      <MainProductList 
        products={productPage?.content || []} 
        totalElements={productPage?.totalElements || 0} 
        title={searchKeyword ? '검색 결과' : '추천 상품'} 
      />
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-12 animate-pulse">
      <div className="h-[300px] md:h-[400px] bg-gray-100 rounded-3xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[3/4] bg-gray-50 rounded-2xl" />
            <div className="h-4 bg-gray-50 rounded w-3/4" />
            <div className="h-4 bg-gray-50 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
