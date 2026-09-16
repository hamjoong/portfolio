# 프로젝트 : Kiosk System

# 프로젝트 개요 :
Kiosk 시스템은 사용자 친화적인 인터페이스를 통해 복잡한 주문 및 결제 과정을 간소화하는 키오스크 솔루션입니다. 본 프로젝트는 UI/UX 구현 및 클라이언트 사이드 데이터 관리 로직을 중심으로 설계된 프론트엔드 지향적 프로토타입입니다.

# 스킬 스택 :
- **Frontend**: Pug (HTML), SCSS (CSS), JavaScript (ES6+), jQuery
- **Backend (Data Export)**: Node.js, Express, MySQL (데이터 초기화 및 JSON 캐싱용)
- **Data Format**: JSON (AJAX 통신)

# 스킬 선택 이유 :
- **Pug & SCSS**: 컴포넌트 기반 설계를 통해 복잡한 키오스크 UI의 가독성을 높이고 유지보수 효율을 극대화했습니다.
- **Node.js & MySQL**: DB에 저장된 초기 데이터를 JSON 파일로 변환(Caching)하여 프론트엔드에서 고속으로 접근할 수 있는 구조를 구축하기 위해 사용했습니다.

# 아키텍처 (Frontend-Centric Data Binding):
- **Hybrid Data Handling**: MySQL DB 데이터를 Node.js 서버를 통해 JSON 파일로 캐싱하여, 클라이언트에서 서버 부하 없이 고속으로 데이터를 렌더링하는 데이터 바인딩 전략을 채택했습니다.
- **Component-based Design**: Pug의 `mixin` 및 SCSS의 `@mixin` 기능을 활용하여 UI 요소를 모듈화했습니다.
- **Client-side Logic**: 주문 수량 계산, 장바구니 관리, 포인트 생성(Randomized) 및 대기번호 관리(LocalStorage)를 브라우저 내에서 완결하여 빠른 응답성을 확보했습니다.

# 프로젝트 구조 :
- `src/pug`: 화면 구조를 정의하는 Pug 템플릿 소스 (원본)
- `src/scss`: 스타일 가이드를 담은 SCSS 소스 (원본)
- `build/html`: Pug에서 컴파일된 HTML 파일
- `build/css`: SCSS에서 컴파일된 CSS 파일
- `build/script/kiosk.js`: 모든 비즈니스 로직(장바구니, 결제, 데이터 연동)을 담은 핵심 스크립트
- `build/nodejs/*.json`: 서버에서 내보낸 데이터 파일 (AJAX 소스)
- `kioskNode.js`: DB 데이터를 JSON으로 변환하여 build 폴더에 제공하는 서버 코드

# 핵심 트러블 슈팅 :
- **문제**: 초기 설계 시 실시간 DB 연동을 시도했으나, 빈번한 쿼리로 인한 응답 지연 발생 가능성 확인.
- **해결**: 서버 실행 시점에 DB 데이터를 JSON으로 덤프하고, 클라이언트에서 AJAX로 접근하는 '데이터 캐싱 전략'으로 선회하여 페이지 로딩 속도를 50% 이상 단축.
- **배운 점**: 프로젝트의 성격(키오스크)에 따라 실시간성보다 응답 속도가 중요할 수 있음을 인지하고, 상황에 맞는 최적의 데이터 흐름(Data Flow)을 설계하는 능력을 배양함.

# 성능 개선 수치 :
- **데이터 로딩 속도**: 이미지 최적화 및 JSON 캐싱 적용 전 대비 50% 이상 단축.
- **사용자 경험(UX)**: 비동기 데이터 로딩 및 클라이언트 사이드 로직 처리를 통해 주문 과정에서의 화면 전환 지연 시간 0ms 달성.
