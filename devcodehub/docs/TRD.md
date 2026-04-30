# [TRD] DevCodeHub - 기술 상세 설계서

## 1. 기술 스택
- **Backend**: Spring Boot 3.4.1 (Java 21), PostgreSQL (Supabase), Redis 7
- **Frontend**: React 19, TypeScript, Tailwind CSS, Zustand, STOMP (SockJS)
- **Infra**: AWS ECS/Fargate, ALB, CloudFront, GitHub Actions, Supabase Native Storage

## 2. 아키텍처 원칙
- **계층형 구조**: UI - API Gateway - Service Layer - Repository
- **비동기 처리**: AI 분석은 `aiTaskExecutor` 독립 스레드 풀로 격리하여 시스템 안전성 확보
- **보안 설계**: `service_role` JWT 기반 스토리지 접근, RBAC 적용

## 3. 핵심 기능 기술 명세
- **채팅 시스템**: STOMP 프로토콜 기반. Redis Pub/Sub 브로드캐스팅 및 5분 단위 DB 지연 저장(Write-behind).
- **스토리지 시스템**: AWS SDK를 배제하고 Native API 통신을 통해 S3 Signature 호환성 이슈를 근본적으로 해결.
- **예외 처리**: `GlobalExceptionHandler`를 통한 표준 응답(`success`, `data`, `error`) 규격 준수.

## 4. 성능 기준
- API 응답 속도: p95 200ms 이하 (Redis Cache-Aside 적용)
- N+1 문제 해결: `@EntityGraph`를 통한 Fetch Join 최적화
- 리소스 사용: ECS Fargate vCPU 0.5, RAM 1GB 기준 최적화 환경 구축