# 🛒 Enterprise Shopping Mall Project

현대적인 이커머스 시스템의 핵심 기능을 구현한 엔터프라이즈급 쇼핑몰 프로젝트입니다. MSA 아키텍처를 지향하며, 고성능 및 확장성을 고려하여 설계되었습니다.

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS, Lucide React
- **State Management**: React Context API / Signal (Planned)
- **Deployment**: Vercel / GitHub Pages

### Backend (Auth & Core)
- **Framework**: Java 21, Spring Boot 3.4.0
- **Build Tool**: Maven
- **Database**: PostgreSQL (Supabase), H2 (Local/Test)
- **Caching**: Redis
- **Security**: Spring Security, OAuth2 (Google, Kakao), JWT

### Infrastructure & DevOps
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes (EKS Ready)
- **CI/CD**: GitHub Actions
- **Cloud**: AWS (KMS, S3), Supabase

## ✨ Key Features
- **인증/인가**: JWT 기반 자체 로그인 및 Social Login (Google, Kakao) 지원.
- **상품 관리**: 카테고리별 상품 조회, 재고 관리 (Optimistic Locking 적용).
- **주문 시스템**: 장바구니, 주문 생성 및 트랜잭션 처리.
- **보안**: AWS KMS를 활용한 민감 데이터 암호화 (User Profile 등).
- **이벤트 처리**: Outbox Pattern을 활용한 서비스 간 데이터 일관성 보장.

## 🏗 Architecture
- **Layered Architecture**: UI - Controller - Service - Domain - Repository 계층 분리.
- **Outbox Pattern**: 주문 및 주요 이벤트 발생 시 로컬 트랜잭션 내에서 이벤트를 저장하여 신뢰성 있는 메시지 전송 보장.
- **Global Exception Handling**: 표준 에러 코드를 통한 일관된 응답 처리.

## 🚦 Getting Started

### Backend
```bash
cd shoppingmall/backend
./mvnw clean install
./mvnw spring-boot:run
```

### Frontend
```bash
cd shoppingmall/frontend
npm install
npm run dev
```

---
*본 프로젝트는 개인 포트폴리오를 위한 학습 및 실무 적용 사례 연구용입니다.*
