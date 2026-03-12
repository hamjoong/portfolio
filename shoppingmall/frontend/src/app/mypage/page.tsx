'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useUser } from '@/hooks/useUser';
import { useOrder } from '@/hooks/useOrder';
import { useReview } from '@/hooks/useReview';
import { User, Package, MapPin, MessageSquare, ChevronRight, Settings, ExternalLink } from 'lucide-react';

/**
 * 마이페이지 메인 화면입니다.
 * [이유] 사용자의 프로필, 주문 내역, 배송지 관리 등 
 * 개인화된 모든 정보를 통합 관리하는 허브 역할을 수행하기 위함입니다.
 */
export default function MyPage() {
  const router = useRouter();
  const { email, logout } = useAuthStore();
  const { useProfile, useAddresses } = useUser();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: addresses } = useAddresses();
  const { useMyOrders } = useOrder();
  const { data: orders } = useMyOrders();
  const { useMyReviews } = useReview(); // useReview 훅에 추가 필요할 수 있음

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');

  if (isProfileLoading) {
    return <div className="h-96 flex items-center justify-center">정보를 불러오는 중...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10">
      {/* 상단 프로필 섹션 */}
      <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <User className="w-12 h-12" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-black text-gray-900 mb-1">{profile?.fullName || '사용자'}님, 안녕하세요!</h1>
          <p className="text-gray-500 text-sm mb-4">{email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">Silver Member</span>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full tracking-wider">포인트 1,200P</span>
          </div>
        </div>
        <button onClick={logout} className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors">로그아웃</button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 사이드바 메뉴 */}
        <aside className="lg:col-span-1 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center justify-between p-4 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5" />
              <span className="font-bold">주문 내역</span>
            </div>
            <ChevronRight className={`w-4 h-4 ${activeTab === 'orders' ? 'opacity-100' : 'opacity-0'}`} />
          </button>
          
          <button 
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center justify-between p-4 rounded-xl transition-all ${activeTab === 'addresses' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5" />
              <span className="font-bold">배송지 관리</span>
            </div>
            <ChevronRight className={`w-4 h-4 ${activeTab === 'addresses' ? 'opacity-100' : 'opacity-0'}`} />
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center justify-between p-4 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" />
              <span className="font-bold">내 정보 수정</span>
            </div>
            <ChevronRight className={`w-4 h-4 ${activeTab === 'profile' ? 'opacity-100' : 'opacity-0'}`} />
          </button>
        </aside>

        {/* 컨텐츠 영역 */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* 주문 내역 탭 */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">최근 주문 내역</h2>
              {orders && orders.length > 0 ? (
                orders.map((order: any) => (
                  <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-tighter">{order.orderNo}</span>
                      <h3 className="font-bold text-gray-900 line-clamp-1">{order.orderItems[0]?.productName} {order.orderItems.length > 1 ? `외 ${order.orderItems.length - 1}건` : ''}</h3>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()} · {order.totalAmount.toLocaleString()}원</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-4 py-1.5 bg-gray-900 text-white text-xs font-black rounded-lg">{order.status}</span>
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 rounded-2xl p-12 text-center text-gray-400 border-2 border-dashed border-gray-200">
                  아직 주문 내역이 없습니다.
                </div>
              )}
            </div>
          )}

          {/* 배송지 관리 탭 */}
          {activeTab === 'addresses' && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-gray-900">배송지 정보</h2>
                <button 
                  onClick={() => router.push('/mypage/shipping')}
                  className="text-sm font-bold text-blue-600"
                >
                  + 새 배송지 추가
                </button>
              </div>
              {addresses && addresses.length > 0 ? (
                addresses.map((addr) => (
                  <div key={addr.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{addr.addressName}</span>
                        {addr.isDefault && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">기본</span>}
                      </div>
                      <p className="text-sm text-gray-600">{addr.receiverName} · {addr.phoneNumber}</p>
                      <p className="text-sm text-gray-500 mt-1">{addr.baseAddress} {addr.detailAddress}</p>
                    </div>
                    <button className="text-xs font-bold text-gray-400 hover:text-gray-900 underline underline-offset-4">수정</button>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 rounded-2xl p-12 text-center text-gray-400 border-2 border-dashed border-gray-200">
                  등록된 배송지가 없습니다.
                </div>
              )}
            </div>
          )}

          {/* 프로필 관리 탭 */}
          {activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-8">기본 정보 설정</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">이름</label>
                  <input type="text" defaultValue={profile?.fullName} className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">이메일 (변경불가)</label>
                  <input type="text" value={email || ''} readOnly className="w-full h-12 px-4 bg-gray-100 text-gray-400 border-none rounded-xl outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">휴대폰 번호</label>
                  <input type="text" defaultValue={profile?.phoneNumber} className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>
              <button 
                onClick={() => router.push('/mypage/settings')}
                className="mt-8 w-full md:w-auto px-12 h-14 bg-gray-900 text-white font-black rounded-xl hover:bg-black transition-all"
              >
                정보 수정하러 가기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
