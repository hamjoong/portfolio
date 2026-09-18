import { Project } from '../types/Project';

export const PROJECTS: Project[] = [
  {
    title: 'devcodehub',
    period: '2026.03.23 - 2026.04.03',
    description: '개발자 커뮤니티 플랫폼으로, 사용자 친화적 인터페이스와 강력한 기능을 제공합니다.',
    stack: ['React 19', 'TypeScript', 'Tailwind CSS', 'Spring Boot', 'PostgreSQL(Supabase)', 'Docker'],
    problem: 'AI 기반 추천 시스템의 성능 저하 및 대규모 트래픽 보안 이슈 및 실시간 채팅 환경 구현.',
    solution: 'Spring Security/JWT 무상태 인증 및 AWS SDK 지연 초기화 전략.',
    links: { demo: 'https://d21xqtdxaa8phl.cloudfront.net/' },
  },
  {
    title: 'shopping mall',
    period: '2026.03.09 - 2026.03.13',
    description: '복잡한 이커머스 시스템을 현대적 아키텍처로 재해석한 풀스택 프로젝트입니다.',
    stack: ['Next.js', 'Spring Boot', 'TypeScript', 'PostgreSQL(Supabase)', 'Docker'],
    problem: '대규모 트래픽 보안 및 의존성 이슈.',
    solution: 'Spring Security/JWT 무상태 인증 및 AWS SDK 지연 초기화 전략.',
    links: { demo: 'https://shoppingmallfrontend.vercel.app/' },
  },
  {
    title: 'Milk Tycoon',
    period: '2026.03.02 - 2026.03.04',
    description: '추억의 게임을 현대적으로 재해석한 인터랙티브 게임입니다.',
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
    problem: '게임 로딩 속도 저하 및 복잡한 UI.',
    solution: '코드 스플리팅 및 이미지 최적화로 로딩 속도 40% 단축.',
    links: { github: 'https://hamjoong.github.io/portfolio/milktycoon/' },
  },
];
