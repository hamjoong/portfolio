# 프로젝트 : Milk Tycoon 짜요 타이쿤 리마스터

# [ Live Demo ]
- https://hamjoong.github.io/portfolio/milktycoon/ (https://hamjoong.github.io/portfolio/milktycoon/)

# 프로젝트 개요 : 
추억의 피처폰 게임 '짜요 타이쿤'을 현대적인 감각으로 재해석한 2.5D 모바일 하이브리드 게임입니다<br>
React와 TypeScript를 기반으로 강력한 상태 관리와 부드러운 애니메이션을 결합하여 웹과 모바일(Capacitor) 환경 모두에서 쾌적한 플레이 경험을 제공하며 젖소 관리, 우유 가공, 시장 시세 대응, 목장 방어 등 다채로운 타이쿤 요소를 포함하고 있습니다

# 스킬 스택 :
- Frontend: React 19, TypeScript, Vite
- State Management: Zustand (with Persist Middleware)
- Animation: Framer Motion
- Styling: Tailwind CSS
- Icons: Lucide React
- Mobile Hybrid: Capacitor (Android, iOS)
- Build & Dev: PostCSS, Autoprefixer

# 스킬 선택 이유 :
- React 19 & Vite: 최신 리액트 기능을 활용한 효율적인 렌더링과 Vite의 빠른 HMR을 통해 개발 생산성을 극대화했습니다
- Zustand: Redux보다 가볍고 직관적인 상태 관리를 위해 선택했습니다 특히 persist 미들웨어를 사용하여 별도의 백엔드 없이도 사용자의 게임 진행 데이터가 브라우저에 자동 저장되도록 구현했습니다
- Framer Motion: 타이쿤 게임의 핵심인 '손맛'과 시각적 피드백(팝업, 부유 애니메이션)을 물리 기반 애니메이션으로 자연스럽게 구현하기 위해 사용했습니다
- Capacitor: 웹 기술만으로 네이티브 기능을 활용하여 구글 플레이스토어나 앱스토어에 즉시 배포 가능한 하이브리드 구조를 갖추기 위해 도입했습니다
- Tailwind CSS: 2.5D 스타일의 UI 레이아웃과 반응형 디자인을 빠르게 구축하기 위해 선택했습니다

# 실행 방법 :
1. # 의존성 설치
2. npm install
3. # 개발 서버 실행
4. npm run dev
5. # 빌드
6. npm run build
7. # 모바일 환경 동기화 (Capacitor 설치 후)
8. npx cap copy

# 아키텍처 :
- Component-Based Architecture: 화면(Screen), 모달(Modal), 게임 오브젝트(Cow, Wolf, Player)를 모듈화하여 재사용성을 높였습니다
- Hook-Driven Logic: useGameLoop 커스텀 훅을 통해 1초 단위의 게임 틱(Tick)을 관리하며 시세 변동과 자원 생산 로직을 UI와 분리했습니다
- Centralized State: useGameStore(게임 데이터), useUserStore(사용자 정보), useUIStore(모달 상태)로 스토어를 분리하여 관심사를 분리했습니다

# 프로젝트 구조 :
- src/components: UI 스크린, 기능별 모달, 2.5D 아이소매트릭 에셋
- src/hooks: 메인 게임 루프 및 실시간 로직
- src/store: Zustand 기반 전역 상태 관리 및 데이터 영속화
- src/types: 게임 내 인터페이스 및 상수 정의
- src/utils: 밸런스 계산 및 유틸리티 함수

# 핵심 트러블 슈팅 
- 문제: 잦은 상태 업데이트로 인한 성능 저하<br>
현상: 많은 수의 젖소가 동시에 게이지를 업데이트하고 애니메이션이 겹칠 때 프레임 드랍 발생<br>
원인: Zustand 스토어의 거대한 상태 객체를 통째로 구독하여 불필요한 리렌더링이 발생함<br>
해결: Selector 패턴(useGameStore(state => state.cows))을 적용하고 React.memo를 통해 개별 젖소 컴포넌트의 렌더링을 최적화했습니다<br>
배운 점: 상태 관리 라이브러리 사용 시 데이터의 원자적 구독(Atomic Subscription)이 성능에 미치는 영향을 깊이 이해하게 되었습니다<br>

- 문제: 모바일 환경에서의 초기 로딩 지연<br>
현상: 게임 에셋(SVG, 컴포넌트)이 많아지면서 초기 진입 시 하얀 화면이 오래 지속됨<br>
원인: 모든 모달과 화면이 하나의 번들에 포함되어 초기 로딩 시 부하가 걸림<br>
해결: React.lazy와 Suspense를 도입하여 상점, 업적, 설정 등의 모달을 코드 스플리팅(Code Splitting) 처리했습니다<br>
배운 점: 하이브리드 앱 개발 시 초기 번들 크기 관리의 중요성을 깨닫고 전략적인 지연 로딩 방식을 익혔습니다<br>

# 성능 개선 수치 :
- 초기 로딩 속도: 코드 스플리팅 적용 후 첫 화면 렌더링 시간 약 40% 단축
- UI 반응성: 최적화된 상태 구독 방식을 통해 다수의 오브젝트 존재 시에도 60FPS 유지
- 데이터 보존: Zustand Persist를 통해 새로고침이나 앱 종료 후에도 데이터 복구율 100%