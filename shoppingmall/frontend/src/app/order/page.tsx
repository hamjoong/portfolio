'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useUser } from '@/hooks/useUser';
import { useOrder } from '@/hooks/useOrder';
import { useCart } from '@/hooks/useCart';
import { productService } from '@/services/product.service';
import { ProductResponse, ProductOptionResponse } from '@/types/product';
import { MapPin, List } from 'lucide-react';
import { Button } from '@/components/common/Button';
import Image from 'next/image';

function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedItemsParam = searchParams.get('items') || '';
  const selectedCartItems = useMemo(
    () => selectedItemsParam ? selectedItemsParam.split(',') : [],
    [selectedItemsParam],
  );

  const directProductId = searchParams.get('productId');
  const directQuantity = Number(searchParams.get('quantity') || 1);
  const directOptionId = searchParams.get('optionId');

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
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

  const [guest, setGuest] = useState({ email: '', lookupPassword: '' });

  type OrderedItem = {
    cartItemId: string;
    product: ProductResponse;
    options: ProductOptionResponse[];
    quantity: number;
    price: number;
  };

  const [orderedItems, setOrderedItems] = useState<OrderedItem[]>([]);

  // 1. 주문 데이터 로드
  useEffect(() => {
    const fetchOrderedItems = async () => {
      if (directProductId) {
        try {
          const product = await productService.getProduct(directProductId);
          const optionIds = directOptionId ? directOptionId.split(',') : [];
          const options = optionIds.length > 0 && product.options
            ? product.options.filter(o => optionIds.includes(String(o.id)))
            : [];
          const additionalPriceTotal = options.reduce((sum, o) => sum + Number(o.additionalPrice || 0), 0);
          const price = product.price + additionalPriceTotal;

          setOrderedItems([{
            cartItemId: directOptionId ? `${directProductId}:${directOptionId}` : directProductId,
            product,
            options,
            quantity: directQuantity,
            price,
          }]);
        } catch (e) {
          console.error('Failed to fetch direct buy product', e);
        }
        return;
      }

      if (cartData && selectedCartItems.length > 0) {
        const itemPromises = selectedCartItems.map(async (cartItemId) => {
          try {
            const [productId, optionIdsStr] = cartItemId.split(':');
            const quantity = cartData[cartItemId] || 0;
            const product = await productService.getProduct(productId);
            const optionIds = optionIdsStr ? optionIdsStr.split(',') : [];
            const options = optionIds.length > 0 && product.options
              ? product.options.filter(o => optionIds.includes(String(o.id)))
              : [];
            const additionalPriceTotal = options.reduce((sum, o) => sum + Number(o.additionalPrice || 0), 0);
            const price = product.price + additionalPriceTotal;
            
            return { cartItemId, product, options, quantity, price };
          } catch (e) {
            console.error(`Failed to fetch product for cart item ${cartItemId}`, e);
            return null;
          }
        });
        const results = await Promise.all(itemPromises);
        setOrderedItems(results.filter((item): item is OrderedItem => item !== null));
      }
    };
    fetchOrderedItems();
  }, [cartData, selectedCartItems, directProductId, directQuantity, directOptionId]);

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
    if (!orderInfo.receiverName || !orderInfo.phone || !orderInfo.address) {
      alert('배송 정보(성함, 연락처, 주소)를 모두 입력해주세요.');
      return;
    }
    if (orderedItems.length === 0) {
      alert('주문할 상품이 없습니다.');
      return;
    }
    if (!isLoggedIn && (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(guest.email) || guest.lookupPassword.length < 6)) {
      alert('비회원 주문에는 이메일과 6자 이상의 조회 비밀번호가 필요합니다.');
      return;
    }

    // 선택한 모든 상품을 한 번에 주문한다.
    const items = orderedItems.map((item) => {
      const [, optionIdsStr] = item.cartItemId.split(':');
      return { productId: item.product.id, quantity: item.quantity, optionId: optionIdsStr || undefined };
    });

    createOrderMutation.mutate({
      ...orderInfo,
      items,
      ...(!isLoggedIn && { guestEmail: guest.email.trim(), guestLookupPassword: guest.lookupPassword }),
    }, {
      onSuccess: ({ orderNo }) => {
        if (isLoggedIn) {
          alert('주문이 완료되었습니다. (모의 결제: 실제 결제는 이루어지지 않았습니다.)');
          router.push('/mypage');
        } else {
          alert(`주문이 완료되었습니다. 주문번호 ${orderNo}를 꼭 기록해 두세요. 주문 조회에 필요합니다.`);
          router.push(`/orders/lookup?orderNo=${encodeURIComponent(orderNo)}`);
        }
      },
      onError: (error: any) => {
        const errorMsg = error.response?.data?.message || error.message || '주문 처리 중 오류가 발생했습니다.';
        alert(`주문 실패: ${errorMsg}`);
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

          {!isLoggedIn && (
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold mb-2">비회원 주문 조회 정보</h2>
              <p className="text-sm text-gray-500 mb-6">주문 후 주문번호, 이메일, 조회 비밀번호로 주문을 확인할 수 있습니다. 주문 후 90일이 지나면 배송 정보가 삭제됩니다.</p>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  value={guest.email}
                  onChange={(e) => setGuest(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="이메일"
                  autoComplete="email"
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl font-bold"
                />
                <input
                  type="password"
                  value={guest.lookupPassword}
                  onChange={(e) => setGuest(prev => ({ ...prev, lookupPassword: e.target.value }))}
                  placeholder="조회 비밀번호 (6자 이상)"
                  autoComplete="new-password"
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl font-bold"
                />
              </div>
            </section>
          )}

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
                    {item.options.length > 0 && (
                      <div className="text-xs text-gray-500 space-y-0.5">
                        {item.options.map(opt => (
                          <p key={opt.id}>{opt.optionType}: {opt.optionName} {opt.additionalPrice > 0 ? `(+${opt.additionalPrice.toLocaleString()}원)` : ''}</p>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{item.quantity}개 / {item.price.toLocaleString()}원</p>
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
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">포트폴리오용 모의 결제입니다. 실제 결제나 청구는 이루어지지 않습니다.</p>
            <Button
              onClick={handleOrder}
              disabled={createOrderMutation.isPending || orderedItems.length === 0}
              className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-lg font-black rounded-2xl transition-all shadow-xl shadow-blue-600/30"
            >
              {createOrderMutation.isPending ? '처리 중...' : '모의 결제하기'}
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
