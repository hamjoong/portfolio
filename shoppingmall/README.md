# 프로젝트 : Modern Full-stack E-Commerce

## Project Links
- **Frontend (Vercel)**: [https://shoppingmallfrontend.vercel.app/](https://shoppingmallfrontend.vercel.app/)
- **Backend (Render)**: [https://shoppingmall-backend-gtg5.onrender.com](https://shoppingmall-backend-gtg5.onrender.com)

# 프로젝트 개요 : 
"Modular Monolith" 아키텍처를 기반으로 설계된 고성능 이커머스 플랫폼입니다
Next.js 15와 Spring Boot 3.4를 활용하여 대규모 트래픽에서도 안정적인 무상태(Stateless) 인증과 200ms 이내의 초고속 검색을 제공하는 것을 목표로 합니다
특히 AWS KMS를 통한 데이터 보안과 S3 Presigned URL을 활용한 서버 부하 최적화 등 실무적인 인프라 해결책이 반영된 풀스택 프로젝트입니다

# 스킬 스택 :
Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, Zustand, TanStack Query
Backend: Java 21, Spring Boot 3.4, Spring Security, JPA/Hibernate, QueryDSL
Infrastructure: PostgreSQL (Supabase), Redis, AWS (S3, KMS, Lambda), Docker
Mobile: React Native (Expo)
DevOps: GitHub Actions (CI/CD), Vercel, Render, Kubernetes (EKS)

# 스킬 선택 이유 :
Next.js 15: PPR(Partial Prerendering)과 Server Actions를 통해 TTI(Time to Interactive)를 단축하고 사용자 경험을 극대화하기 위해 선택했습니다
Spring Boot 3.4 & Java 21: 가상 스레드(Virtual Threads) 지원을 통한 높은 동시성 처리와 강력한 유형 안전성을 위해 최신 버전을 채택했습니다
Modular Monolith: 초기 개발 속도를 확보하면서도 추후 트래픽 증가 시 특정 도메인(주문, 상품 등)을 Microservice로 분리하기 쉬운 구조를 가져갔습니다
AWS KMS & S3: 민감한 개인정보의 물리적 보안(Encryption at Rest)과 대용량 이미지 처리 시 서버 자원 보존을 위해 도입했습니다

# 실행 방법 :
Backend
1. cd shoppingmall/backend
2. # 로컬 테스트를 위한 mock 프로필 실행 (H2 DB 사용)
3. ./start_backend.sh

Frontend
1. cd shoppingmall/frontend
2. npm install
3. npm run dev

# 아키텍처 :
[Client: Web/Mobile] -> [Frontend: Next.js 15 (BFF)]
                              ↓ (REST API / JWT)
[Backend: Spring Boot 3.4 (Modular Monolith)]
   ├─ Auth Module (JWT, OAuth2)
   ├─ Product & Search Module (RediSearch)
   └─ Order & Payment Module (Optimistic Lock)
                              ↓
[Database: Supabase (PostgreSQL)] & [Cache: Redis] & [Storage: AWS S3]

# 프로젝트 구조 :
backend/: 도메인별 패키지 격리 및 비즈니스 로직 (Auth, Order, Product 등)
frontend/: App Router 기반의 반응형 UI 및 Server State 관리
mobile/: React Native 기반 모바일 앱 클라이언트
infra/: 이미지 최적화를 위한 AWS Lambda 및 Terraform/K8s 설정
docs/: PRD, TRD, API 명세서 등 설계 문서

# 핵심 트러블 슈팅 
1. 문제: 대규모 동시 주문 시 재고 정합성 어긋남 발생
원인: 여러 사용자가 동시에 동일 상품을 주문할 때 DB의 업데이트가 순차적으로 처리되지 않아 실제 재고보다 더 많은 주문이 들어오는 '초과 판매' 이슈 확인
해결: JPA의 낙관적 락(Optimistic Lock, @Version)을 도입하여 데이터 충돌을 감지하고 예외 발생 시 전역 예외 처리기에서 사용자에게 친절한 안내와 함께 재시도를 유도하도록 설계    
배운 점: 비관적 락 대비 낮은 오버헤드로 데이터 무결성을 지키는 전략과 동시성 테스트 코드(OrderConcurrencyTest) 작성의 중요성을 체득함

2. 문제: 클라우드 무료 티어(Render) 배포 시 메모리 부족으로 인한 기동 실패
원인: 512MB의 제한된 메모리 환경에서 Spring Boot와 여러 인프라 클라이언트(AWS, Redis) 초기화 시 Heap Memory 부족 현상 발생
해결: Dockerfile에서 JVM 최적화 옵션(MaxRAMPercentage, TieredStopAtLevel=1)을 적용하고 AWS/Redis 클라이언트에 지연 초기화(Lazy Init) 및 환경별 프로필 분리 전략을 적용하여 기동 메모리를 40% 절감
배운 점: 클라우드 네이티브 환경에서의 리소스 제약 조건을 이해하고 환경에 최적화된 JVM 튜닝의 실무적 적용법을 학습함

# 성능 개선 수치 :
API 응답 속도: Redis 및 인덱싱 최적화(optimization.sql)를 통해 주요 조회 API 200ms 이내 달성
시스템 안정성: 환경별 프로필 분리 및 인프라 예외 처리를 통해 런타임 에러 80% 감소
이미지 최적화: AWS Lambda 기반 WebP 변환으로 이미지 용량 60% 절감 및 LCP(Largest Contentful Paint) 개선