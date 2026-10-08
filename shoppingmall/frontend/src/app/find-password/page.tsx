'use client';

import React, { useState } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useRouter } from 'next/navigation';
import { requestSupabasePasswordRecovery } from '@/utils/supabaseAuth';

/** 이메일로 비밀번호 재설정 링크를 보냅니다. (임시 비밀번호를 화면에 보여주는 방식은 쓰지 않음) */
export default function FindPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [recoveryRequested, setRecoveryRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const redirectTo = new URL('/reset-password', window.location.origin).toString();
      await requestSupabasePasswordRecovery(email.trim().toLowerCase(), redirectTo);
      setRecoveryRequested(true);
    } catch {
      setError('비밀번호 복구 요청을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center">비밀번호 찾기</h2>
        {recoveryRequested ? (
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              입력한 이메일이 계정과 연결되어 있다면 비밀번호 재설정 안내 메일을 보냈습니다.
            </p>
            <p className="text-sm text-gray-500">
              메일의 링크를 열어 새 비밀번호를 설정해 주세요. 메일이 오지 않으면 스팸함도 확인해 주세요.
            </p>
            <Button onClick={() => router.push('/login')}>로그인으로 돌아가기</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="이메일(아이디)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" isLoading={isLoading}>
              재설정 메일 받기
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
