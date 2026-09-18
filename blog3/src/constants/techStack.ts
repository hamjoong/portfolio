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
    { name: 'Javascript', description: '웹 페이지에 동적 기능을 추가하는 프로그래밍 언어' },
    { name: 'TypeScript', description: '정적 타이핑을 통한 코드 안정성 및 유지보수성 향상' },
    { name: 'Tailwind CSS', description: '반응형 웹 디자인을 빠르고 효율적인 UI 개발을 쉽게 구현할 수 있는 CSS프레임워크'},
    { name: 'React', description: '컴포넌트 기반의 UI 개발 및 상태 관리 최적화' },
    { name: 'Next.js', description: 'SSR/SSG를 통한 성능 최적화 및 SEO 대응 React 기반의 풀스택 웹 프레임워크' },
  ],
  BackEnd: [
    { name: 'Java', description: '객체지향구조를 활용한 애플리케이션의 개발에 활용되는 프로그래밍 언어' },
    { name: 'Spring Boot', description: '견고한 비즈니스 로직 및 마이크로서비스 아키텍처 Java 기반의 웹 애플리케이션 프레임워크' },
    { name: 'MySQL/PostgreSQL', description: '데이터 모델링 및 쿼리 최적화' },
    { name: 'Node.js', description: 'Express/NestJS를 이용한 효율적인 API 서버 구축' },
  ],
  ETC: [
    { name: 'CI/CD', description: 'GitHub Actions, GitHub Deploy Branch, GitHub Pages를 이용한 빌드 및 배포 자동화' },
    { name: 'Visual Studio Code/Antigravity IDE', description: '가벼운 텍스트 에디터의 속도와 강력한 IDE 기능을 결합하여 효율적인 개발 환경을 제공' },
    { name: 'AI Agent', description: 'AI Agent Large Language Model 기반의 인공지능 에이전트 외부 개입 없이 독립적으로 추론하고 행동하는 자율형 소프트웨어 시스템입니다' },
  ]
};
