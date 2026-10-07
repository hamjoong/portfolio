import { Project } from '../types/Project';

// 저장소는 같은 이름(hamjoong/portfolio)으로 재생성되므로 GitHub 링크는 인프라 이전 후에도 유지됨.
// 데모 링크(demo)는 인프라 이전(Phase 4) 때 최종 주소로 교체해야 함.
const REPO = 'https://github.com/hamjoong/portfolio/tree/main';

export const PROJECTS: Project[] = [
  {
    title: 'devcodehub',
    period: '2026.03.23 - 2026.04.03',
    description: 'AI 코드 리뷰와 시니어 개발자 1:1 리뷰 매칭, 실시간 채팅을 제공하는 개발자 커뮤니티 플랫폼입니다.',
    stack: ['React 19', 'TypeScript', 'Tailwind CSS', 'Spring Boot', 'PostgreSQL(Supabase)', 'WebSocket(STOMP)', 'Docker'],
    problem: '여러 AI 모델의 코드 리뷰 응답을 기다리는 동안의 지연과, 실시간 채팅·알림 구현.',
    solution: 'AI 호출을 전용 스레드 풀에서 병렬(CompletableFuture)로 처리하고, STOMP WebSocket으로 채팅·알림을 구현. 인증은 Spring Security + JWT 무상태 방식.',
    links: { demo: 'https://d21xqtdxaa8phl.cloudfront.net/', github: `${REPO}/devcodehub` },
  },
  {
    title: 'shopping mall',
    period: '2026.03.09 - 2026.03.13',
    description: '상품 탐색부터 장바구니, 주문, 리뷰, 관리자 기능까지 갖춘 풀스택 쇼핑몰 프로젝트입니다.',
    stack: ['Next.js', 'TypeScript', 'Supabase Edge Functions', 'PostgreSQL(Supabase)'],
    problem: '무료 호스팅 서버의 슬립으로 인한 응답 지연과, 동시 주문 시 재고 정합성.',
    solution: '주요 API를 Supabase Edge Functions로 이전하고, 주문 생성과 재고 차감을 PostgreSQL RPC(행 잠금) 한 번으로 원자적으로 처리.',
    links: { demo: 'https://shoppingmallfrontend.vercel.app/', github: `${REPO}/shoppingmall` },
  },
  {
    title: 'Milk Tycoon',
    period: '2026.03.02 - 2026.03.04',
    description: '추억의 게임을 현대적으로 재해석한 인터랙티브 게임입니다.',
    stack: ['React', 'TypeScript', 'Vite', 'Zustand', 'Framer Motion', 'Tailwind CSS'],
    problem: '여러 화면과 모달로 커진 초기 번들, 새로고침 시 게임 진행 상황 유실.',
    solution: 'React.lazy로 화면·모달 단위 코드 스플리팅을 적용하고, Zustand persist로 진행 상황을 브라우저에 자동 저장.',
    links: { demo: 'https://hamjoong.github.io/portfolio/milktycoon/', github: `${REPO}/milktycoon` },
  },
];
