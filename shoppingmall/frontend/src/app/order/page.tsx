'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useUser } from '@/hooks/useUser';
import { useOrder } from '@/hooks/useOrder';
import { useCart } from '@/hooks/useCart';
import { productService } from '@/services/product.service';
import { CreditCard, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';

/**
 * 주문서 작성 및 결제 페이지입니다.
 * [이유] 회원/비회원의 배송 정보를 입력받고, 
 * 낙관적 락(Optimistic Lock) 기반의 안전한 주문 생성을 수행하기 위함입니다.
 */
export default function OrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const quantity = parseInt(searchParams.get('quantity') || '0');

  const { isLoggedIn, isGuest } = useAuthStore();
  const { useProfile, useAddresses } = useUser();
  const { data: profile } = useProfile();
  const { data: addresses } = useAddresses();
  const { useCreateOrder } = useOrder();
  const createOrderMutation = useCreateOrder();

  const [orderInfo, setOrderInfo] = useState({
    receiverName: '',
    phone: '',
    address: '',
    detailAddress: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'EASY'>('CARD');
  const [product, setProduct] = useState<any>(null);

  // 1. 상품 정보 조회 (바로 구매 시)
  useEffect(() => {
    if (productId) {
      productService.getProduct(productId).then(setProduct);
    }
  }, [productId]);

  // 2. 기본 배송 정보 자동 채우기
  useEffect(() => {
    if (profile) {
      setOrderInfo({
        receiverName: profile.fullName || '',
        phone: profile.phoneNumber || '',
        address: profile.address || '',
        detailAddress: profile.detailAddress || '',
      });
    } else if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setOrderInfo({
        receiverName: defaultAddr.receiverName,
        phone: defaultAddr.phoneNumber,
        address: defaultAddr.baseAddress,
        detailAddress: defaultAddr.detailAddress,
      });
    }
  }, [profile, addresses]);

  const handleOrder = () => {
    if (!orderInfo.receiverName || !orderInfo.address) {
      alert('배송 정보를 모두 입력해주세요.');
      return;
    }

    createOrderMutation.mutate({
      ...orderInfo,
      productId: productId || undefined,
      quantity: quantity || undefined,
    }, {
      onSuccess: () => {
        alert('주문이 성공적으로 완료되었습니다!');
        // 성공 페이지가 없으므로 메인으로 이동 (404 방지)
        router.push('/');
      },
      onError: (error: any) => {
        alert(error.message || '주문 처리 중 오류가 발생했습니다.');
      }
    });
  };

  const totalPrice = product ? product.price * quantity : 0;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <h1 className="text-3xl font-black text-gray-900">주문 / 결제</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 왼쪽: 정보 입력 */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* 배송지 정보 */}
          <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold">배송지 정보</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">받는 사람</label>
                <input
                  type="text"
                  value={orderInfo.receiverName}
                  onChange={(e) => setOrderInfo({ ...orderInfo, receiverName: e.target.value })}
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">연락처</label>
                <input
                  type="text"
                  value={orderInfo.phone}
                  onChange={(e) => setOrderInfo({ ...orderInfo, phone: e.target.value })}
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">배송 주소</label>
                <input
                  type="text"
                  value={orderInfo.address}
                  onChange={(e) => setOrderInfo({ ...orderInfo, address: e.target.value })}
                  placeholder="기본 주소"
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all mb-2"
                />
                <input
                  type="text"
                  value={orderInfo.detailAddress}
                  onChange={(e) => setOrderInfo({ ...orderInfo, detailAddress: e.target.value })}
                  placeholder="상세 주소"
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* 결제 수단 */}
          <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold">결제 수단</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setPaymentMethod('CARD')}
                className={`h-14 border-2 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                  paymentMethod === 'CARD' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'
                }`}
              >
                {paymentMethod === 'CARD' && <CheckCircle2 className="w-5 h-5" />}
                신용카드
              </button>
              <button 
                onClick={() => setPaymentMethod('EASY')}
                className={`h-14 border-2 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                  paymentMethod === 'EASY' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'
                }`}
              >
                {paymentMethod === 'EASY' && <CheckCircle2 className="w-5 h-5" />}
                간편 결제
              </button>
            </div>
          </section>
        </div>

        {/* 오른쪽: 최종 결제 금액 및 버튼 */}
        <div className="md:col-span-1">
          <div className="sticky top-24 bg-gray-900 text-white p-6 rounded-2xl shadow-xl shadow-gray-200">
            <h2 className="text-lg font-bold mb-6">결제 요약</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-400">
                <span>주문 상품</span>
                <span className="text-white">{totalPrice.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>배송비</span>
                <span className="text-white">0원</span>
              </div>
              <div className="border-t border-gray-800 pt-4 flex justify-between items-end">
                <span className="font-bold">최종 결제 금액</span>
                <span className="text-2xl font-black text-blue-400">{totalPrice.toLocaleString()}원</span>
              </div>
            </div>
            <button
              onClick={handleOrder}
              disabled={createOrderMutation.isPending}
              className="w-full h-14 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-900/20"
            >
              {createOrderMutation.isPending ? '처리 중...' : '결제하기'}
            </button>
            <p className="text-[10px] text-gray-500 mt-4 text-center">
              위 주문 내용을 확인하였으며 결제에 동의합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
