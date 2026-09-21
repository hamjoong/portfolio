'use client';

import React, { useState } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

export default function FindPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', fullName: '', phoneNumber: '' });
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFindPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const password = await authService.findPassword(formData);
      setTempPassword(password);
    } catch (err: any) {
      setError('정보와 일치하는 계정을 찾을 수 없습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center">비밀번호 찾기</h2>
        {tempPassword ? (
          <div className="text-center space-y-4">
            <p className="text-gray-600">임시 비밀번호가 발급되었습니다.</p>
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">임시 비밀번호</p>
              <p className="text-xl font-bold tracking-widest text-blue-600">{tempPassword}</p>
            </div>
            <p className="text-sm text-gray-500">로그인 후 반드시 비밀번호를 변경해 주세요.</p>
            <Button onClick={() => router.push('/login')}>로그인 하러 가기</Button>
          </div>
        ) : (
          <form onSubmit={handleFindPassword} className="space-y-4">
            <Input label="이메일(아이디)" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <Input label="이름" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
            <Input label="전화번호" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} required />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">임시 비밀번호 발급</Button>
          </form>
        )}
      </div>
    </div>
  );
}
