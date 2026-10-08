# API 개요

모든 업무 API는 Supabase Edge Functions(`{SUPABASE_URL}/functions/v1/<함수>`)입니다. 응답은 공통으로 다음 형태입니다.

```json
{ "timestamp": "...", "success": true, "message": "...", "data": {} }
```

- 오류 시 `success: false`와 한국어 `message`만 내려갑니다. DB 오류 원문은 서버 로그에만 남습니다.
- 목록은 `page`(0부터), `size`(기본 10, 최대 50)를 받습니다. 상품 목록은 최대 100.
- 인증은 `Authorization: Bearer <Supabase access token>`. 비회원 장바구니/주문은 `x-guest-id: guest-...` 헤더를 씁니다.
- CORS는 `ALLOWED_ORIGINS` Secret과 `http://localhost:3000`만 허용합니다.

## 인증 (Supabase Auth, 프런트가 직접 호출)
이메일/비밀번호 가입·로그인, 세션 갱신, 로그아웃, 이메일 재설정 링크, 프로필·배송지(`customer_profiles` 등, RLS 적용)

## Edge Functions

| 함수 | 경로 | 인증 | 설명 |
|---|---|---|---|
| `health` | `GET /` | 없음 | 상태 확인 |
| `catalog` | `GET /categories`, `/products`, `/products/category/:id`, `/products/search?keyword=`, `/products/trending`, `/products/:id` | 없음 | 판매 중 상품 조회. 상세는 `HIDDEN` 제외. `popular-keywords`는 고정 목록 |
| `cart` | `GET /`, `POST /`, `DELETE /:productId[:optionId]`, `POST /merge` | 회원 또는 비회원 | 수량 1~99, ID는 UUID 검증. `merge`는 로그인 후 현재 비회원 장바구니만 병합 |
| `order` | `POST /` | 회원 또는 비회원 | `items[{productId, optionId?, quantity}]` 전체를 한 번에 주문. 비회원은 `guestEmail`, `guestLookupPassword`(6자 이상) 필요. 응답 `{orderId, orderNo}` |
| `order` | `POST /guest-lookup` | 없음 | `{orderNo, email, password}`로 비회원 주문 조회. 틀리면 구분 없이 404, 반복 실패는 429 |
| `order` | `GET /me`, `/recent-shipping`, `/:orderId` | 회원 | 본인 주문만 |
| `review` | `GET /product/:id`, `GET /me`, `POST /`, `PUT /:id`, `DELETE /:id`, `POST /:id/reply` | 조회 공개, 작성 회원, 답변 관리자 | 작성자 ID는 응답에서 제외. 작성은 본인의 결제 완료 주문 상품만, 주문·상품당 1건 |
| `qna` | `GET /product/:id`, `GET /me`, `POST /`, `POST /:id/answer` | 조회 공개, 작성 회원, 답변 관리자 | 작성자 ID는 응답에서 제외 |
| `admin-products` | `GET /access`, `/stats`, `/users`, `/orders`, 상품 CRUD, 주문 상태 변경 | 관리자 | `admin_users` 등록 여부로 판단 |
| `account-withdrawal` | `POST /` | 회원 | 관리자·진행 중 주문(PENDING/PAID/SHIPPED)이 있으면 거절(403/409) |

## DB 함수 (service_role 전용)
`create_order_atomic`, `lookup_guest_order`, `anonymize_expired_guest_orders(days)`, `anonymize_customer_account`, `admin_*` 관리자 RPC

## 결제
모의 결제입니다. 주문 즉시 `PAID`가 되며 환불·취소 기능은 제공하지 않습니다.
