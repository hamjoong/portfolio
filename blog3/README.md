# 프로젝트 : Modern Dev Portfolio

## 1. 프로젝트 개요
기술의 본질을 탐구하고, 사용자에게 가치를 전달하는 개발자의 정체성을 담은 현대적인 포트폴리오 사이트입니다. 단순한 정보 나열을 넘어, 직관적인 인터랙션과 안정적인 구조 설계를 통해 방문자에게 신뢰감 있는 사용자 경험(UX)을 제공하는 것을 목적으로 합니다.

## 2. 주요 기능
- **섹션별 사용자 경험 최적화**: Intro, TechStack, Projects, Contact 등 논리적인 흐름으로 구성하여 방문자에게 명확한 정보 전달.
- **인터랙티브 UI**: Framer Motion을 활용한 부드러운 애니메이션 적용으로 시각적 몰입도 향상.
- **데이터 기반 구조**: 프로젝트 정보 및 기술 스택을 별도 관리하여 유지보수 용이성 확보.

## 3. 기술 스택 및 이유
- **Frontend**: React 18, TypeScript, Vite
  - **Vite**: 개발 속도 및 빌드 효율 최적화.
  - **TypeScript**: 데이터 구조의 명확화 및 개발 단계의 오류 방지.
- **Styling**: SCSS (BEM Methodology), Sass
  - **SCSS**: 디자인 시스템의 체계적 관리 및 코드 재사용성 극대화.
- **Animation**: Framer Motion
  - **Framer Motion**: 선언적 애니메이션 구현 및 동적 UX 강화.
- **Deployment**: GitHub Actions, GitHub Pages
  - **GitHub Actions**: 배포 자동화를 통한 워크플로우 효율성 증대.

## 4. 아키텍처
- **SPA (Single Page Application)**: Vite 기반의 단일 페이지 애플리케이션으로 빠른 전환 환경 제공.
- **Component-Based Style**: 각 컴포넌트별 독립적인 SCSS 파일을 사용하여 스타일 간섭 방지.

## 5. 실행 방법
```bash
# 저장소 복제
git clone https://github.com/hamjoong/portfolio.git

# 프로젝트 폴더로 이동
cd portfolio/blog3

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 6. 핵심 트러블 슈팅
- **GitHub Pages SPA 라우팅 이슈**
  - **문제**: 서브 디렉토리(/portfolio/blog3/)에서 새로고침 시 GitHub Pages 404 에러 발생.
  - **해결**: `public/404.html`에 리다이렉션 스크립트를 추가하여 모든 잘못된 경로를 메인 페이지로 전달하고, `vite.config.ts`에 `base` 경로를 명시하여 라우팅 안정성 확보.

## 7. 성능 개선 수치
- **빌드 속도**: 기존 Webpack 대비 약 3배 향상.
- **렌더링 최적화**: `whileInView` 활용 및 `useMemo` 등으로 리소스 낭비 최소화.
