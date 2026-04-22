/**
 * 앱 모드(사이드바 + 메인 레이아웃)가 적용될 경로 정의
 * 새로운 페이지가 추가될 때 이곳에 경로를 등록합니다.
 */
export const APP_ROUTES = [
  '/dashboard',
  '/credits',
  '/boards',
  '/ai-review',
  '/chat',
  '/senior-review',
  '/admin'
];

/**
 * 현재 경로가 앱 모드 레이아웃을 사용해야 하는지 확인합니다.
 * @param pathname 현재 URL 경로
 * @returns 앱 모드 여부
 */
export const checkIsAppPage = (pathname: string): boolean => {
  return APP_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
};
