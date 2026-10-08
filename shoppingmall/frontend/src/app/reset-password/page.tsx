'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { updateSupabasePassword } from '@/utils/supabaseAuth';

type RecoveryState = 'checking' | 'ready' | 'invalid' | 'updated';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [recoveryState, setRecoveryState] = useState<RecoveryState>('checking');
  const [accessToken, setAccessToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const token = fragment.get('access_token');
    const type = fragment.get('type');
    window.history.replaceState(null, '', window.location.pathname);

    if (type !== 'recovery' || !token) {
      setRecoveryState('invalid');
      return;
    }

    setAccessToken(token);
    setRecoveryState('ready');
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('새 비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      await updateSupabasePassword(accessToken, password);
      setAccessToken('');
      setPassword('');
      setConfirmPassword('');
      setRecoveryState('updated');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '새 비밀번호를 저장하지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-gray-900">새 비밀번호 설정</h1>
        {recoveryState === 'checking' && <p role="status" className="text-center text-gray-600">복구 링크를 확인하고 있습니다.</p>}
        {recoveryState === 'invalid' && (
          <div className="space-y-4 text-center">
            <p role="alert" className="text-sm text-red-600">복구 링크가 유효하지 않거나 만료되었습니다. 비밀번호 찾기에서 새 링크를 요청해 주세요.</p>
            <Button onClick={() => router.push('/find-password')}>복구 링크 다시 요청</Button>
          </div>
        )}
        {recoveryState === 'updated' && (
          <div className="space-y-4 text-center">
            <p role="status" className="text-gray-600">비밀번호를 변경했습니다. 새 비밀번호로 로그인해 주세요.</p>
            <Button onClick={() => router.push('/login')}>로그인</Button>
          </div>
        )}
        {recoveryState === 'ready' && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="새 비밀번호"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
            <Input
              label="새 비밀번호 확인"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
            />
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" isLoading={isLoading}>비밀번호 변경</Button>
          </form>
        )}
      </section>
    </main>
  );
}
