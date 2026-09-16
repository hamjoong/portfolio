# 📝 Note Pad (웹 메모장 서비스)

> 브라우저 내에서 간편하게 아이디어를 기록하고 관리할 수 있는 반응형 웹 메모장 서비스입니다.  
> 복잡한 절차 없이 직관적인 UI와 브라우저 로컬 저장소(`localStorage`)를 활용하여 빠르고 안정적인 메모 작성 및 관리 경험을 제공합니다.

---

## 🛠 Tech Stack

### Frontend & Build
- **Markup / Styling**: Pug (HTML 템플릿), SCSS (Sass), XEIcon
- **Script**: Vanilla JavaScript (ES6+), jQuery (모달 및 이벤트 바인딩)
- **Storage**: Web Storage API (`localStorage`)
- **Dev Tools / Server**: npm, simplehttpserver

---

## ✨ Key Features (주요 기능)

- **메모 작성 및 유효성 검사**: 제목과 내용 입력 유효성 체크(`trim()`) 후 빈 값 방지 및 신규 등록
- **데이터 영속성 보장**: `localStorage`를 활용하여 새로고침 또는 브라우저 재접속 시에도 작성 데이터 유지
- **메모 수정**: 기존 메모 내용을 입력창으로 불러와 즉시 재편집 및 갱신 가능
- **커스텀 삭제 모달**: 실수로 인한 데이터 유실을 방지하기 위해 사용자 확인 모달 레이어 구현 후 삭제 처리
- **템플릿 & 컴포넌트 스타일링**: Pug를 통한 효율적인 마크업 및 SCSS 구조화를 통한 유지보수성 향상

---

## 📂 Project Structure

```bash
notepad/
├── build/
│   ├── css/           # 컴파일된 스타일시트 (notepad.css)
│   ├── favicon/       # 디바이스별 파비콘 에셋
│   ├── html/          # 컴파일된 HTML (notepad.html)
│   └── script/        # 클라이언트 스크립트 (notepad.js)
├── src/
│   ├── pug/           # Pug 템플릿 소스
│   └── scss/          # SCSS 스타일 소스
├── notepaddb.js       # (실험/확장용) MySQL 연결 스크립트
├── notepadnode.js     # (실험/확장용) Express 서버 스크립트
└── package.json       # 프로젝트 의존성 및 실행 스크립트
```

---

## 🚀 Getting Started (실행 방법)

```bash
# 의존성 설치
npm install

# 정적 로컬 서버 구동 (build/html 서빙)
npm start
```
브라우저에서 안내된 로컬 주소(예: `http://localhost:포트`)로 접속하여 메모장을 확인합니다.

---

## 💡 Troubleshooting & Learnings (트러블 슈팅 및 기술적 고민)

### 1. 새로고침 시 데이터 유실 문제 해결
- **문제**: 정적 웹 페이지 특성상 브라우저를 새로고침하면 DOM에 생성되었던 메모 목록이 초기화되는 한계가 있었습니다.
- **해결**: 브라우저 내장 `localStorage`를 활용해 JSON 직렬화/역직렬화 로직(`saveNoteToStorage`, `loadNotes`)을 구축하여, 새로고침 및 재접속 후에도 메모 데이터가 안전하게 보존되도록 개선했습니다.

### 2. 메모 삭제 시 UX 개선 및 오작동 방지
- **문제**: 삭제 버튼 클릭 시 즉시 데이터가 지워져 의도치 않은 사용자의 클릭 실수로 데이터가 영구 손실될 위험이 있었습니다.
- **해결**: 브라우저 기본 `confirm()` 창 대신 웹사이트의 일관된 디자인 톤에 맞춘 커스텀 모달 레이어를 제작하여, 사용자가 한 번 더 확인한 후 안전하게 삭제되도록 UX를 향상시켰습니다.

### 3. 직관적인 코드 구조화 및 DOM 제어
- **해결**: Pug와 SCSS를 도입해 반복 코드를 줄이고 스타일 구조를 체계화했으며, Vanilla JS(데이터 처리/로컬 스토리지)와 jQuery(모달 레이어 토글/이벤트 위임)를 적재적소에 결합하여 깔끔한 DOM 조작 환경을 구현했습니다.