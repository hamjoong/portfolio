import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * 인증 및 권한 확인을 위한 공통 커스텀 훅
 * GEMINI.md 규칙: DRY(중복 제거), SRP(단일 책임 원칙)
 * 
 * '!isLoggedIn || role === GUEST' 패턴이 5개 이상의 파일에서 반복되므로
 * 공통 훅으로 추출하여 일관된 인증 가드를 제공합니다.
 */
export const useAuthGuard = () => {
  const navigate = useNavigate();
  
  // Zustand에서 필요한 값만 구독하여 불필요한 리렌더링 방지
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const role = useAuthStore((state) => state.role);

  /** 로그인된 회원(GUEST 제외)인지 확인 */
  const isMember = isLoggedIn && role !== 'GUEST';

  /** 회원 전용 기능 접근 시 권한 확인 후 알럿 처리 */
  const requireMember = useCallback((actionDescription = '이 기능'): boolean => {
    if (!isLoggedIn || role === 'GUEST') {
      alert(`${actionDescription}은(는) 회원 전용 기능입니다. 로그인 후 이용해 주세요.`);
      return false;
    }
    return true;
  }, [isLoggedIn, role]);

  /** 비로그인 또는 비회원(GUEST) 시 로그인 페이지로 리다이렉트 */
  const requireLogin = useCallback((redirectPath = '/login'): boolean => {
    if (!isLoggedIn || role === 'GUEST') {
      alert('로그인이 필요합니다.');
      navigate(redirectPath);
      return false;
    }
    return true;
  }, [isLoggedIn, role, navigate]);

  return { isMember, isLoggedIn, role, requireMember, requireLogin };
};
