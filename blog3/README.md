# 프로젝트 : Modern Dev Portfolio (Blog3)

# Live Demo
- [Live Demo (GitHub Pages)](https://hamjoong.github.io/portfolio/blog3/)

# 프로젝트 개요 : 
개인 포트폴리오 블로그 입니다.
기술의 본질을 탐구하는 개발자의 정체성을 담은 현대적인 포트폴리오 사이트입니다.
단순히 정보를 나열하는 이력서 스타일을 벗어나 Framer Motion을 활용한 생동감 있는 인터랙션과 TypeScript를 통한 안정적인 구조 설계를 통해 방문자에게 신뢰감 있는 사용자 경험(UX)을 제공합니다.

# 스킬 스택 :
Frontend: React 18, TypeScript, Vite
Styling: SCSS (BEM Methodology), Sass
Animation: Framer Motion
Icons: Lucide React
Deployment: GitHub Actions, GitHub Pages (Custom Workflow)

# 스킬 선택 이유 :
Vite: Webpack 대비 압도적인 개발 서버 속도와 빌드 효율성을 위해 선택했습니다.
TypeScript: 전역 타입 정의를 통해 데이터 구조를 명확히 하고 개발 단계에서 오류를 방지하여 프로젝트의 안정성을 높였습니다.
SCSS: 변수(Variables)와 믹스인(Mixins)을 활용해 디자인 시스템을 체계적으로 관리하고 코드 재사용성을 극대화했습니다.
Framer Motion: 선언적인 애니메이션 구현을 통해 복잡한 인터랙션을 직관적인 코드로 관리하며 웹사이트에 생동감을 불어넣었습니다.

# 실행 방법 :
1. # 저장소 복제
2. git clone https://github.com/hamjoong/portfolio.git
3. # 프로젝트 폴더로 이동
4. cd portfolio/blog3
5. # 의존성 설치
6. npm install
7. # 개발 서버 실행
8. npm run dev

# 아키텍처 :
SPA (Single Page Application): Vite 기반의 단일 페이지 애플리케이션으로 빠른 전환 제공.
Data-Driven UI: 프로젝트 리스트 및 기술 스택 정보를 constants로 분리하여 관리 UI 로직과 데이터를 분리한 유지보수 용이한 구조.
Component-Based Style: 각 컴포넌트별로 독립적인 SCSS 파일을 사용하여 스타일 간섭을 방지.

# 프로젝트 구조 :
src/components: 기능별 섹션 컴포넌트 (Intro, TechStack, Projects, Contact 등)
src/constants: 프로젝트 데이터 및 기술 스택 정보 관리
src/styles: 전역 변수 및 컴포넌트별 독립 스타일 시트
src/types: TypeScript 인터페이스 정의
public/404.html: GitHub Pages 배포 시 라우팅 충돌 방지를 위한 리다이렉션 스크립트

# 핵심 트러블 슈팅 
문제: GitHub Pages SPA 라우팅 이슈 서브 디렉토리 경로(/portfolio/blog3/)에서 새로고침 시 GitHub Pages 서버가 경로를 찾지 못하고 404 에러를 반환하는 문제 발생.
원인: 정적 호스팅 서비스인 GitHub Pages는 SPA의 클라이언트 사이드 라우팅을 인식하지 못함.
해결: public/404.html에 리다이렉션 스크립트를 작성하여 모든 잘못된 경로 요청을 메인 페이지로 전달하고, vite.config.ts의 base 설정을 통해 서브 경로를 정확히 명시함.
배운 점: 정적 호스팅 환경에서 SPA를 안정적으로 배포하기 위한 경로 제어 전략과 호스트 서버의 동작 방식을 깊이 이해하게 됨.

# 성능 개선 수치 :
빌드 속도: Vite 도입을 통해 기존 Webpack 기반 프로젝트 대비 빌드 속도 약 3배 향상.
렌더링 최적화: Framer Motion의 whileInView 속성을 활용하여 뷰포트에 진입할 때만 애니메이션이 작동하도록 설계 불필요한 리소스 낭비 방지.
컴포넌트 효율: React.useMemo 등을 활용하여 불필요한 연산을 방지하고 데이터 렌더링 성능 최적화.