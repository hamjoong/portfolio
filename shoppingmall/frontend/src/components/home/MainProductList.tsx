'use client';

import React from 'react';
import ProductCard from '@/components/product/ProductCard';

interface MainProductListProps {
  products: any[];
  totalElements: number;
  title: string;
}

export const MainProductList: React.FC<MainProductListProps> = ({ products, totalElements, title }) => {
  return (
    <section id="recommended-products">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-500 text-sm">전체 {totalElements || 0}개</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {products && products.length > 0 ? (
          products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-gray-400 font-bold">
            해당하는 상품이 없습니다.
          </div>
        )}
      </div>
    </section>
  );
};
