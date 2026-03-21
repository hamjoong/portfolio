'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useUser } from '@/hooks/useUser';
import { useOrder } from '@/hooks/useOrder';
import { useCart } from '@/hooks/useCart';
import { productService } from '@/services/product.service';
import { CreditCard, MapPin, CheckCircle2, List, Edit3, Home } from 'lucide-react';
import { Button } from '@/components/common/Button';
import Image from 'next/image';

function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const quantity = parseInt(searchParams.get('quantity') || '0');

  const { useProfile, useAddresses } = useUser();
  const { data: profile } = useProfile();
  const { data: addresses } = useAddresses();
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

  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'EASY'>('CARD');
  const [singleProduct, setSingleProduct] = useState<any>(null);
  const [cartProducts, setCartProducts] = useState<any[]>([]);
  const [addressMode, setAddressMode] = useState<'DEFAULT' | 'LIST' | 'MANUAL'>('DEFAULT');

  // 1. 주문 데이터 로드
  useEffect(() => {
    if (productId) {
      // 바로 구매 시 단일 상품 정보
      productService.getProduct(productId).then(setSingleProduct);
    } else if (cartData) {
      // 장바구니 전체 구매 시 상품 정보들 페칭
      const fetchCartProducts = async () => {
        const promises = Object.entries(cartData).map(async ([id, qty]) => {
          const product = await productService.getProduct(id);
          return { ...product, quantity: qty };
        });
        const results = await Promise.all(promises);
        setCartProducts(results);
      };
      fetchCartProducts();
    }
  }, [productId, cartData]);

  // 2. 배송지 선택 로직 개선 (불필요한 리렌더링 방지 및 수동 입력 보존)
  useEffect(() => {
    if (addressMode === 'DEFAULT' && profile) {
      setOrderInfo({
        receiverName: profile.fullName || '',
        phone: profile.phoneNumber || '',
        address: profile.address || '',
        detailAddress: profile.detailAddress || '',
      });
    }
  }, [addressMode, profile]);

  const handleInputChange = (field: string, value: string) => {
    let filteredValue = value;
    
    if (field === 'receiverName') {
      // 성함: 한글, 영문, 공백만 허용 (숫자 및 모든 특수문자 원천 차단)
      filteredValue = value.replace(/[^a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣\s]/g, '');
    } else if (field === 'phone') {
      // 연락처: 숫자만 허용 (최대 11자)
      filteredValue = value.replace(/[^0-9]/g, '');
      if (filteredValue.length > 11) filteredValue = filteredValue.slice(0, 11);
    } else if (field === 'address' || field === 'detailAddress') {
      // 주소: 한글, 영문, 숫자, 공백, 공통 특수문자(- , . ( )) 허용
      filteredValue = value.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s\-,\.\(\)]/g, '');
    }
    
    setOrderInfo(prev => ({
      ...prev,
      [field]: filteredValue
    }));
  };

  // 모드 변경 버튼 핸들러
  const changeAddressMode = (mode: 'DEFAULT' | 'LIST' | 'MANUAL') => {
    setAddressMode(mode);
    if (mode === 'MANUAL') {
      setOrderInfo({ receiverName: '', phone: '', address: '', detailAddress: '' });
    }
    // DEFAULT 모드일 때는 useEffect가 처리함
  };

  const handleSelectAddress = (addr: any) => {
    setOrderInfo({
      receiverName: addr.receiverName,
      phone: addr.phoneNumber,
      address: addr.baseAddress,
      detailAddress: addr.detailAddress,
    });
    setAddressMode('LIST');
  };

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
        router.push('/mypage');
      },
      onError: (error: any) => {
        alert(error.message || '주문 처리 중 오류가 발생했습니다.');
      }
    });
  };

  // 3. 결제 금액 계산
  const totalAmount = productId 
    ? (singleProduct ? singleProduct.price * quantity : 0)
    : cartProducts.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

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
              <div className="flex gap-2">
                <button 
                  onClick={() => changeAddressMode('DEFAULT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${addressMode === 'DEFAULT' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}
                >기본 주소</button>
                <button 
                  onClick={() => changeAddressMode('LIST')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${addressMode === 'LIST' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}
                >주소록</button>
                <button 
                  onClick={() => changeAddressMode('MANUAL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${addressMode === 'MANUAL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}
                >직접 입력</button>
              </div>
            </div>

            {/* 주소록 목록 (모드일 때만 노출) */}
            {addressMode === 'LIST' && (
              <div className="grid grid-cols-1 gap-3 mb-8">
                {addresses && addresses.length > 0 ? (
                  addresses.map((addr) => (
                    <div 
                      key={addr.id} 
                      onClick={() => handleSelectAddress(addr)}
                      className="p-4 rounded-2xl border-2 border-gray-50 hover:border-blue-200 cursor-pointer transition-all flex justify-between items-center group"
                    >
                      <div>
                        <p className="text-sm font-black text-gray-900">{addr.addressName}</p>
                        <p className="text-xs text-gray-500">{addr.baseAddress} {addr.detailAddress}</p>
                      </div>
                      <CheckCircle2 className="text-blue-600 opacity-0 group-hover:opacity-100 w-5 h-5" />
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-400 text-xs font-bold bg-gray-50 rounded-xl">등록된 주소록이 없습니다.</p>
                )}
              </div>
            )}
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Receiver</label>
                  <input
                    type="text"
                    value={orderInfo.receiverName}
                    onChange={(e) => handleInputChange('receiverName', e.target.value)}
                    placeholder="성함 (문자만)"
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact</label>
                  <input
                    type="text"
                    value={orderInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="연락처 (숫자만)"
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                    maxLength={11}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Shipping Address</label>
                <input
                  type="text"
                  value={orderInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="도로명 주소 (문자/숫자 가능)"
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold mb-2"
                />
                <input
                  type="text"
                  value={orderInfo.detailAddress}
                  onChange={(e) => handleInputChange('detailAddress', e.target.value)}
                  placeholder="상세 주소 (문자/숫자 가능)"
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                />
              </div>
            </div>
          </section>

          {/* 상품 정보 요약 */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <List className="w-6 h-6 text-blue-600" />
              주문 상품 정보
            </h2>
            <div className="space-y-4">
              {productId ? (
                singleProduct && (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden relative">
                      <Image src={singleProduct.mainImageUrl} alt={singleProduct.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{singleProduct.name}</p>
                      <p className="text-xs text-gray-500">{quantity}개 / {singleProduct.price?.toLocaleString()}원</p>
                    </div>
                  </div>
                )
              ) : (
                cartProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden relative">
                      <Image src={p.mainImageUrl} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{p.name}</p>
                      <p className="text-[10px] text-gray-500">{p.quantity}개 / {p.price?.toLocaleString()}원</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* 결제 요약 카드 */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-gray-900 text-white p-8 rounded-[40px] shadow-2xl shadow-blue-900/20">
            <h2 className="text-xl font-black mb-8 border-b border-gray-800 pb-4">Payment Summary</h2>
            <div className="space-y-5 mb-10">
              <div className="flex justify-between text-gray-400 font-bold">
                <span className="text-xs uppercase tracking-widest">Subtotal</span>
                <span className="text-white">{totalAmount.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-gray-400 font-bold">
                <span className="text-xs uppercase tracking-widest">Shipping</span>
                <span className="text-green-400">FREE</span>
              </div>
              <div className="pt-6 border-t border-gray-800 flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-tighter text-blue-400">Total Amount</span>
                <span className="text-3xl font-black">{totalAmount.toLocaleString()}원</span>
              </div>
            </div>
            <Button
              onClick={handleOrder}
              disabled={createOrderMutation.isPending}
              className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-lg font-black rounded-2xl transition-all shadow-xl shadow-blue-600/30"
            >
              {createOrderMutation.isPending ? '처리 중...' : '결제하기'}
            </Button>
            <p className="text-[10px] text-gray-500 mt-6 text-center leading-relaxed font-medium">
              위 주문 내용을 최종 확인하였으며,<br />결제 진행에 동의합니다.
            </p>
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
