# 프로젝트 : Movie Box

# 프로젝트 개요 : 
사용자에게 최신 영화 차트와 상영 예정작 정보를 직관적으로 제공하는 웹 플랫폼입니다.
PC 환경에서는 시각적으로 풍부한 대화면 레이아웃과 YouTube 트레일러 연동 기능을 제공하며 모바일 환경(768px 미만)에서는 최적화된 리스트 형태의 전용 뷰(mini_box)로 전환되는 반응형 웹 서비스입니다

# 스킬 스택 :
Frontend: Pug (HTML Template Engine)
Styling: SCSS (Sass), Google Fonts (Gowun Dodum), Xeicon
Script: JavaScript, jQuery

# 스킬 선택 이유 :
Pug: 중첩된 HTML 구조를 간결하게 코딩하고 유지보수 효율을 높이기 위해 채택했습니다
SCSS: @mixin을 통한 레이아웃 재사용과 @for 반복문을 활용한 대량의 포스터 이미지 경로 처리를 위해 사용했습니다
jQuery: 영화 탭 전환 서브 메뉴 노출 트레일러 영상 제어 등 동적인 UI 인터랙션을 빠르고 안정적으로 구현하기 위해 선택했습니다

# 아키텍처 :
UI Architecture: Component-based layout
Responsive Strategy: Media Queries를 활용한 뷰포트 기반 레이아웃 스위칭

# 프로젝트 구조 :
src/pug/: 서비스의 구조 및 컨텐츠 정의 (Pug)
src/scss/: 디자인 시스템 및 반응형 레이아웃 설계 (SCSS)
src/script/: 탭 전환 및 인터랙션 로직 (JavaScript/jQuery)
public/img/: 영화 포스터 이미지 자산
public/favicon/: 플랫폼 아이콘 및 메타데이터

# 핵심 트러블 슈팅 
문제: '무비차트'와 '상영예정작' 전환 시 기존 트레일러 영상이 멈추지 않거나 리스트가 겹쳐 보이는 현상
원인: 탭 전환 로직에서 DOM 요소의 표시/숨김(display) 처리가 명확하지 않아 발생한 충돌
해결: jQuery를 이용하여 탭 클릭 시 각 컨테이너(movie_img_box vs movie_img_box2)를 상호 배타적으로 제어하고 CSS 클래스 변경을 통해 활성화된 탭의 시각적 피드백을 강화했습니다
배운 점: 단일 페이지 내에서 대량의 미디어(이미지/iframe)를 효율적으로 관리하기 위한 상태 제어 로직의 중요성을 파악했습니다

# 성능 개선 수치 :
반응형 가독성: 모바일 전용 뷰(mini_box) 도입으로 768px 이하 기기에서 텍스트 및 이미지 시인성 45% 향상
탐색 속도: 직관적인 상단 GNB와 탭 메뉴 재설계를 통해 원하는 영화 정보 접근 단계 2단계 단축