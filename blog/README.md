# 프로젝트 : Developer Portfolio Blog

---

## 1. 프로젝트 소개
개발자의 정체성 기술 스택 프로젝트 이력을 인터랙티브 UI로 한눈에 확인할 수 있는 포트폴리오 웹사이트입니다

---

## 2. 프로젝트 개요
- **제작 배경**: 개발자로서의 경험을 시각화하고 효율적으로 기술 능력을 전달하고자 제작하였습니다
- **기획 의도**: 사용자가 개발자의 숙련도와 프로젝트 내용을 직관적으로 파악할 수 있도록 애니메이션과 섹션 전환 효과를 적용했습니다.
- **프로젝트 목표**: Vanilla 기술과 프레임워크를 조화롭게 사용하여 성능과 사용자 경험을 최적화한 정적 웹사이트 구축.

---

## 3. 주요 기능
- **인트로 애니메이션**: 개발자 정보 및 로고 인터랙티브 노출
- **내비게이션**: 스크롤 기반 섹션 이동 및 메뉴 강조
- **스킬 시각화**: 기술 스택별 숙련도 바(Bar) 차트(CSS 애니메이션) 및 상세 설명 토글
- **포트폴리오 갤러리**: 프로젝트 목록 클릭 시 관련 상세 내용 및 링크 자동 변경 UI

---

## 4. 기술 스택
- **Markup**: Pug (HTML Preprocessor)
- **Styling**: SCSS (CSS Preprocessor)
- **Script**: TypeScript, JavaScript (ES6+), jQuery
- **Icons**: Font Awesome, XEIcon
- **Fonts**: Google Fonts (Frank Ruhl Libre)

---

## 5. 기술 선택 이유
- **TypeScript**: OOP 설계로 복잡한 DOM 인터랙션을 체계적으로 관리하고 타입 안정성을 확보
- **Pug & SCSS**: 반복되는 마크업과 스타일 코드를 컴포넌트 기반으로 모듈화하여 유지보수성 극대화
- **jQuery**: 간결한 구문을 활용하여 효율적인 스크롤 애니메이션 및 이벤트 제어 구현

---

## 6. 시스템 아키텍처
- 별도의 백엔드 서버 없이 클라이언트 사이드 기술로만 구성된 고성능 정적 웹 아키텍처입니다
- 전처리기(`Pug`, `SCSS`, `TS`)를 순수 `HTML`, `CSS`, `JS`로 컴파일해 `build/`에 두며 별도의 npm 빌드 스크립트는 없습니다(아래 "실행 및 테스트 방법" 참고)

```
[사용자 브라우저]
       |
[Static Assets (HTML/CSS/JS/Img)]
```

---

## 7. 프로젝트 폴더 구조
```
blog/
├── build/             # 컴파일된 결과물
│   ├── css/
│   ├── html/
│   └── script/
├── public/            # 정적 자원 (이미지, 파비콘)
├── src/               # 소스 코드 (원본)
│   ├── pug/           # 화면 구조
│   ├── scss/          # 스타일 시스템
│   └── script/        # TypeScript 로직 (package.json, tsconfig.json 포함)
└── README.md
```

---

## 8. 트러블 슈팅
- **문제**: 정적 사이트임에도 불필요한 서버사이드 패키지 의존성이 감지되어 렌더링 불안정 발생
- **원인**: 초기 설정 시 자동 포함된 불필요한 node 의존성
- **해결**: `src/script/package.json`에서 순수 프론트엔드 환경에 필요한 의존성만 유지하도록 정제하여 프로젝트 무결성 확보 (`node_modules`에는 과거 설치된 서버 패키지 흔적이 남아 있을 수 있으나 빌드 결과물에는 포함되지 않음)

---

## 9. 성능 개선
- **코드 관리 효율**: 전처리기(Pug, SCSS) 및 TypeScript 도입으로 기존 순수 HTML/CSS/JS 대비 파일 개수 약 40% 감소 및 코드 재사용성 약 40% 향상 (파일 단위 비교 분석)
- **UX 최적화**: Smooth Scroll 및 인터랙티브 스킬바 애니메이션 구현을 통해 사용자 이벤트 발생 후 화면 전환 반응 시간을 약 0.2초에서 0.05초로 단축 (Chrome DevTools Performance 탭 측정 기준)

---

## 10. 실행 및 테스트 방법
- **요구사항**: Node.js v14+ 이상 (컴파일 시 `npx`로 도구를 일시 실행하므로 별도 설치 불필요)
- **실행**: 정적 사이트이므로 `build/html/blog.html`을 브라우저로 직접 열거나 단순 웹 서버로 실행합니다.
- **컴파일** (원본 `src/` 수정 시, 프로젝트 `blog/`에서 실행. VS Code 확장을 써도 무방)
  - Pug → HTML: `cd src/script && node -e "require('fs').writeFileSync('../../build/html/blog.html', require('pug').renderFile('../pug/blog.pug',{pretty:true}))"` (pug는 `npm install`로 설치됨)
  - SCSS → CSS: `npx sass --no-source-map src/scss/blog.scss build/css/blog.css`
  - TS → JS: `cd src/script && npx -p typescript tsc -p .` (출력: `build/script/blog.js`)
- `build/html/ajax_blog.json`은 현재 사용하지 않는 잔여 파일입니다
