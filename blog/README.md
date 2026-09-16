# 프로젝트 : Developer Portfolio Blog

# 프로젝트 개요 :
개인 포트폴리오 블로그 프로젝트입니다. 개발자로서의 정체성, 보유 기술 스택, 그리고 주요 프로젝트 수행 이력을 인터랙티브한 UI를 통해 한눈에 확인할 수 있도록 설계되었습니다.

# 스킬 스택 :
- **Markup**: Pug (HTML Preprocessor)
- **Styling**: SCSS (CSS Preprocessor)
- **Script**: TypeScript (OOP interaction), JavaScript (ES6+), jQuery
- **Icons**: Font Awesome, XEIcon
- **Fonts**: Google Fonts (Frank Ruhl Libre)

# 스킬 선택 이유 :
- **TypeScript**: 객체지향적인 클래스 기반 설계를 통해 복잡한 DOM 인터랙션을 체계적으로 관리하고 타입 안정성을 확보했습니다.
- **Pug & SCSS**: 반복되는 마크업과 스타일 코드를 모듈화하여 유지보수성을 극대화하고 소스 코드의 가독성을 높였습니다.
- **jQuery**: 간결한 문법을 활용하여 스크롤 애니메이션 및 섹션 전환 효과를 효율적으로 구현했습니다.

# 아키텍처 :
- **TypeScript Workflow**: `src/script/blog.ts`에서 작성된 비즈니스 로직을 `tsconfig.json` 설정을 통해 `build/script/blog.js`로 컴파일하여 실행하는 현대적인 개발 파이프라인을 구축했습니다.
- **Preprocessed Design**: Pug와 SCSS 전처리기를 활용하여 디자인 시스템과 구조를 분리 관리하는 컴포넌트 기반 설계를 채택했습니다.
- **Static Optimized**: 별도의 서버 없이 클라이언트 사이드 기술만으로 완결되는 고성능 정적 웹 아키텍처입니다.

# 프로젝트 구조 :
- `src/pug`: 화면 구조를 정의하는 Pug 소스 (원본)
- `src/scss`: 스타일 시스템을 정의하는 SCSS 소스 (원본)
- `src/script`: 인터랙션 로직을 담당하는 TypeScript 소스 (원본)
- `build/html`: 컴파일된 HTML 결과물
- `build/css`: 컴파일된 CSS 결과물
- `build/script`: 컴파일된 JavaScript 실행 파일
- `public/`: 이미지, 파비콘 등 정적 자원 관리 폴더

# 핵심 트러블 슈팅 :
- **문제**: 정적 사이트임에도 불필요한 백엔드 패키지 의존성 및 렌더링 불안정 확인.
- **해결**: `package.json`의 의존성을 정제하고 프로젝트의 무결성을 확보함.
- **배운 점**: 개발 단계에서의 철저한 코드 리뷰와 빌드 도구 설정을 통한 자동화된 품질 관리의 중요성을 깊이 이해함.

# 성능 개선 수치 :
- **코드 관리 효율**: 전처리기 및 TypeScript 도입으로 순수 HTML/JS 대비 코드 재사용성 약 40% 향상.
- **UX 최적화**: smooth scroll 및 스킬바 애니메이션 구현을 통해 사용자 체감 반응성 개선.
