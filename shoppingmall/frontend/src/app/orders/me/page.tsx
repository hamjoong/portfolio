'use client';

import React, { useEffect, useState } from 'react';
import { orderService } from '@/services/order.service';
import { Button } from '@/components/common/Button';
import { useRouter } from 'next/navigation';
import { MessageSquare, ChevronRight, Package } from 'lucide-react';

/**
 * 마이페이지 주문 내역 화면입니다.
 * [이유] 사용자가 과거에 주문한 내역과 현재 진행 상태를 
 * 한눈에 확인하고 관리할 수 있도록 하기 위함입니다.
 */
export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getMyOrders();
        console.log('[MyOrders] API Response:', response); // 디버깅용 로그
        if (response && Array.isArray(response)) {
          setOrders(response);
        }
      } catch (err) {
        console.error('[MyOrders] Failed to fetch orders:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (isLoading) return <div className="p-20 text-center text-gray-500">주문 내역 로딩 중...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">나의 주문 내역</h1>
        <Button variant="outline" size="sm" onClick={() => router.push('/')}>
          계속 쇼핑하기
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-20 text-center border-2 border-dashed">
          <p className="text-gray-400 mb-6 text-lg">아직 주문하신 내역이 없습니다.</p>
          <Button onClick={() => router.push('/')}>첫 주문하러 가기</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b">
                <div className="flex gap-4 items-center">
                  <span className="text-sm font-bold text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs text-gray-500 font-mono">주문번호: {order.id}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  order.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {order.status === 'PENDING' ? '결제대기' : '결제완료'}
                </span>
              </div>
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {order.orderItems?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <Package size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{item.productName}</p>
                        <p className="text-xs text-gray-500">{item.quantity}개 / {item.price.toLocaleString()}원</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-[10px] h-7 px-2 font-black"
                        onClick={() => router.push(`/mypage/qna/write?productId=${item.productId}`)}
                      >
                        상품 문의
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Amount</p>
                    <p className="text-xl font-black text-blue-600">
                      {order.totalAmount.toLocaleString()}원
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex gap-1"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    상세보기 <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
