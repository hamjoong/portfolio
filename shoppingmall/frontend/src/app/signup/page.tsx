'use client';

import React, { useState, useCallback } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

/**
 * 사용자 회원가입 페이지입니다.
 * [이유] 비밀번호 유효성 검사를 단계별로 분리하여 사용자에게 정확한 실패 원인을 안내하고,
 * 다양한 특수문자를 수용할 수 있도록 로직을 개선했습니다.
 */
export default function SignupPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    detailAddress: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  /**
   * 유효성 검사를 수행합니다.
   * [이유] 정규표현식 하나에 의존하지 않고 각 조건을 개별 체크하여 
   * '왜' 가입이 안 되는지 사용자에게 친절하게 설명합니다.
   */
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    // 1. 이메일 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = '이메일을 입력해주세요.';
    else if (!emailRegex.test(formData.email)) newErrors.email = '올바른 이메일 형식이 아닙니다.';

    // 2. 비밀번호 단계별 검사
    const pw = formData.password;
    if (!pw) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else {
      const hasLetter = /[A-Za-z]/.test(pw);
      const hasNumber = /\d/.test(pw);
      const hasSpecial = /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/.test(pw);
      const isLongEnough = pw.length >= 16;

      if (!isLongEnough) {
        newErrors.password = '비밀번호는 16자 이상이어야 합니다. (현재 ' + pw.length + '자)';
      } else if (!hasLetter || !hasNumber || !hasSpecial) {
        newErrors.password = '영문, 숫자, 특수문자를 각각 최소 1개 이상 포함해야 합니다.';
      }
    }

    // 3. 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    // 4. 성명
    if (!formData.fullName) newErrors.fullName = '성명을 입력해주세요.';
    else if (!/^[a-zA-Z가-힣\s]+$/.test(formData.fullName)) newErrors.fullName = '성명은 문자만 입력 가능합니다.';

    // 5. 휴대폰 번호
    if (!formData.phoneNumber) newErrors.phoneNumber = '휴대폰 번호를 입력해주세요.';
    else if (!/^\d{10,12}$/.test(formData.phoneNumber)) newErrors.phoneNumber = '휴대폰 번호는 10~12자리 숫자여야 합니다.';

    // 6. 주소 (유효성 검사 추가)
    if (!formData.address) {
      newErrors.address = '주소를 입력해주세요.';
    } else if (formData.address.length < 5) {
      newErrors.address = '정확한 도로명 주소를 입력해주세요 (최소 5자).';
    }

    if (!formData.detailAddress) {
      newErrors.detailAddress = '상세 주소를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // 유효성 검사 수행
    const isValid = validateForm();
    if (!isValid) return;

    setIsLoading(true);
    try {
      const { confirmPassword, ...signupData } = formData;
      const userId = await authService.signup(signupData);
      
      if (userId) {
        alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
        router.push('/login');
      }
    } catch (err: any) {
      // api.ts에서 처리된 실제 서버 메시지를 우선 사용
      const msg = err.message || '이미 가입된 이메일이거나 서버 통신 오류가 발생했습니다.';
      setServerError(msg);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hjuk Shopping Mall</h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">회원가입 정보를 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <div className="space-y-4">
            <Input
              label="이메일 주소"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder="영문+숫자+특수문자 포함 16자 이상"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
            />
            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호 재입력"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
            />
            <Input
              label="성명"
              placeholder="성명을 입력하세요"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              error={errors.fullName}
            />
            <Input
              label="휴대폰 번호"
              placeholder="숫자만 입력 (예: 01012345678)"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/[^0-9]/g, '') })}
              error={errors.phoneNumber}
              maxLength={12}
            />
            <div className="space-y-4 pt-2 border-t border-gray-50">
              <Input
                label="주소 (도로명)"
                placeholder="예: 서울특별시 강남구 ..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                error={errors.address}
              />
              <Input
                label="상세 주소"
                placeholder="예: 101동 101호"
                value={formData.detailAddress}
                onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
                error={errors.detailAddress}
              />
            </div>
          </div>

          {serverError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-center">
              <p className="text-sm text-red-600 font-bold">{serverError}</p>
            </div>
          )}

          <Button type="submit" className="w-full shadow-md" isLoading={isLoading} size="lg">
            가입하기
          </Button>
        </form>

        <div className="text-center pt-2">
          <button type="button" onClick={() => router.push('/login')} className="text-sm font-bold text-blue-600">
            이미 계정이 있으신가요? 로그인하기
          </button>
        </div>
      </div>
    </div>
  );
}
