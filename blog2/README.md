# 프로젝트 : Developer Portfolio Blog

# 프로젝트 개요 :
개인 포트폴리오 블로그 입니다.
개발자로서의 정체성, 보유 기술 스택, 그리고 그동안 진행해온 주요 프로젝트들을 한눈에 확일할 수 있도록 인터렉티브하게 설계되었습니다.
방문자에게 깔끔하고 전문적인 인상을 주기 위해 모던한 UI 디자인을 채택했으며, 다양한 디바이스에 대응하는 반응형 웹 기술을 적용했습니다.

# 스킬 스택 :
Markup: Pug (HTML Preprocessor)
Styling: SCSS (CSS Preprocessor), Bootstrap 5
Script: JavaScript (ES6+), jQuery
Icons: Font Awesome, XEIcon
Fonts: Google Fonts (Montserrat, Lato)

# 스킬 선택 이유 :
Pug & SCSS: 단순 반복되는 HTML/CSS 코드를 믹스인(Mixins)과 변수를 통해 모듈화하여 코드의 가독성을 높이고 유지보수 시간을 단축하기 위해 선택했습니다.
Bootstrap 5: 검증된 레이아웃 시스템과 모달(Modal), 내비게이션 바 등의 컴포넌트를 활용하여 개발 속도를 높이고 디자인의 일관성을 유지했습니다.
jQuery: 복잡한 DOM 조작과 애니메이션, 이벤트 처리를 보다 간결하고 직관적인 코드로 구현하기 위해 사용했습니다.
Google Fonts & Icons: 시각적으로 풍부하고 전문적인 느낌을 주기 위해 웹 폰트와 고품질 아이콘 라이브러리를 적극 활용했습니다.

# 아키텍처 :
Static Site Architecture: 별도의 서버 없이 클라이언트 사이드 기술만으로 구성된 정적 웹사이트입니다.
Source (src/): 개발자가 작성하는 원본 코드 (Pug)
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
    └── pug/           # Pug 템플릿 파일

# 핵심 트러블 슈팅 
문제: 포트폴리오 항목이 많아짐에 따라 HTML 소스 코드가 비대해지고 가독성이 떨어지는 현상 발생.
원인: 반복되는 이미지 경로, 제목, 설명 등이 포함된 모달 구조가 소스 코드의 절반 이상을 차지함.
해결: Pug의 SCSS `mixin` 기능을 도입하여 `portfolio-item`과 `portfolio-modal`이라는 템플릿 함수를 정의. 데이터만 파라미터로 전달하여 코드를 80% 이상 슬림화함.
배운 점: 전처리기를 활용한 모듈화 작업이 대규모 마크업 작업에서 얼마나 생산성을 높여주는지 체감할 수 있었습니다.

# 성능 개선 수치 :
이미지 로딩 최적화: 모든 이미지에 `loading='lazy'` 속성을 적용하여 초기 로딩 속도를 개선하고 불필요한 네트워크 대역폭 낭비를 방지했습니다.
리소스 경량화: SCSS의 중첩 구조와 변수를 활용하여 CSS 선택자의 중복을 줄이고 코드 효율을 높였습니다.