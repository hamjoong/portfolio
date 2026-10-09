export interface TechItem {
  name: string;
  description: string;
}

export interface TechStackData {
  FrontEnd: TechItem[];
  BackEnd: TechItem[];
  ETC: TechItem[];
}

export const TECH_STACK: TechStackData = {
  FrontEnd: [
    { name: 'TypeScript', description: '정적 타입으로 코드 안정성과 유지보수성 향상' },
    { name: 'React', description: '컴포넌트 기반 UI 개발, Zustand·TanStack Query로 상태 관리' },
    { name: 'Next.js', description: 'App Router 기반 풀스택 React 프레임워크' },
    { name: 'Tailwind CSS', description: '반응형 UI를 빠르게 구현하는 CSS 프레임워크' },
  ],
  BackEnd: [
    { name: 'Java / Spring Boot', description: 'JWT 인증, WebSocket 실시간 채팅 구현' },
    { name: 'PostgreSQL / Supabase', description: 'Auth, Edge Functions, RPC로 API와 데이터 처리' },
    { name: 'MySQL, Node.js (Express/NestJS)', description: '학습 경험. 기본 개념과 사용법을 익혔습니다' },
  ],
  ETC: [
    { name: 'GitHub Actions', description: '빌드와 배포 자동화' },
    { name: 'Docker', description: '백엔드 컨테이너 이미지 빌드' },
    { name: 'Vercel / Render', description: '프론트엔드와 백엔드 배포' },
  ]
};
