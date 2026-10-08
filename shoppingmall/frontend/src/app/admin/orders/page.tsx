'use client';

import React, { useEffect, useState } from 'react';
import {
  adminProductsApi,
  AdminOrderResponse,
  AdminOrderStatus,
} from '@/utils/adminProductsApi';
import { Page } from '@/types/common';

const orderStatuses: AdminOrderStatus[] = [
  'PENDING',
  'PAID',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
];

const statusLabels: Record<AdminOrderStatus, string> = {
  PENDING: '결제 대기',
  PAID: '결제 완료',
  SHIPPED: '배송 중',
  COMPLETED: '배송 완료',
  CANCELLED: '취소',
};

export default function AdminOrdersPage() {
  const [ordersPage, setOrdersPage] = useState<Page<AdminOrderResponse> | null>(null);
  const [pendingStatuses, setPendingStatuses] = useState<Record<string, AdminOrderStatus>>({});
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      setOrdersPage(null);
      try {
        const result = await adminProductsApi.getOrders(page, 20);
        if (active) setOrdersPage(result);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : '주문 정보를 불러오지 못했습니다.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchOrders();
    return () => { active = false; };
  }, [page]);

  const saveStatus = async (order: AdminOrderResponse) => {
    const status = pendingStatuses[order.id];
    if (!status || status === order.status) return;

    setUpdatingOrderId(order.id);
    setError(null);
    try {
      await adminProductsApi.updateOrderStatus(order.id, status);
      setOrdersPage((current) => current && ({
        ...current,
        content: current.content.map((item) => item.id === order.id ? { ...item, status } : item),
      }));
      setPendingStatuses((current) => {
        const next = { ...current };
        delete next[order.id];
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문 상태를 변경하지 못했습니다.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="mb-2 text-4xl font-black tracking-tighter text-gray-900">주문 관리</h1>
        <p className="font-medium text-gray-500">신규 Auth 주문을 조회하고 주문 처리 상태를 변경합니다.</p>
      </header>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {ordersPage?.content.map((order) => {
              const selectedStatus = pendingStatuses[order.id] ?? order.status;
              return (
                <article key={order.id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                        {order.orderNo} · {new Date(order.createdAt).toLocaleString()}
                      </p>
                      <h2 className="text-lg font-black text-gray-900">{order.receiverName}</h2>
                      <p className="text-sm text-gray-600">{order.phone}</p>
                      <p className="text-sm text-gray-600">
                        {order.address} {order.detailAddress}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="sr-only" htmlFor={`status-${order.id}`}>주문 상태</label>
                      <select
                        id={`status-${order.id}`}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold"
                        value={selectedStatus}
                        disabled={updatingOrderId !== null}
                        onChange={(event) => {
                          const nextStatus = orderStatuses.find((status) => status === event.target.value);
                          if (nextStatus) {
                            setPendingStatuses((current) => ({ ...current, [order.id]: nextStatus }));
                          }
                        }}
                      >
                        {orderStatuses.map((status) => {
                          const canSelect = status !== 'CANCELLED' || order.status === 'CANCELLED';
                          return (
                            <option key={status} value={status} disabled={!canSelect}>
                              {statusLabels[status]}
                            </option>
                          );
                        })}
                      </select>
                      <button
                        type="button"
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
                        disabled={order.status === 'CANCELLED' || selectedStatus === order.status || updatingOrderId !== null}
                        onClick={() => saveStatus(order)}
                      >
                        {updatingOrderId === order.id ? '저장 중…' : '상태 저장'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <ul className="space-y-1 text-sm text-gray-600">
                      {order.orderItems.map((item, index) => (
                        <li key={`${item.productId}-${index}`}>
                          {item.productName} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                    <p className="text-lg font-black text-gray-900">
                      {order.totalAmount.toLocaleString()}원
                    </p>
                  </div>
                </article>
              );
            })}
            {ordersPage?.empty && (
              <p className="rounded-3xl border border-gray-100 bg-white p-16 text-center font-bold text-gray-400">
                주문 내역이 없습니다.
              </p>
            )}
          </div>

          {ordersPage && ordersPage.totalPages > 1 && (
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                className="rounded-lg border px-4 py-2 text-sm font-bold disabled:opacity-40"
                disabled={ordersPage.first}
                onClick={() => setPage((current) => current - 1)}
              >
                이전
              </button>
              <span className="text-sm font-bold text-gray-500">
                {ordersPage.number + 1} / {ordersPage.totalPages}
              </span>
              <button
                type="button"
                className="rounded-lg border px-4 py-2 text-sm font-bold disabled:opacity-40"
                disabled={ordersPage.last}
                onClick={() => setPage((current) => current + 1)}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
