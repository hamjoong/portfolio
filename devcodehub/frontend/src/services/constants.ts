/**
 * 프론트엔드 전역 상수 정의
 * 환경 변수를 통한 API 기본 URL 관리로 보안 및 환경 분리를 보장합니다.
 * GEMINI.md 규칙: API Key 노출 금지, 환경 변수(.env) 사용
 */

export const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL || '/api/v1';

const OAUTH_BASE = import.meta.env.VITE_OAUTH_BASE_URL || 'http://localhost:8080/api/v1';
export const OAUTH_REDIRECT_BASE = `${OAUTH_BASE}/oauth2/authorization`;

/** 지원하는 소셜 로그인 프로바이더 목록 */
export const SOCIAL_LOGIN_PROVIDERS = ['google', 'github', 'kakao', 'naver'] as const;

export type SocialProvider = typeof SOCIAL_LOGIN_PROVIDERS[number];

/**
 * 주어진 프로바이더에 대한 소셜 로그인 리다이렉트 URL을 생성합니다.
 * @param provider 소셜 로그인 프로바이더 (google, github, kakao, naver)
 * @returns 소셜 로그인 리다이렉트 URL
 */
export const getSocialLoginUrl = (provider: SocialProvider): string => {
  return `${OAUTH_REDIRECT_BASE}/${provider}`;
};

/** 대시보드 통계 기본값 (API 미연동 시 표시할 플레이스홀더) */
export const DASHBOARD_PLACEHOLDER = {
  PENDING_REVIEW_COUNT: 0,
  CUMULATIVE_FEEDBACK_COUNT: 0,
} as const;

/** AI 코드 리뷰 최대 사용 횟수 (비회원 일일 제한) */
export const AI_REVIEW_MAX_USAGE = 3;
