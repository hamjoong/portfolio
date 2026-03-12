# Architecture - 신규 쇼핑몰 서비스 (Modular Monolith)

## 1. High-Level Architecture (Modular Monolith)

- 아키텍처 모델: **Modular Monolith**
  - 단일 배포 아키텍처이나, 내부적으로 도메인(Auth, Order, Product 등)이 엄격히 분리된 구조.
  - 추후 특정 모듈의 트래픽 증가 시 해당 모듈만 마이크로서비스(MSA)로 분리 용이.

### 1.1 계층형 구조 개요

Client (Web/Mobile)
↓
Next.js BFF (Server Actions)
↓
Modular Monolith Backend (Spring Boot 3.4)
  - API Gateway Layer (Internal Routing / Filter)
  - Domain Modules (Auth, User, Product, Order, Payment, Guest, ...)
↓
Persistence Layer (PostgreSQL / Redis / RediSearch)
↓
External Services (PG, Delivery, SMS/Email)

---

## 2. Component Architecture

### 2.1 Frontend (Next.js 15)
- **Partial Prerendering (PPR):** 정적 레이아웃과 동적 데이터를 결합하여 TTI 최소화.
- **Server Actions:** 클라이언트-서버 간 직접 호출을 통한 데이터 뮤테이션 및 네트워크 오버헤드 감소.
- **State Management:** 
  - Server State: `React Query` (자동 캐싱 및 동기화)
  - UI State: `Zustand` (Global UI 상태 관리)

### 2.2 Backend (Spring Boot 3.4)
- **Module Separation:** 도메인별 패키지 격리 및 인터페이스 기반 통신.
- **Search Engine:** `RediSearch` 도입 (Redis 상에서 텍스트 검색 및 실시간 인덱싱 수행, 200ms 이내 응답 보장).
- **Concurrency Control:** `DB Optimistic Lock` (Version 기반) 적용하여 재고 정합성 확보.

---

## 3. Data & Message Flow

### 3.1 비동기 이벤트 처리 (Internal Event Bus)
- **Message Broker:** `Redis Streams` 또는 `Spring ApplicationEvent` 활용.
- **Flow:** 
  1. Order Service 주문 생성 (DB 저장)
  2. 주문 완료 이벤트 발행
  3. Notification Service(알림), Delivery Service(배송 요청) 등에서 비동기 소비.

### 3.2 검색 흐름
1. 상품 등록/수정 시 `RediSearch` 인덱스 실시간 업데이트.
2. 유저 검색 요청 시 RediSearch에서 직접 결과 반환 (고성능).

---

## 4. Security Architecture (Zero Trust)
- **Service Security:** 내부 모듈 간 통신 및 외부 요청 검증을 위한 **Internal API Key** 도입.
- **Secrets Management:** `Vault` 또는 `AWS Secrets Manager`를 통한 환경 변수 주입 (보안 강화).
- **Auth:** JWT (Access/Refresh Token) 및 RBAC 관리.

---

## 5. Scalability & Resilience
- **Database:** Read Replica 구성을 통한 읽기 부하 분산.
- **Caching:** Global Cache(Redis) 활용하여 DB 조회 최소화.
- **Stateless:** 세션 없이 JWT 기반으로 설계하여 수평 확장(Auto Scaling) 보장.