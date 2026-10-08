# TRD - 쇼핑몰 기술 구조

## 구조
- 프런트엔드: Next.js 15 (App Router, TypeScript), Vercel
- 인증: Supabase Auth (이메일/비밀번호, 이메일 재설정)
- API: Supabase Edge Functions (Deno)
- 데이터: Supabase PostgreSQL — RLS, 제약 조건, 단일 트랜잭션 RPC
- 검색: PostgreSQL `ILIKE` (이름·설명)
- 장바구니: PostgreSQL `cart_items`. 회원은 Auth UID, 비회원은 `x-guest-id`

## 요구사항
1. 모든 테이블에 RLS를 켜고, 서버 키(service role)는 Edge Secret에만 둡니다. 클라이언트가 보낸 role로 인가하지 않습니다.
2. 주문 생성·재고 차감은 하나의 PostgreSQL 함수(`create_order_atomic`)에서 처리합니다. 가격은 DB 값으로 계산하고, 판매 중이 아닌 상품은 거절합니다.
3. 비회원 주문은 이메일 + 조회 비밀번호(bcrypt)를 저장하고, 주문번호 + 이메일 + 비밀번호로만 조회합니다. 실패 사유는 구분하지 않고 시도 횟수를 제한합니다. 90일 후 개인정보를 지웁니다.
4. 회원탈퇴는 진행 중 주문이 없을 때만 허용하고 주문 개인정보는 익명화합니다. 관리자 계정은 탈퇴할 수 없습니다.
5. 임시 비밀번호를 응답으로 돌려주지 않고 이메일 재설정 링크만 씁니다.
6. 결제는 모의입니다. 환불·취소는 제공하지 않습니다.
7. 목록 API는 페이지 크기 상한을 둡니다.

## 배포 전제
- Supabase CLI 등으로 마이그레이션을 순서대로 적용하고 Edge Function을 배포합니다.
- Edge Secret: `ALLOWED_ORIGINS`(배포 도메인), 서버 키. 프런트 환경변수에는 공개 URL과 publishable key만 둡니다.
- 운영 전환(새 프로젝트 생성, 마이그레이션 적용, 관리자 등록, 비밀번호·키 교체)은 별도 승인 절차로 진행합니다.
