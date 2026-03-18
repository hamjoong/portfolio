'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useUser } from '@/hooks/useUser';
import { useOrder } from '@/hooks/useOrder';
import { ExternalLink, Plus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { MyPageHeader } from '@/components/mypage/MyPageHeader';
import { MyPageSidebar } from '@/components/mypage/MyPageSidebar';
import { AddressForm } from '@/components/mypage/AddressForm';
import { AddressList } from '@/components/mypage/AddressList';

export default function MyPage() {
  const router = useRouter();
  const { email, logout } = useAuthStore();
  const { useProfile, useAddresses, useAddAddress, useDeleteAddress } = useUser();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: addresses } = useAddresses();
  const { useMyOrders } = useOrder();
  const { data: ordersData } = useMyOrders();
  const orders = ordersData?.content || [];
  const addAddressMutation = useAddAddress();
  const deleteAddressMutation = useDeleteAddress();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    addressName: '', receiverName: '', phoneNumber: '',
    zipCode: '', baseAddress: '', detailAddress: '', isDefault: false
  });

  const handleNewAddrChange = (field: string, value: string) => {
    let filteredValue = value;
    const regexMap: Record<string, RegExp> = {
      receiverName: /[^a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣\s]/g,
      phoneNumber: /[^0-9]/g,
      other: /[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s\-,\.\(\)]/g
    };
    
    if (field === 'receiverName' || field === 'phoneNumber') {
      filteredValue = value.replace(regexMap[field], '');
      if (field === 'phoneNumber' && filteredValue.length > 11) filteredValue = filteredValue.slice(0, 11);
    } else if (['addressName', 'baseAddress', 'detailAddress'].includes(field)) {
      filteredValue = value.replace(regexMap.other, '');
    }
    
    setNewAddr(prev => ({ ...prev, [field]: filteredValue }));
  };

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
      <MyPageHeader fullName={profile?.fullName} email={email} logout={logout} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <MyPageSidebar 
          activeTab={activeTab} 
          onTabChange={(item) => item.href ? router.push(item.href) : setActiveTab(item.id)} 
        />

        <div className="lg:col-span-3 flex flex-col gap-6">
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
                      <Link href={`/orders/${order.id}`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 rounded-2xl p-12 text-center text-gray-400 border-2 border-dashed border-gray-200 font-bold">아직 주문 내역이 없습니다.</div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-gray-900">나의 배송지 주소록</h2>
                <button onClick={() => setIsAddingAddress(!isAddingAddress)} className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline">
                  <Plus size={16} /> {isAddingAddress ? '닫기' : '새 배송지 추가'}
                </button>
              </div>
              {isAddingAddress && <AddressForm newAddr={newAddr} onFieldChange={handleNewAddrChange} onSave={handleAddAddress} isPending={addAddressMutation.isPending} />}
              {addresses && addresses.length > 0 ? (
                <AddressList addresses={addresses} onDelete={(id) => deleteAddressMutation.mutate(id)} />
              ) : !isAddingAddress && (
                <div className="bg-gray-50 rounded-2xl p-12 text-center text-gray-400 border-2 border-dashed border-gray-200 font-bold">등록된 배송지가 없습니다.</div>
              )}
            </div>
          )}

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
                <Button onClick={() => router.push('/mypage/settings')} className="w-full md:w-auto px-12 h-14 bg-gray-900 text-white font-black rounded-xl hover:bg-black transition-all shadow-xl shadow-gray-200">주소 및 연락처 수정하기</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
