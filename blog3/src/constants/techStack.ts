export interface TechItem {
  name: string;
  description: string;
  icon?: string;
}

export interface TechStackData {
  FrontEnd: TechItem[];
  BackEnd: TechItem[];
  ETC: TechItem[];
}

export const TECH_STACK: TechStackData = {
  FrontEnd: [
    { name: 'Html', description: '웹 페이지의 구조와 내용을 정의하는 마크업 언어' },
    { name: 'Javascript', description: '웹 페이지에 동적 기능을 추가하는 프로그래밍 언어' },
    { name: 'Css/Sass/Tailwind CSS', description: '웹 페이지의 디자인과 레이아웃을 정의하는 스타일 시트 언어 Sass는 CSS의 확장으로 더 나은 유지보수성을 제공하는 전처리기' },
    { name: 'React', description: '컴포넌트 기반의 UI 개발 및 상태 관리 최적화' },
    { name: 'TypeScript', description: '정적 타이핑을 통한 코드 안정성 및 유지보수성 향상' },
    { name: 'Next.js', description: 'SSR/SSG를 통한 성능 최적화 및 SEO 대응 React 기반의 풀스택 웹 프레임워크' },
    { name: 'jQuery', description: 'DOM 조작과 이벤트 처리를 간편하게 해주는 JavaScript 라이브러리' },
    { name: 'JSON', description: '데이터 교환 형식으로 프론트엔드와 백엔드 간의 통신에 사용' },
  ],
  BackEnd: [
    { name: 'Java', description: '객체지향구조를 활용한 애플리케이션의 개발에 활용되는 프로그래밍 언어' },
    { name: 'Spring Boot', description: '견고한 비즈니스 로직 및 마이크로서비스 아키텍처 Java 기반의 웹 애플리케이션 프레임워크' },
    { name: 'MySQL/PostgreSQL', description: '데이터 모델링 및 쿼리 최적화' },
    { name: 'Node.js', description: 'Express/NestJS를 이용한 효율적인 API 서버 구축' }
  ],
  ETC: [
    { name: 'Git', description: 'GitHub Flow, Git-flow를 활용한 체계적인 버전 관리 및 협업' },
    { name: 'CI/CD', description: 'GitHub Actions, GitHub Deploy Branch, GitHub Pages를 이용한 빌드 및 배포 자동화' },
    { name: 'AI Agent', description: 'AI Agent LLM 기반의 자동화 및 지능형 개발 지원 (Gemini, ChatGPT, Claude)' },
    { name: 'VS Code', description: '효율적인 코드 작성 및 디버깅을 위한 IDE' },
    { name: 'Antigravity', description: 'AI Agent 활용하여 개발 지원 및 자동화 구현 효율적인 코드 작성 및 디버깅을 위한 IDE' }
  ]
};
