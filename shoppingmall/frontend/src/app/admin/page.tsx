'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminService } from '@/services/admin.service';
import { 
  Users, 
  ShoppingBag, 
  CreditCard, 
  TrendingUp,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';

/**
 * 어드민 대시보드 메인 페이지입니다.
 * [성능] `useEffect`를 통해 실시간 비즈니스 통계 데이터를 동적으로 로드합니다.
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: '총 사용자', value: stats?.totalUsers || 0, icon: Users, color: 'blue', link: '/admin/users' },
    { name: '총 상품 수', value: stats?.totalProducts || 0, icon: ShoppingBag, color: 'emerald', link: '/admin/products' },
    { name: '총 주문 완료', value: stats?.totalOrders || 0, icon: CreditCard, color: 'purple', link: '#' },
    { name: '누적 매출액', value: `${(stats?.totalSales || 0).toLocaleString()}원`, icon: TrendingUp, color: 'amber', link: '#' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Dashboard Overview</h1>
        <p className="text-gray-500 font-medium font-medium">실시간 비즈니스 현황 및 시스템 통계입니다.</p>
      </div>

      {/* 통계 카드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-colors
              ${card.color === 'blue' ? 'bg-blue-50 text-blue-600' : ''}
              ${card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : ''}
              ${card.color === 'purple' ? 'bg-purple-50 text-purple-600' : ''}
              ${card.color === 'amber' ? 'bg-amber-50 text-amber-600' : ''}
            `}>
              <card.icon className="w-7 h-7" />
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-widest">{card.name}</p>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  {loading ? '---' : card.value}
                </h3>
              </div>
              {card.link !== '#' && (
                <Link href={card.link} className="p-2 bg-gray-50 rounded-xl text-gray-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100 hover:text-gray-900">
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 퀵 링크 및 하단 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
          <div className="relative z-10 max-w-md">
            <h2 className="text-3xl font-black tracking-tight mb-4">데이터 기반 성장을 시작하세요</h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
              상세한 사용자 분석과 상품 판매 통계를 통해 최적의 마케팅 전략을 세울 수 있습니다. 관리자 페이지 기능을 적극적으로 활용해 보세요.
            </p>
            <Link href="/admin/products" className="inline-flex items-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-sm font-black transition-all shadow-lg shadow-blue-600/20 group">
              상품 관리 바로가기
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full"></div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
            <div className="bg-amber-50 rounded-full p-4 mb-6">
                <TrendingUp className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">준비 중인 기능</h3>
            <p className="text-gray-400 text-xs font-bold leading-relaxed">
                매출 그래프 분석, 주문 현황 상보 조회 및 엑셀 다운로드 기능이 곧 추가될 예정입니다.
            </p>
        </div>
      </div>
    </div>
  );
}
