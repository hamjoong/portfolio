'use client';

import React, { useEffect, useState } from 'react';
import { orderService } from '@/services/order.service';
import { ArrowLeft, MapPin, Truck, Package, CheckCircle, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ShippingPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getMyOrders();
        if (response.success) {
          setOrders(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'PAID': return 2;
      case 'SHIPPING': return 3;
      case 'DELIVERED': return 4;
      default: return 1;
    }
  };

  const steps = [
    { label: '결제대기', icon: <Search size={20} /> },
    { label: '상품준비중', icon: <Package size={20} /> },
    { label: '배송중', icon: <Truck size={20} /> },
    { label: '배송완료', icon: <CheckCircle size={20} /> },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          돌아가기
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Truck size={32} className="text-blue-600" />
            배송 현황 관리
          </h1>
          <p className="text-gray-500 font-medium mt-2">주문하신 상품의 현재 위치와 배송 상태를 확인하실 수 있습니다.</p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-400 font-bold">로딩 중...</div>
        ) : orders.length > 0 ? (
          <div className="space-y-8">
            {orders.map((order) => {
              const currentStep = getStatusStep(order.status);
              return (
                <div key={order.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
                    <div>
                      <div className="text-xs font-black text-gray-400 uppercase tracking-tighter mb-1">Order Number</div>
                      <div className="text-sm font-bold text-gray-900">{order.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-gray-400 uppercase tracking-tighter mb-1">Order Date</div>
                      <div className="text-sm font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="p-8 md:p-12">
                    {/* 배송 단계 프로세스 바 */}
                    <div className="relative mb-12">
                      <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-0" />
                      <div 
                        className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-1000 -z-0" 
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                      />
                      
                      <div className="flex justify-between relative z-10">
                        {steps.map((step, idx) => {
                          const isCompleted = idx + 1 <= currentStep;
                          const isCurrent = idx + 1 === currentStep;
                          return (
                            <div key={idx} className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                                isCompleted ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-2 border-gray-100 text-gray-300'
                              } ${isCurrent ? 'scale-125 ring-4 ring-blue-50' : ''}`}>
                                {step.icon}
                              </div>
                              <span className={`text-[10px] md:text-xs font-black mt-3 transition-colors ${isCompleted ? 'text-blue-600' : 'text-gray-400'}`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                      <div className="space-y-4">
                        <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                          <MapPin size={16} className="text-blue-600" />
                          배송지 정보
                        </h4>
                        <div className="bg-gray-50 rounded-2xl p-5 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-400 font-bold">수령인</span>
                            <span className="text-xs text-gray-900 font-bold">{order.receiverName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-400 font-bold">연락처</span>
                            <span className="text-xs text-gray-900 font-bold">{order.phone}</span>
                          </div>
                          <div className="pt-2 border-t border-gray-100 mt-2">
                            <span className="text-[10px] text-gray-400 font-black block mb-1 uppercase">Address</span>
                            <p className="text-xs text-gray-700 font-medium leading-relaxed">
                              {order.address}<br />{order.detailAddress}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                          <Truck size={16} className="text-blue-600" />
                          배송 메시지
                        </h4>
                        <div className="bg-gray-50 rounded-2xl p-5 flex items-center justify-center min-h-[100px]">
                          <p className="text-xs text-gray-400 font-bold italic">&quot;부재 시 문 앞에 놓아주세요.&quot;</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
            <Package size={64} className="mx-auto text-gray-100 mb-6" />
            <p className="text-gray-400 font-bold text-xl">배송 진행 중인 상품이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
