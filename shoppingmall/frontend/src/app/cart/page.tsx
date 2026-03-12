'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { productService } from '@/services/product.service';
import { ProductResponse } from '@/types/product';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

/**
 * 장바구니 페이지입니다.
 * [이유] 사용자가 담은 상품의 정보를 한눈에 확인하고,
 * 최종 구매 결정을 내리기 전 수량 조절 및 삭제를 용이하게 하기 위함입니다.
 */
export default function CartPage() {
  const router = useRouter();
  const { useGetCart, useAddToCart, useRemoveItem } = useCart();
  const { data: cartData, isLoading: isCartLoading } = useGetCart();
  const removeMutation = useRemoveItem();
  const addMutation = useAddToCart();

  const [cartProducts, setCartProducts] = useState<({ product: ProductResponse; quantity: number })[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // 1. 장바구니 ID 목록을 기반으로 실제 상품 상세 정보 페칭
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!cartData || Object.keys(cartData).length === 0) {
        setCartProducts([]);
        setIsDataLoading(false);
        return;
      }
      
      setIsDataLoading(true);
      try {
        const productPromises = Object.entries(cartData).map(async ([productId, quantity]) => {
          try {
            const product = await productService.getProduct(productId);
            return { product, quantity };
          } catch (e) {
            console.error(`Failed to fetch product ${productId}`, e);
            return null;
          }
        });
        const results = await Promise.all(productPromises);
        // null이 아닌 유효한 상품만 필터링
        setCartProducts(results.filter((item): item is { product: ProductResponse; quantity: number } => item !== null));
      } catch (error) {
        console.error('Failed to fetch cart products', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchProductDetails();
  }, [cartData]);

  const totalPrice = cartProducts.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);

  if (isCartLoading || isDataLoading) {
    return <div className="h-96 flex items-center justify-center">장바구니를 불러오는 중...</div>;
  }

  if (cartProducts.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="p-6 bg-gray-100 rounded-full text-gray-400">
          <ShoppingBag className="w-16 h-16" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">장바구니가 비어있습니다</h2>
          <p className="text-gray-500">Hjuk Shopping Mall의 멋진 상품들을 담아보세요!</p>
        </div>
        <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <h1 className="text-3xl font-black text-gray-900">장바구니</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 상품 리스트 영역 */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cartProducts.map(({ product, quantity }) => (
            <div key={product.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4 items-center shadow-sm">
              <Link href={`/product/${product.id}`} className="shrink-0 relative w-24 h-24">
                <Image 
                  src={product.mainImageUrl || 'https://picsum.photos/200/200'} 
                  alt={product.name} 
                  fill
                  className="object-cover rounded-xl bg-gray-50" 
                />
              </Link>
              
              <div className="flex-1 min-w-0">
                <Link href={`/product/${product.id}`} className="text-sm font-bold text-gray-900 hover:text-blue-600 truncate block mb-1">
                  {product.name}
                </Link>
                <p className="text-lg font-black text-gray-900 mb-3">
                  {product.price.toLocaleString()}원
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg border border-gray-100">
                    <button 
                      onClick={() => addMutation.mutate({ productId: product.id, quantity: -1 })}
                      disabled={quantity <= 1}
                      className="p-1 hover:bg-white rounded text-gray-500 disabled:opacity-30"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                    <button 
                      onClick={() => addMutation.mutate({ productId: product.id, quantity: 1 })}
                      className="p-1 hover:bg-white rounded text-gray-500"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeMutation.mutate(product.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 결제 요약 영역 */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50">
            <h2 className="text-xl font-bold text-gray-900 mb-6">주문 요약</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500">
                <span>총 상품 금액</span>
                <span className="text-gray-900 font-medium">{totalPrice.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>배송비</span>
                <span className="text-green-600 font-bold text-sm uppercase">Free</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                <span className="font-bold text-gray-900">결제 예정 금액</span>
                <span className="text-2xl font-black text-blue-600">{totalPrice.toLocaleString()}원</span>
              </div>
            </div>

            <button 
              onClick={() => router.push('/order')}
              className="w-full h-14 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-100"
            >
              주문하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center text-[11px] text-gray-400 mt-4 leading-relaxed">
              장바구니에 담긴 상품은 최대 7일간 보관됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
