# ☕ Smart Kiosk System

Node.js와 Express를 활용하여 구축한 카페 및 음식점용 키오스크 시스템입니다. 주문 처리와 포인트 적립, 메뉴 관리 기능을 포함합니다.

## 🛠 Tech Stack
- **Server**: Node.js, Express
- **View Engine**: EJS (Embedded JavaScript)
- **Database**: Local JSON Storage / In-memory DB (MySQL/PostgreSQL Ready)
- **Middleware**: Body-parser, Cookie-parser, Connect-multiparty

## ✨ Key Features
- **Order Management**: 실시간 메뉴 선택 및 주문 총액 계산.
- **Point System**: 사용자별 포인트 적립 및 사용 내역 관리.
- **Menu Administration**: 관리자 페이지를 통한 메뉴 등록 및 수정 (이미지 업로드 포함).
- **Responsive Web UI**: 매장 내 대형 스크린과 모바일 기기를 모두 지원하는 UI.

## 🚀 Installation & Run
```bash
cd kiosk
npm install
node kioskNode.js
```

---
*본 프로젝트는 실시간 데이터 처리와 Node.js의 이벤트 루프 구조를 이해하기 위한 풀스택 프로젝트입니다.*
