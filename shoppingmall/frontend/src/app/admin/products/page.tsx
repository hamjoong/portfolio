'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { ProductResponse } from '@/types/product';
import { Page } from '@/types/common';
import Image from 'next/image';
import { ShoppingBag, Box, Tag, Store, BarChart3 } from 'lucide-react';

/**
 * 어드민 전용 상품 리스트 관리 페이지입니다.
 * [기능] 재고 현황, 판매처 정보, 가격 등을 관리합니다.
 */
export default function AdminProductsPage() {
  const [productsPage, setProductsPage] = useState<Page<ProductResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const fetchedPage = await adminService.getAllProducts(0, 50);
        setProductsPage(fetchedPage);
      } catch (err: any) {
        setError(err.message || '상품 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 uppercase">Product Inventory</h1>
          <p className="text-gray-500 font-medium font-medium">서비스에 등록된 상품의 재고 및 정보를 관리합니다.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">상품정보 / 이미지</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">카테고리</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">판매처</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">가격</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">재고 현황</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {productsPage?.content.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50 shrink-0">
                            <Image src={product.mainImageUrl || '/placeholder.png'} alt={product.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-gray-900 mb-0.5 truncate">{product.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-tighter">
                                <Tag className="w-3 h-3" /> ID: {product.id.slice(0,8)}
                            </p>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase">
                        <Box className="w-3.5 h-3.5" /> {product.categoryName}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5 text-gray-600">
                        <Store className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-bold">{(product as any).vendor || 'Hjuk Official'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="text-sm font-black text-gray-900 tracking-tight">{product.price.toLocaleString()}원</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="inline-flex items-center gap-2">
                        <span className={`text-sm font-black tracking-tight ${product.stockQuantity < 10 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {product.stockQuantity.toLocaleString()} <span className="text-[10px] font-bold text-gray-400">ea</span>
                        </span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all ${product.stockQuantity < 10 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${Math.min(product.stockQuantity * 5, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {productsPage?.content.length === 0 && (
          <div className="p-20 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-100 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
