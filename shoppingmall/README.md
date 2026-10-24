# 쇼핑몰 이커머스 Shoppingmall

## 1. 프로젝트 소개
Next.js 15 프런트엔드와 Supabase(Auth · PostgreSQL · Edge Functions)로 만든 이커머스 포트폴리오입니다.
상품 탐색, 장바구니, 주문, 비회원 주문 조회, 리뷰·Q&A, 관리자 상품·주문 관리까지 한 흐름으로 동작합니다.

> **결제는 모의입니다.** 외부 결제 연동이 없고, 주문하면 바로 `PAID` 상태가 됩니다. 실제 청구는 일어나지 않습니다.

## 2. 주요 기능
- **인증**: Supabase Auth 이메일/비밀번호 가입·로그인, 이메일 재설정 링크로 비밀번호 찾기, 회원탈퇴
- **상품**: 카테고리, 키워드 검색(이름·설명), 옵션(복수 선택, 옵션별 재고), 최근 본 상품
- **장바구니**: 회원은 계정, 비회원은 브라우저 식별자(`x-guest-id`)로 서버에 저장하고 로그인 시 병합
- **주문**: 선택한 모든 상품을 한 번에 주문. 가격·합계는 서버(DB)가 계산하고 재고는 한 트랜잭션에서 잠금·차감
- **비회원 주문**: 주문 시 이메일과 조회 비밀번호를 받고, 주문번호 + 이메일 + 조회 비밀번호로 조회(`/orders/lookup`). 실패 사유는 구분하지 않고, 15분 안에 같은 주문번호로 10회 또는 같은 접속에서 20회 실패하면 429로 제한(오타를 고려해 넉넉하게 잡음. 접속 식별은 IP 원문이 아니라 서버 비밀 키로 만든 HMAC 해시만 저장하고 1일 뒤 삭제). 주문 90일 후 개인정보를 지우는 함수 제공(`anonymize_expired_guest_orders`, DB 관리자 세션과 Edge의 service_role만 실행할 수 있음). 운영 Supabase에서는 pg_cron 작업(`anonymize-guest-orders`, 매일 18:00 UTC)으로 매일 자동 실행하며, 등록·활성(`active = true`)을 확인했습니다. 이 저장소의 마이그레이션에는 포함되어 있지 않고 SQL Editor에서 별도로 등록한 설정입니다
- **리뷰·Q&A**: 리뷰는 본인의 결제 완료 주문에 담긴 상품만 작성 가능(주문·상품당 1건). 관리자 답변 지원
- **회원탈퇴**: 결제 완료·배송 중 주문이 있으면 거절, 관리자 계정은 거절. 처리되면 주문의 수령인·연락처·주소는 익명화하고 계정 삭제
- **관리자**: 상품 CRUD, 주문 상태 변경, 사용자 목록, 대시보드 통계(관리자는 `admin_users` 테이블 등록으로만 부여)

## 3. 기술 스택

| 구분 | 기술 |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, Zustand, TanStack Query |
| API | Supabase Edge Functions (Deno): `catalog`, `cart`, `order`, `review`, `qna`, `admin-products`, `account-withdrawal`, `health` |
| 인증 | Supabase Auth |
| Database | Supabase PostgreSQL (RLS, 제약 조건, RPC) |
| 배포 | Vercel (Frontend), Supabase (DB · Edge Functions) |

## 4. 구조

```mermaid
graph TD
    Browser --> Frontend["Next.js — Vercel"]
    Frontend -->|"로그인·가입·비밀번호 재설정"| Auth["Supabase Auth"]
    Frontend -->|"/functions/v1/*"| Edge["Edge Functions"]
    Edge -->|"service role (서버 전용)"| DB[("PostgreSQL")]
    Edge --> Auth
```

- 브라우저는 테이블을 직접 읽거나 쓰지 않고(프로필·배송지 제외) Edge Function을 거칩니다. 주문·재고·비회원 조회 정보처럼 클라이언트가 값을 정하면 안 되는 부분은 `service_role` 전용 RPC(`create_order_atomic`, `lookup_guest_order`, `anonymize_customer_account`)가 처리합니다.
- 서버 비밀 키는 Edge Function 환경(Secrets)에만 둡니다. 프런트에는 공개 URL과 publishable key만 넣습니다.
- 허용 origin은 Edge Function Secret `ALLOWED_ORIGINS`(쉼표 구분)로 지정합니다. 기본값은 `http://localhost:3000`뿐입니다.

```text
shoppingmall/
├── frontend/   # Next.js 앱 (src/app, components, hooks, services, store, utils)
├── supabase/
│   ├── functions/   # Edge Functions + _shared (http, 인증 헬퍼)
│   └── migrations/  # 순서대로 적용하는 SQL
└── docs/       # API · 아키텍처 · 기획 문서
```

## 5. 설계 메모
- **재고 정합성**: `create_order_atomic`이 상품·옵션 행을 `FOR UPDATE`로 잠근 뒤 재고를 확인·차감하고, 주문과 주문 항목을 같은 트랜잭션에 저장합니다. 판매 중(`FOR_SALE`)이 아닌 상품은 거절하고, 하나라도 실패하면 전체가 롤백됩니다. DB에는 `stock_quantity >= 0` 제약도 있습니다.
- **비회원 식별의 한계**: `x-guest-id`는 클라이언트가 만드는 값이라 장바구니 구분에만 쓰며, 주문 조회 권한으로 쓰지 않습니다.
- **잠금 순서(데드락 해결)**: 예전에는 주문 항목 순서대로 상품 행을 잠가, 두 주문이 같은 상품을 서로 반대 순서로 담으면 데드락이 났습니다(동시 테스트에서 400건 중 346건 실패, 데이터는 일관). `20261024000100_lock_products_in_order.sql`이 본 처리 전에 주문의 모든 상품 행을 `product_id` 오름차순으로 먼저 잠그도록 바꿨습니다. **운영 DB 반영 전까지는 운영에 이 수정이 적용되지 않은 상태입니다.**
- **데모 개인정보**: 주문 화면에 가상 정보만 입력하라는 안내와 예시 입력값을 두었습니다. 비회원 주문 정보는 90일이 지나면 pg_cron 작업이 익명화합니다(운영 등록 확인. SQL Editor에서 함수를 직접 호출해 익명화 동작을 확인했고, 크론 자동 실행 이력은 아직 확인하지 않았습니다).
- **마이그레이션**: 이미 적용된 파일은 고치지 않고 새 파일로 덮습니다. 과거 파일에는 더는 쓰지 않는 계정 연결(`auth_user_mappings`) 흔적이 남아 있습니다. 새 프로젝트로 옮길 때 하나로 합치는 것을 고려합니다.

## 6. 실행 및 검증

요구사항: Node.js 20 이상, Supabase 프로젝트(또는 Supabase CLI + Docker)

```bash
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 입력
npm install
npm run dev
```

```bash
cd frontend && npm run lint && npm run build            # 프런트 검사
cd supabase/functions/_shared && node --test *.test.mjs # 공용 인증 로직 단위 테스트
```

### 검증 범위
- 확인함: 프런트 `lint`/`tsc`/`build`, 공용 인증 로직 단위 테스트 7건, Edge Function 소스의 문법 검사
- 확인함: (로컬 PostgreSQL 17 컨테이너 + 최소 Supabase 스텁): 마이그레이션 16개가 순서대로 오류 없이 적용됨. `supabase/tests/concurrent_order_test.sh`(Docker 필요)로 `create_order_atomic`을 pgbench로 동시에 호출해 확인
  - 재고 10인 상품에 30명이 동시에 1개씩 주문: 10건 성공, 20건 재고 부족, 남은 재고 0(초과 판매 없음)
  - 옵션 재고 10에 30명이 동시 주문: 같은 결과, 옵션 주문은 상품 재고를 건드리지 않음
  - 한 주문의 두 번째 항목이 재고 부족이면 첫 항목의 재고 차감까지 롤백됨
  - 항목 순서가 서로 반대인 주문(A,B / B,A)을 20명이 동시에 400건 시도: 수정 전 스키마(마이그레이션 15개)에서는 54건 성공, 346건이 데드락(40P01)으로 실패(재고는 `1000 - 저장된 주문 수`로 일치). 잠금 순서 수정 후에는 400건 모두 성공, 데드락 0건. 테스트가 데드락 0건을 검사하므로 수정 전 스키마에서는 실패합니다(`MIGRATIONS_DIR`로 폴더를 바꿔 확인 가능)
- **확인하지 못함**: Edge Function 실제 실행(Deno), 실제 Supabase 프로젝트에서의 마이그레이션 적용과 동시 주문, 브라우저 동작 전반. 위 테스트는 Edge Function을 거치지 않고 DB 함수만 직접 호출하며, 두 상품에 요청을 집중시킨 극단적 조건입니다.
- 성능 수치(LCP, 응답 시간 등)는 측정한 적이 없어 싣지 않습니다.

## 7. 링크
- Frontend (Vercel): https://shoppingmall-beta.vercel.app/
