/**
 * 프론트엔드 전역 상수 정의
 * 환경 변수를 통한 API 기본 URL 관리로 보안 및 환경 분리를 보장합니다.
 * GEMINI.md 규칙: API Key 노출 금지, 환경 변수(.env) 사용
 */

/** 백엔드 서버의 기본 URL (환경 변수에서 가져오거나 빈 값) */
const BASE_URL = (import.meta.env.VITE_API_SERVER_URL || '').replace(/\/$/, '');

/**
 * REST·웹소켓 공통 API 베이스 URL
 * 로컬: VITE_API_SERVER_URL이 없으면 '/api/v1' (Vite 프록시가 8080으로 전달)
 * 운영: VITE_API_SERVER_URL이 있으면 중복 체크 후 '/api/v1' 결합
 */
export const API_BASE_URL = BASE_URL
  ? (BASE_URL.includes('/api/v1') ? BASE_URL : `${BASE_URL}/api/v1`)
  : '/api/v1';

/** 개발 모드 여부 확인 (Vite 표준 방식) */
const isDev = import.meta.env.MODE === 'development';

/** 소셜 로그인 리다이렉트 기본 경로 설정 */
// [Why] 소셜 로그인은 브라우저가 백엔드로 직접 이동해야 하므로 개발에서는 백엔드 주소를 그대로 쓴다.
const SOCIAL_BASE = isDev ? 'http://localhost:8080/api/v1' : API_BASE_URL;
export const OAUTH_REDIRECT_BASE = `${SOCIAL_BASE}/oauth2/authorization`;

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
