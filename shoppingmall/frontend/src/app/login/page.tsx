'use client';

import React, { useState } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * 사용자 로그인을 위한 페이지 컴포넌트입니다 (Supabase Auth).
 */
export default function LoginPage() {
  const router = useRouter();
  const loginStore = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const loginData = await authService.login(formData);
      if (loginData && loginData.accessToken) {
        loginStore.login(
          loginData.userId, 
          formData.email, 
          loginData.accessToken, 
          loginData.role,
          loginData.refreshToken
        );
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Hjuk Shopping Mall</h2>
          <p className="mt-2 text-sm text-gray-600">계정에 로그인하세요</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <Input
              label="이메일"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            로그인
          </Button>

          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <button type="button" onClick={() => router.push('/find-password')} className="hover:text-blue-600">비밀번호 찾기</button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <button
            onClick={() => router.push('/signup')}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            회원가입
          </button>
        </p>
      </div>
    </div>
  );
}
