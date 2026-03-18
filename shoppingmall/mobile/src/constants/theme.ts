/**
 * 모바일 앱 전체에서 공통으로 사용하는 디자인 테마 상수입니다.
 * [이유] 브랜드 색상, 폰트 크기, 간격 등을 한 곳에서 관리하여
 * 일관된 UI/UX를 유지하고 스타일 수정 시 유지보수 편의성을 극대화하기 위함입니다.
 */
export const theme = {
  colors: {
    primary: '#2563eb', // 메인 브랜드 블루
    primaryDark: '#1d4ed8',
    secondary: '#64748b',
    background: '#ffffff',
    surface: '#f8fafc',
    error: '#ef4444',
    text: {
      main: '#0f172a',
      sub: '#475569',
      inverse: '#ffffff',
    },
    border: '#e2e8f0',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '900' as const },
    h2: { fontSize: 24, fontWeight: '800' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    caption: { fontSize: 12, fontWeight: '500' as const },
  },
};
