'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useOrder } from '@/hooks/useOrder';
import { useCart } from '@/hooks/useCart';
import { productService } from '@/services/product.service';
import { ProductResponse, ProductOptionResponse } from '@/types/product';
import { MapPin, List, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import Image from 'next/image';

function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCartItems = searchParams.get('items')?.split(',') || [];

  const { useProfile } = useUser();
  const { data: profile } = useProfile();
  const { useGetCart } = useCart();
  const { data: cartData } = useGetCart();
  const { useCreateOrder } = useOrder();
  const createOrderMutation = useCreateOrder();

  const [orderInfo, setOrderInfo] = useState({
    receiverName: '',
    phone: '',
    address: '',
    detailAddress: '',
  });

  type OrderedItem = {
    cartItemId: string;
    product: ProductResponse;
    option: ProductOptionResponse | null;
    quantity: number;
    price: number;
  };

  const [orderedItems, setOrderedItems] = useState<OrderedItem[]>([]);

  // 1. 주문 데이터 로드
  useEffect(() => {
    if (cartData && selectedCartItems.length > 0) {
      const fetchSelectedItems = async () => {
        const itemPromises = selectedCartItems.map(async (cartItemId) => {
          try {
            const [productId, optionId] = cartItemId.split(':');
            const quantity = cartData[cartItemId] || 0;
            const product = await productService.getProduct(productId);
            const option = optionId ? product.options.find(o => o.id === optionId) || null : null;
            const price = product.price + (option?.additionalPrice || 0);
            
            return { cartItemId, product, option, quantity, price };
          } catch (e) {
            console.error(`Failed to fetch product for cart item ${cartItemId}`, e);
            return null;
          }
        });
        const results = await Promise.all(itemPromises);
        setOrderedItems(results.filter((item): item is OrderedItem => item !== null));
      };
      fetchSelectedItems();
    }
  }, [cartData, selectedCartItems]);

  // 2. 초기 기본 배송지 설정
  useEffect(() => {
    if (profile) {
      setOrderInfo({
        receiverName: profile.fullName || '',
        phone: profile.phoneNumber || '',
        address: profile.address || '',
        detailAddress: profile.detailAddress || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setOrderInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleOrder = () => {
    if (!orderInfo.receiverName || !orderInfo.address) {
      alert('배송 정보를 모두 입력해주세요.');
      return;
    }

    createOrderMutation.mutate({
      ...orderInfo,
      cartItemIds: selectedCartItems,
    }, {
      onSuccess: () => {
        alert('주문이 성공적으로 완료되었습니다!');
        router.push('/mypage');
      },
      onError: (error: any) => {
        alert(error.message || '주문 처리 중 오류가 발생했습니다.');
      }
    });
  };

  // 3. 결제 금액 계산
  const totalAmount = orderedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10 py-10">
      <h1 className="text-4xl font-black text-gray-900 tracking-tight">주문 / 결제</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* 배송지 정보 섹션 */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold">배송지 정보</h2>
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={orderInfo.receiverName}
                  onChange={(e) => handleInputChange('receiverName', e.target.value)}
                  placeholder="성함"
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl font-bold"
                />
                <input
                  type="text"
                  value={orderInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="연락처"
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl font-bold"
                />
              </div>
              <input
                type="text"
                value={orderInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="도로명 주소"
                className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl font-bold"
              />
              <input
                type="text"
                value={orderInfo.detailAddress}
                onChange={(e) => handleInputChange('detailAddress', e.target.value)}
                placeholder="상세 주소"
                className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl font-bold"
              />
            </div>
          </section>

          {/* 상품 정보 요약 */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <List className="w-6 h-6 text-blue-600" />
              주문 상품 정보
            </h2>
            <div className="space-y-4">
              {orderedItems.map((item) => (
                <div key={item.cartItemId} className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden relative">
                    <Image src={item.product.mainImageUrl} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{item.product.name}</p>
                    {item.option && <p className="text-xs text-gray-500">옵션: {item.option.optionName} (+{item.option.additionalPrice.toLocaleString()}원)</p>}
                    <p className="text-xs text-gray-500">{item.quantity}개 / {item.price.toLocaleString()}원</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 결제 요약 카드 */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-gray-900 text-white p-8 rounded-[40px] shadow-2xl shadow-blue-900/20">
            <h2 className="text-xl font-black mb-8 border-b border-gray-800 pb-4">Payment Summary</h2>
            <div className="space-y-5 mb-10">
              <div className="flex justify-between text-gray-400 font-bold">
                <span className="text-xs uppercase tracking-widest">Total Amount</span>
                <span className="text-3xl font-black text-white">{totalAmount.toLocaleString()}원</span>
              </div>
            </div>
            <Button
              onClick={handleOrder}
              disabled={createOrderMutation.isPending}
              className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-lg font-black rounded-2xl transition-all shadow-xl shadow-blue-600/30"
            >
              {createOrderMutation.isPending ? '처리 중...' : '결제하기'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold">로딩 중...</div>}>
      <OrderContent />
    </Suspense>
  );
}
