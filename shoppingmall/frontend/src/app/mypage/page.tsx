'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useUser } from '@/hooks/useUser';
import { useOrder } from '@/hooks/useOrder';
import { useReview } from '@/hooks/useReview';
import { User, Package, MapPin, ChevronRight, Settings, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export default function MyPage() {
  const router = useRouter();
  const { email, logout } = useAuthStore();
  const { useProfile, useAddresses, useAddAddress, useDeleteAddress } = useUser();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: addresses } = useAddresses();
  const { useMyOrders } = useOrder();
  const { data: orders } = useMyOrders();
  const addAddressMutation = useAddAddress();
  const deleteAddressMutation = useDeleteAddress();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    addressName: '',
    receiverName: '',
    phoneNumber: '',
    zipCode: '',
    baseAddress: '',
    detailAddress: '',
    isDefault: false
  });

  const handleAddAddress = () => {
    if (!newAddr.addressName || !newAddr.baseAddress) {
      alert('배송지 명칭과 주소를 입력해주세요.');
      return;
    }
    addAddressMutation.mutate(newAddr, {
      onSuccess: () => {
        alert('새 배송지가 등록되었습니다.');
        setIsAddingAddress(false);
        setNewAddr({
          addressName: '', receiverName: '', phoneNumber: '',
          zipCode: '', baseAddress: '', detailAddress: '', isDefault: false
        });
      }
    });
  };

  if (isProfileLoading) {
    return <div className="h-96 flex items-center justify-center font-bold text-gray-400">정보를 불러오는 중...</div>;
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
          {[
            { id: 'orders', label: '주문 내역', icon: <Package className="w-5 h-5" /> },
            { id: 'addresses', label: '배송지 관리', icon: <MapPin className="w-5 h-5" /> },
            { id: 'profile', label: '기본 정보', icon: <Settings className="w-5 h-5" /> }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center justify-between p-4 rounded-xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-bold">{item.label}</span>
              </div>
              <ChevronRight className={`w-4 h-4 ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
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
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-tighter">ORDER NO. {order.id.slice(0,8)}</span>
                      <h3 className="font-bold text-gray-900">{order.orderItems?.[0]?.productName || '주문 상품'}</h3>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()} · {order.totalAmount?.toLocaleString()}원</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-4 py-1.5 bg-gray-900 text-white text-[10px] font-black rounded-lg uppercase">{order.status}</span>
                      <Link 
                        href={`/orders/${order.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 rounded-2xl p-12 text-center text-gray-400 border-2 border-dashed border-gray-200 font-bold">
                  아직 주문 내역이 없습니다.
                </div>
              )}
            </div>
          )}

          {/* 배송지 관리 탭 */}
          {activeTab === 'addresses' && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-gray-900">나의 배송지 주소록</h2>
                <button 
                  onClick={() => setIsAddingAddress(!isAddingAddress)}
                  className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline"
                >
                  <Plus size={16} /> {isAddingAddress ? '닫기' : '새 배송지 추가'}
                </button>
              </div>

              {isAddingAddress && (
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-4 animate-in fade-in slide-in-from-top-2">
                  <h3 className="text-sm font-black text-blue-900 mb-4 uppercase">New Shipping Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="배송지 명칭 (예: 우리집, 회사)" value={newAddr.addressName} onChange={e => setNewAddr({...newAddr, addressName: e.target.value})} />
                    <Input placeholder="수령인 성함" value={newAddr.receiverName} onChange={e => setNewAddr({...newAddr, receiverName: e.target.value})} />
                    <Input placeholder="연락처 (- 제외)" value={newAddr.phoneNumber} onChange={e => setNewAddr({...newAddr, phoneNumber: e.target.value})} className="md:col-span-2" />
                    <Input placeholder="기본 주소" value={newAddr.baseAddress} onChange={e => setNewAddr({...newAddr, baseAddress: e.target.value})} className="md:col-span-2" />
                    <Input placeholder="상세 주소" value={newAddr.detailAddress} onChange={e => setNewAddr({...newAddr, detailAddress: e.target.value})} className="md:col-span-2" />
                  </div>
                  <Button className="w-full mt-6 shadow-lg shadow-blue-200" onClick={handleAddAddress} isLoading={addAddressMutation.isPending}>배송지 저장하기</Button>
                </div>
              )}

              {addresses && addresses.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center group">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-gray-900 uppercase text-sm">{addr.addressName}</span>
                          {addr.isDefault && <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded uppercase">Default</span>}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">{addr.receiverName} · {addr.phoneNumber}</p>
                        <p className="text-sm text-gray-700 mt-1 font-bold">{addr.baseAddress} {addr.detailAddress}</p>
                      </div>
                      <button 
                        onClick={() => deleteAddressMutation.mutate(addr.id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : !isAddingAddress && (
                <div className="bg-gray-50 rounded-2xl p-12 text-center text-gray-400 border-2 border-dashed border-gray-200 font-bold">
                  등록된 배송지가 없습니다.
                </div>
              )}
            </div>
          )}

          {/* 기본 정보 탭 */}
          {activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-8">기본 정보 설정</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Name (Fixed)</label>
                  <input type="text" value={profile?.fullName || ''} readOnly className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-gray-400 font-bold outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Email (Fixed)</label>
                  <input type="text" value={email || ''} readOnly className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-gray-400 font-bold outline-none cursor-not-allowed" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Contact Number</label>
                  <input type="text" value={profile?.phoneNumber || ''} readOnly className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-gray-400 font-bold outline-none" />
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-50">
                <p className="text-xs text-gray-400 font-medium mb-6">성함과 이메일은 본인 확인을 위해 수정이 제한됩니다. 주소지 및 상세 정보 수정이 필요하시면 아래 버튼을 눌러주세요.</p>
                <Button 
                  onClick={() => router.push('/mypage/settings')}
                  className="w-full md:w-auto px-12 h-14 bg-gray-900 text-white font-black rounded-xl hover:bg-black transition-all shadow-xl shadow-gray-200"
                >
                  주소 및 연락처 수정하기
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
