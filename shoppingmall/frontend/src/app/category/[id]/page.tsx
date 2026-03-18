'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { productService } from '@/services/product.service';
import { ProductResponse } from '@/types/product';
import { Page } from '@/types/common';
import ProductCard from '@/components/product/ProductCard';
import { LayoutGrid, List as ListIcon, SlidersHorizontal, Package } from 'lucide-react';

/**
 * 특정 카테고리의 상품 목록을 보여주는 페이지입니다.
 * [이유] 사용자가 선택한 카테고리에 해당하는 상품들만 필터링하여 
 * 효율적인 쇼핑 경험을 제공하기 위함입니다.
 */
function CategoryProductList() {
  const params = useParams();
  const categoryId = Number(params.id);
  
  // State type changed to handle Page<ProductResponse>
  const [productsPage, setProductsPage] = useState<Page<ProductResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // 정렬 및 필터 상태
  const [sort, setSort] = useState('createdAt,desc');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null); // Reset error on new fetch
      try {
        // productService.getProductsByCategory returns Page<ProductResponse>
        const data: Page<ProductResponse> = await productService.getProductsByCategory(
          categoryId, 
          0, // Start with page 0
          20, // Default size
          sort,
          minPrice,
          maxPrice
        );
        setProductsPage(data); // Set the entire Page object
      } catch (err: any) {
        console.error('Failed to fetch category products:', err);
        setError(err.message || '상품 정보를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    if (categoryId) fetchProducts();
  }, [categoryId, sort, minPrice, maxPrice]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
  };

  const applyPriceFilter = (min?: number, max?: number) => {
    setMinPrice(min);
    setMaxPrice(max);
    setIsFilterOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Top filter and sort bar (Muinsa/Naver Reference) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">카테고리 상품</h1>
          <p className="text-sm text-gray-400 font-bold">총 {productsPage?.totalElements ?? 0}개의 상품이 있습니다.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
            >
              <ListIcon size={18} />
            </button>
          </div>
          
          <div className="h-8 w-px bg-gray-200 mx-2" />
          
          <select 
            className="bg-transparent text-sm font-bold text-gray-600 outline-none cursor-pointer"
            value={sort}
            onChange={handleSortChange}
          >
            <option value="createdAt,desc">최신순</option>
            <option value="price,asc">낮은가격순</option>
            <option value="price,desc">높은가격순</option>
            <option value="stockQuantity,desc">인기순</option>
          </select>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all ${
                isFilterOpen || minPrice !== undefined || maxPrice !== undefined ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal size={16} />
              필터 {(minPrice !== undefined || maxPrice !== undefined) && '•'}
            </button>

            {/* Filter Layer */}
            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white shadow-2xl border border-gray-100 rounded-2xl p-6 z-50 animate-in fade-in slide-in-from-top-2">
                <h4 className="text-sm font-black text-gray-900 mb-4">가격 범위</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="최소" 
                      className="w-full bg-gray-50 border-none rounded-lg p-2 text-sm"
                      onBlur={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                      defaultValue={minPrice !== undefined ? minPrice : ''}
                    />
                    <span className="text-gray-300">~</span>
                    <input 
                      type="number" 
                      placeholder="최대" 
                      className="w-full bg-gray-50 border-none rounded-lg p-2 text-sm"
                      onBlur={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                      defaultValue={maxPrice !== undefined ? maxPrice : ''}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setMinPrice(undefined);
                        setMaxPrice(undefined);
                        setIsFilterOpen(false); // Close filter after resetting
                        applyPriceFilter(undefined, undefined); // Trigger re-fetch
                      }}
                      className="flex-1 text-xs font-bold text-gray-400 py-2"
                    >
                      초기화
                    </button>
                    <button 
                      onClick={() => {
                        setIsFilterOpen(false);
                        applyPriceFilter(minPrice, maxPrice); // Trigger re-fetch with current filter values
                      }}
                      className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 rounded-lg"
                    >
                      적용하기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 상품 그리드 */}
      {isLoading ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10" 
          : "flex flex-col gap-6"
        }>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[3/4] rounded-2xl mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : productsPage && productsPage.content.length > 0 ? ( // Check if productsPage and its content exist
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10" 
          : "flex flex-col gap-6"
        }>
          {productsPage.content.map((product) => ( // Use productsPage.content
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-40">
          <Package size={64} className="mx-auto text-gray-100 mb-4" />
          <p className="text-gray-400 font-bold text-xl">이 카테고리에는 아직 상품이 없습니다.</p>
          <p className="text-gray-300 mt-2">다른 카테고리를 확인해보세요!</p>
        </div>
      )}
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">로딩 중...</div>}>
      <CategoryProductList />
    </Suspense>
  );
}
