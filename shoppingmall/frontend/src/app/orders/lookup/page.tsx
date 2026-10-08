'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { orderService } from '@/services/order.service';
import { Button } from '@/components/common/Button';
import type { OrderResponse } from '@/types/order';

const STATUS_LABEL: Record<OrderResponse['status'], string> = {
  PENDING: '결제 대기',
  PAID: '결제 완료 (모의)',
  SHIPPED: '배송 중',
  COMPLETED: '배송 완료',
  CANCELLED: '취소됨',
};

/**
 * 비회원 주문 조회 화면입니다.
 * 주문번호 + 주문 시 입력한 이메일 + 조회 비밀번호가 모두 맞아야 조회됩니다.
 */
function LookupContent() {
  const searchParams = useSearchParams();
  const [orderNo, setOrderNo] = useState(searchParams.get('orderNo') ?? '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    setOrder(null);
    try {
      setOrder(await orderService.lookupGuestOrder(orderNo.trim(), email.trim(), password));
    } catch (err: any) {
      setError(err.response?.data?.message || '주문을 조회하지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 flex flex-col gap-8">
      <h1 className="text-3xl font-black text-gray-900">비회원 주문 조회</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
        <input
          value={orderNo}
          onChange={(e) => setOrderNo(e.target.value)}
          placeholder="주문번호 (예: ORD-20261007-AB12CD34)"
          className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl font-bold"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="주문 시 입력한 이메일"
          autoComplete="email"
          className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl font-bold"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="조회 비밀번호"
          autoComplete="current-password"
          className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl font-bold"
          required
        />
        <Button type="submit" disabled={isLoading} className="h-12 font-black">
          {isLoading ? '조회 중...' : '주문 조회'}
        </Button>
        {error && <p role="alert" className="text-sm font-bold text-red-600">{error}</p>}
      </form>

      {order && (
        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-bold">{order.orderNo}</p>
              <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('ko-KR')}</p>
            </div>
            <span className="text-sm font-black text-blue-600">{STATUS_LABEL[order.status] ?? order.status}</span>
          </div>
          <ul className="flex flex-col gap-2 border-y border-gray-50 py-4">
            {order.orderItems.map((item, index) => (
              <li key={`${item.productId}-${index}`} className="flex justify-between text-sm">
                <span className="font-bold text-gray-900">{item.productName} × {item.quantity}</span>
                <span className="text-gray-600">{(item.price * item.quantity).toLocaleString()}원</span>
              </li>
            ))}
          </ul>
          <p className="text-right font-black text-lg">합계 {order.totalAmount.toLocaleString()}원</p>
          <p className="text-sm text-gray-500">
            {order.receiverName} · {order.phone}<br />
            {order.address} {order.detailAddress}
          </p>
        </section>
      )}
    </div>
  );
}

export default function GuestOrderLookupPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold">로딩 중...</div>}>
      <LookupContent />
    </Suspense>
  );
}
