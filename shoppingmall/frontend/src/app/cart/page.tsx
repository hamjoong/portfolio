'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { productService } from '@/services/product.service';
import { ProductResponse, ProductOptionResponse } from '@/types/product';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { useGetCart, useAddToCart, useRemoveItem } = useCart();
  const { data: cartData, isLoading: isCartLoading } = useGetCart();
  const removeMutation = useRemoveItem();
  const addMutation = useAddToCart();

  type CartItem = {
    cartItemId: string;
    product: ProductResponse;
    option: ProductOptionResponse | null;
    quantity: number;
    price: number;
  };

  const [cartProducts, setCartProducts] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!cartData || Object.keys(cartData).length === 0) {
        setCartProducts([]);
        setIsDataLoading(false);
        return;
      }
      
      setIsDataLoading(true);
      try {
        const itemPromises = Object.entries(cartData).map(async ([cartItemId, quantity]) => {
          try {
            const [productId, optionId] = cartItemId.split(':');
            const product = await productService.getProduct(productId);
            
            const option = optionId && product.options 
                ? product.options.find(o => String(o.id) === String(optionId)) || null 
                : null;
            
            const price = Number(product.price) + Number(option?.additionalPrice || 0);
            
            return { cartItemId, product, option, quantity, price };
          } catch (e) {
            console.error(`Failed to fetch product for cart item ${cartItemId}`, e);
            return null;
          }
        });
        const results = await Promise.all(itemPromises);
        const products = results.filter((item): item is CartItem => item !== null);
        setCartProducts(products);
        setSelectedItems(new Set(products.map(p => p.cartItemId)));
      } catch (error) {
        console.error('Failed to fetch cart products', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchProductDetails();
  }, [cartData]);

  const totalPrice = cartProducts
    .filter(item => selectedItems.has(item.cartItemId))
    .reduce((acc, curr) => {
      const basePrice = Number(curr.product.price) || 0;
      const optionPrice = Number(curr.option?.additionalPrice) || 0;
      const itemPrice = basePrice + optionPrice;
      return acc + (itemPrice * curr.quantity);
    }, 0);

  const toggleItemSelection = (cartItemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(cartItemId)) {
      newSelected.delete(cartItemId);
    } else {
      newSelected.add(cartItemId);
    }
    setSelectedItems(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedItems.size === cartProducts.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartProducts.map(p => p.cartItemId)));
    }
  };

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      alert("구매할 상품을 선택해주세요.");
      return;
    }
    // Pass selected items to order page
    router.push(`/order?items=${Array.from(selectedItems).join(',')}`);
  };

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
      
      <div className="flex items-center gap-2 mb-2">
        <input 
          type="checkbox" 
          checked={selectedItems.size === cartProducts.length && cartProducts.length > 0}
          onChange={toggleAllSelection}
          className="w-5 h-5"
        />
        <label>전체 선택</label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cartProducts.map(({ cartItemId, product, option, quantity }) => (
            <div key={cartItemId} className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4 items-center shadow-sm">
              <input 
                type="checkbox" 
                checked={selectedItems.has(cartItemId)}
                onChange={() => toggleItemSelection(cartItemId)}
                className="w-5 h-5"
              />
              <Link href={`/product/${product.id}`} className="shrink-0 relative w-24 h-24">
                <Image 
                  src={product.mainImageUrl || 'https://loremflickr.com/200/200/product?lock=' + product.id}
                  alt={product.name} 
                  fill
                  className="object-cover rounded-xl bg-gray-50" 
                />
              </Link>
              
              <div className="flex-1 min-w-0">
                <Link href={`/product/${product.id}`} className="text-sm font-bold text-gray-900 hover:text-blue-600 truncate block mb-1">
                  {product.name}
                </Link>
                {option && (
                    <p className="text-xs text-gray-500 mb-1">옵션: {option.optionName} (+{option.additionalPrice.toLocaleString()}원)</p>
                )}
                <p className="text-lg font-black text-gray-900 mb-3">
                  {((product.price + (option?.additionalPrice || 0)) * quantity).toLocaleString()}원
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg border border-gray-100">
                    <button 
                      onClick={() => addMutation.mutate({ productId: product.id, optionId: option?.id, quantity: -1 })}
                      disabled={quantity <= 1}
                      className="p-1 hover:bg-white rounded text-gray-500 disabled:opacity-30"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                    <button 
                      onClick={() => addMutation.mutate({ productId: product.id, optionId: option?.id, quantity: 1 })}
                      className="p-1 hover:bg-white rounded text-gray-500"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeMutation.mutate(cartItemId)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50">
            <h2 className="text-xl font-bold text-gray-900 mb-6">주문 요약</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500">
                <span>선택 상품 금액 ({selectedItems.size}개)</span>
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
              onClick={handleCheckout}
              className="w-full h-14 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-100"
            >
              선택 상품 주문하기
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
