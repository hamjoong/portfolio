'use client';

import React, { useEffect, useState, use } from 'react';
import { orderService } from '@/services/order.service';
import { Button } from '@/components/common/Button';
import { useRouter } from 'next/navigation';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 특정 주문의 상세 정보를 보여주는 페이지입니다.
 */
export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderService.getOrder(id);
        if (response.success) {
          setOrder(response.data);
        }
      } catch (err) {
        console.error('[OrderDetail] Fetch failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (isLoading) return <div className="p-20 text-center">로딩 중...</div>;
  if (!order) return <div className="p-20 text-center">주문 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">주문 상세 내역</h1>
      
      <div className="bg-white rounded-2xl border p-8 space-y-6 shadow-sm">
        <div className="flex justify-between items-center border-b pb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">주문 번호</p>
            <p className="font-mono font-bold text-lg">{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">주문 일시</p>
            <p className="font-bold">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold">결제 정보</h2>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">결제 상태</span>
            <span className="font-bold text-blue-600">{order.status}</span>
          </div>
          <div className="flex justify-between py-2 border-t pt-4">
            <span className="text-lg font-bold">최종 결제 금액</span>
            <span className="text-2xl font-black text-blue-600">{order.totalAmount.toLocaleString()}원</span>
          </div>
        </div>

        <div className="pt-8 flex gap-4">
          <Button variant="outline" className="flex-1" onClick={() => router.push('/orders/me')}>
            목록으로
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => router.push('/')}>
            메인으로
          </Button>
        </div>
      </div>
    </div>
  );
}
