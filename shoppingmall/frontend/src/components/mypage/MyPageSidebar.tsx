'use client';

import React from 'react';
import { Package, MapPin, Settings, MessageSquare, ChevronRight } from 'lucide-react';

interface MyPageSidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export function MyPageSidebar({ activeTab, onTabChange }: MyPageSidebarProps) {
  const menuItems = [
    { id: 'orders', label: '주문 내역', icon: <Package className="w-5 h-5" /> },
    { id: 'qnas', label: '상품 문의', icon: <MessageSquare className="w-5 h-5" />, href: '/mypage/qna' },
    { id: 'addresses', label: '배송지 관리', icon: <MapPin className="w-5 h-5" /> },
    { id: 'profile', label: '기본 정보', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <aside className="lg:col-span-1 flex flex-col gap-2">
      {menuItems.map((item) => (
        <button 
          key={item.id}
          onClick={() => onTabChange(item)}
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
  );
}
