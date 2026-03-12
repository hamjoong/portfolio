'use client';

import React, { useState } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * 사용자 로그인을 위한 페이지 컴포넌트입니다.
 * [이유] 일반 이메일 로그인과 소셜 로그인 기능을 제공하며,
 * 성공 시 전역 상태(Zustand)를 업데이트하여 서비스 전체에 인증 상태를 반영합니다.
 */
export default function LoginPage() {
  const router = useRouter();
  const loginStore = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 일반 이메일 로그인을 수행합니다.
   * [이유] 로그인 성공 시 발급받은 토큰을 전역 스토어에 저장하여 
   * 헤더 UI 변경 및 이후 API 요청의 인증 헤더 삽입을 가능하게 합니다.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = await authService.login(formData);
      if (accessToken) {
        // [수정] Zustand 스토어의 login 메서드 호출
        // accessToken 자체가 문자열이므로 이를 직접 전달
        loginStore.login("USER_ID", formData.email, accessToken);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'kakao') => {
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
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
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는 소셜 계정으로 로그인</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin('google')}
            >
              Google
            </Button>
            <Button
              variant="outline"
              className="w-full bg-[#FEE500] border-none text-[#191919] hover:bg-[#FADA0A]"
              onClick={() => handleSocialLogin('kakao')}
            >
              Kakao
            </Button>
          </div>
        </div>

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
