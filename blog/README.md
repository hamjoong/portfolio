# 프로젝트 : Developer Portfolio Blog

# 프로젝트 개요 : 
개인 포트폴리오 블로그 입니다.
개발자로서의 정체성, 보유 기술 스택, 그리고 그동안 진행해온 주요 프로젝트들을 한눈에 확일할 수 있도록 인터렉티브하게 설계되었습니다.

# 스킬 스택 :
Markup: Pug (HTML Preprocessor)
Styling: SCSS (CSS Preprocessor)
Script: JavaScript (ES6+), jQuery, TypeScript
Icons: Font Awesome, XEIcon
Fonts: Google Fonts (Montserrat, Lato)

# 스킬 선택 이유 :
Pug (HTML 전처리기): 반복되는 HTML 구조를 간소화하고 가독성을 높여 유지보수 효율을 극대화하기 위해 선택했습니다.
SCSS (CSS 전처리기): Mixin, 변수, 중첩 기능을 활용해 복잡한 스타일 코드를 체계적으로 관리하고 재사용성을 높였습니다.
TypeScript: JavaScript의 유연함에 타입 안정성을 더해 런타임 에러를 방지하고 더 견고한 인터랙션을 구현했습니다.
jQuery: 간결한 문법으로 DOM을 조작하고, 스크롤 애니메이션 및 토글 효과를 부드럽게 구현하기 위해 사용했습니다.

# 아키텍처 :
Static Site Architecture: 별도의 서버 없이 클라이언트 사이드 기술만으로 구성된 정적 웹사이트입니다.
Source (src/): 개발자가 작성하는 원본 코드 (Pug, SCSS, TS)
Build (build/): 브라우저가 해석할 수 있도록 컴파일된 코드 (HTML, CSS, JS)
Public (public/): 이미지, 파비콘 등 정적 자원 관리

# 프로젝트 구조 :
portfolio/blog2/
├── build/             # 컴파일된 결과물 (HTML, CSS, JS)
│   ├── css/           # SCSS에서 컴파일된 CSS 파일
│   ├── html/          # Pug에서 컴파일된 HTML 파일
│   └── script/        # JavaScript 실행 파일
├── public/            # 정적 자원 (Images, Favicons)
│   ├── favicon/       # 파비콘 아이콘
│   └── img/           # 포트폴리오 및 프로필 이미지
└── src/               # 개발 소스 파일
    └── build/         # 컴파일된 결과물 (CSS)
    └── pug/           # Pug 템플릿 파일
    └── script/        # JavaScript 파일
    └── scss/          # SCSS 스타일 파일

# 핵싱 트러블 슈팅
1. 문제: 다량의 포트폴리오 정보 노출 시 가독성 저하
원인: 여러 프로젝트의 상세 설명이 한 페이지에 모두 노출되어 화면이 복잡해짐.
해결: jQuery의 `toggle()`과 `not().hide()` 기능을 활용해, 리스트를 클릭했을 때만 해당 프로젝트의 이미지와 설명이 나타나는 아코디언/탭 방식을 적용했습니다.
배운 점: 많은 정보를 효과적으로 전달하기 위해서는 UI/UX 관점에서의 '선택과 집중'이 중요하다는 것을 깨달았습니다.

2. 문제: 반복되는 스타일 코드 관리의 어려움
원인: 섹션별로 유사한 레이아웃이 반복되면서 CSS 파일의 크기가 비대해짐.
해결: SCSS의 `@mixin` 기능을 사용하여 공통 레이아웃(Box, Intro, Flex)을 모듈화하고 필요한 곳에 `@include`로 호출하여 코드양을 획기적으로 줄였습니다.
배운 점: 전처리기를 활용한 모듈화 프로그래밍이 협업과 유지보수에 얼마나 큰 이점을 주는지 체감했습니다.

# 성능 개선 수치 :
코드량 감소: Pug와 SCSS 도입으로 순수 HTML/CSS 작성 대비 **약 30% 이상의 코드 라인 단축**.
가시성 향상: 스킬바(Skill Bar) 애니메이션 적용으로 보유 기술의 숙련도를 시각적으로 직관적이게 표현 (Lighthouse 접근성 점수 향상 목표).