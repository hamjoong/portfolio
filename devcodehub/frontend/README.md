# DevCodeHub Frontend

React 19 + TypeScript + Vite 기반 클라이언트입니다. 전체 프로젝트 소개와 실행 방법은 [루트 README](../README.md)를 참고하세요.

## 실행

```bash
npm install
npm run dev        # http://localhost:5173 — /api 요청은 localhost:8080으로 프록시됩니다
```

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입 검사(`tsc -b`) + 프로덕션 빌드 |
| `npm run lint` | ESLint |
| `npm run preview` | 빌드 결과 미리보기 |

자동화 테스트는 아직 없습니다. 변경 후에는 `lint`와 `build`로 검증합니다.

## 환경변수 (`.env`, Vite는 `VITE_` 접두사만 노출)

| 변수 | 설명 |
| --- | --- |
| `VITE_API_SERVER_URL` | 백엔드 주소. 비워 두면 같은 출처의 `/api/v1`(개발 시 Vite 프록시)을 사용 |
| `VITE_PORTONE_STORE_ID` | PortOne 상점 ID (테스트 결제) |
| `VITE_PORTONE_CHANNEL_KEY` | PortOne 채널 키 |

## 폴더 구조

```text
src/
├── components/   # 재사용 컴포넌트 (layout, common, chat, dashboard, admin)
├── pages/        # 라우트 단위 페이지 (lazy 로딩)
├── services/     # axios 인스턴스(api.ts), STOMP 클라이언트(stompClient.ts), 상수
├── store/        # Zustand 스토어 (auth, chat, notification, toast)
└── utils/        # 경로 유틸 등
```

## 구현 메모
- **STOMP 클라이언트**는 앱 전체에서 하나만 쓰고(`App.tsx`가 로그인 상태에 맞춰 연결/해제), 각 화면은 구독만 등록합니다. 재연결하면 등록된 구독을 자동으로 복구합니다. 게스트는 연결하지 않습니다.
- **모바일**: 사이드바는 `lg` 미만에서 햄버거로 여는 서랍이고, 채팅은 목록/대화창이 번갈아 보입니다. 표는 가로 스크롤 영역으로 감쌌습니다.
- **결제**: PortOne V2 SDK. 모바일 리다이렉트로 돌아오면 `paymentId`(V2) 또는 `imp_uid`(V1) 쿼리를 읽어 서버에 검증을 요청합니다.
