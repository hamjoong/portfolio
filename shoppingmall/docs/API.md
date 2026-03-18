# API Specification: PROJECT X Commerce

본 문서는 PROJECT X의 백엔드 API 명세서입니다. 모든 API는 `application/json` 형식을 사용하며, 공통 응답 규격을 준수합니다.

## 1. 공통 응답 규격 (Common Response)

### ✅ Success Response
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": { ... },
  "timestamp": "2026-03-11T10:00:00"
}
```

### ❌ Error Response
```json
{
  "success": false,
  "message": "에러 발생 원인 메시지",
  "data": null,
  "timestamp": "2026-03-11T10:00:00"
}
```

---

## 2. 주요 API 엔드포인트

### 🔐 Authentication (인증)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/signup` | 신규 회원 가입 | Public |
| `POST` | `/api/v1/auth/login` | 로그인 및 JWT 발급 | Public |
| `POST` | `/api/v1/guest/auth` | 비회원 임시 토큰 발급 | Public |

### 🛍 Products & Search (상품 및 검색)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/products` | 전체 상품 목록 (Paging) | Public |
| `GET` | `/api/v1/products/{id}` | 상품 상세 정보 조회 | Public |
| `GET` | `/api/v1/products/search` | 실시간 상품 검색 (RediSearch) | Public |
| `GET` | `/api/v1/products/popular-keywords` | 실시간 인기 검색어 상위 10 | Public |

### 🛒 Cart (장바구니)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/cart` | 장바구니 목록 조회 | User/Guest |
| `POST` | `/api/v1/cart` | 장바구니 상품 추가/수정 | User/Guest |
| `DELETE` | `/api/v1/cart/{id}` | 장바구니 상품 삭제 | User/Guest |
| `POST` | `/api/v1/cart/merge` | 비회원 -> 회원 장바구니 통합 | User |

### 📦 Orders (주문)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/orders` | 신규 주문 생성 (Optimistic Lock) | User/Guest |
| `GET` | `/api/v1/orders/me` | 나의 주문 내역 조회 | User |
| `GET` | `/api/v1/orders/{id}` | 주문 상세 내역 조회 | User |

### 👤 User Profile & Address (회원정보 및 배송지)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users/me` | 프로필 정보 조회 (KMS 복호화) | User |
| `PATCH` | `/api/v1/users/me` | 프로필 정보 수정 (KMS 암호화) | User |
| `GET` | `/api/v1/users/me/addresses` | 나의 배송지 목록 | User |
| `POST` | `/api/v1/users/me/addresses` | 신규 배송지 등록 | User |

### 🛠 Admin (관리자)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/dashboard/stats` | 대시보드 매출 및 지표 통계 | Admin |
| `PATCH` | `/api/v1/admin/orders/{id}/status` | 주문 상태 강제 변경 | Admin |

---

## 3. 보안 정책
*   **Authorization:** 모든 보호된 API는 Header에 `Authorization: Bearer {JWT}`를 포함해야 합니다.
*   **Internal Security:** 마이크로서비스 간 통신은 `X-Internal-API-Key` 헤더를 필수적으로 검증합니다.
*   **Data Privacy:** 사용자의 실명, 전화번호, 상세 주소는 AWS KMS를 통해 애플리케이션 레벨에서 암호화되어 저장됩니다.

---
© 2026 PROJECT X API Documentation.
