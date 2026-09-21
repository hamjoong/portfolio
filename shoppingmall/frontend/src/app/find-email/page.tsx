'use client';

import React, { useState } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

export default function FindEmailPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ fullName: '', phoneNumber: '' });
  const [foundEmail, setFoundEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFindEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const email = await authService.findEmail(formData);
      setFoundEmail(email);
    } catch (err: any) {
      setError('정보와 일치하는 아이디를 찾을 수 없습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center">아이디 찾기</h2>
        {foundEmail ? (
          <div className="text-center space-y-4">
            <p>고객님의 아이디는 <span className="font-bold text-blue-600">{foundEmail}</span> 입니다.</p>
            <Button onClick={() => router.push('/login')}>로그인 하러 가기</Button>
          </div>
        ) : (
          <form onSubmit={handleFindEmail} className="space-y-4">
            <Input label="이름" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
            <Input label="전화번호" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} required />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">찾기</Button>
          </form>
        )}
      </div>
    </div>
  );
}
