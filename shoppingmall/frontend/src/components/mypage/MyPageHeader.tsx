'use client';

import React from 'react';
import { User } from 'lucide-react';

interface MyPageHeaderProps {
  fullName?: string;
  email?: string | null;
  logout: () => void;
}

export function MyPageHeader({ fullName, email, logout }: MyPageHeaderProps) {
  return (
    <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
        <User className="w-12 h-12" />
      </div>
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-2xl font-black text-gray-900 mb-1">{fullName || '사용자'}님, 안녕하세요!</h1>
        <p className="text-gray-500 text-sm mb-4">{email}</p>
        <div className="flex flex-wrap justify-center md:justify-start gap-3">
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">Silver Member</span>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full tracking-wider">포인트 1,200P</span>
        </div>
      </div>
      <button onClick={logout} className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors">로그아웃</button>
    </section>
  );
}
