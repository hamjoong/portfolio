# TRD - 신규 쇼핑몰 서비스 (Modular Monolith)

## 1. System Overview

- 아키텍처: **Modular Monolith** (Spring Boot 3.4 + Java 21)
- 프론트엔드: **Next.js 15** (App Router, PPR, Server Actions)
- 주요 목표: 실시간 검색(RediSearch), 재고 정합성(Optimistic Lock), 보안(Vault/Secrets Manager)

---

## 2. Architecture Design

### 2.1 서비스 모듈 (Modular Monolith)
# 내부 모듈 간 직접 참조를 지양하고 인터페이스/이벤트를 통해 통신

1. Auth Module
   - JWT, OAuth2, RBAC, **Internal API Key** 관리

2. User & Guest Module
   - 회원 프로필 및 **비회원 인증(Session/Token)** 관리
   - 배송지 관리 (회원은 저장, 비회원은 단회성)

3. Product & Search Module
   - **RediSearch** 연동: 상품 인덱싱 및 고속 검색(200ms)
   - 카테고리/브랜드/재고 조회

4. Order & Payment Module
   - **Optimistic Lock (@Version):** 주문 시 재고 차감 정합성 보장
   - 비회원 주문 처리 및 PG 연동

---

## 3. Technology Stack

### 3.1 Frontend (Next.js 15)
- **Features:** Partial Prerendering (PPR), Server Actions
- **State:** `React Query` (Server), `Zustand` (UI) 분리 설계
- **Optimization:** TTI 단축을 위한 컴포넌트 레벨 스켈레톤 및 스트리밍 활용

### 3.2 Backend (Spring Boot 3.4)
- **Language:** Java 21
- **Concurrency:** JPA Optimistic Locking
- **Search:** RediSearch (Redis Module)
- **Events:** Redis Streams (Async Processing)

---

## 4. API Design

### 4.1 REST API 원칙
- RESTful Level 3 지향, JSON 기반 표준 응답.

### 4.2 주요 엔드포인트 추가

- Guest & Orders
  - `POST /guest/auth` (비회원 인증)
  - `POST /orders/guest` (비회원 주문 생성)
  - `GET /orders/guest/{orderNo}` (비회원 주문 조회)

- Search
  - `GET /search/suggest` (실시간 검색어 추천)
  - `GET /search` (고성능 필터 검색)

---

## 5. Data Model (High Level)
- **Optimistic Locking:** 주요 테이블(`Products`, `Orders`)에 `version` 컬럼 필수 적용.

---

## 6. Security & Operations

- **Secrets:** `Vault` 또는 `AWS Secrets Manager` 연동 필수 (API Key 노출 금지)
- **Zero Trust:** 모듈 간 호출 시 내부 인증 토큰 검증
- **Logging:** 모든 에러에 대해 Trace ID 및 User Context 포함

---

## 7. Performance & Scalability
- **Target:** 주요 API 응답 시간 200ms 미만 보장.
- **Cache Strategy:** RediSearch 기반 실시간 인덱싱 및 Redis 기반 캐싱 전략.

---

## 8. Deployment Strategy
- 환경 분리: dev / stage / prod
- 배포: GitHub Actions 기반 CI/CD, Blue-Green Deployment 지원.
