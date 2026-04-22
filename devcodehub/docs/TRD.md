# [TRD] DevCodeHub - 기술 상세 설계서

## 1. 기술 스택
- **Backend**: Spring Boot 3.x (Java 21), PostgreSQL, Redis (선택적)
- **Frontend**: React 19, TypeScript, Tailwind CSS, Zustand, STOMP
- **Infra**: AWS ECS/Fargate, Docker, GitHub Actions, S3

## 2. 아키텍처 원칙
- **계층형 구조**: UI - API Gateway - Service Layer - Repository
- **비동기 처리**: AI 분석은 독립 스레드 풀(`aiTaskExecutor`)로 격리
- **관심사 분리**: 도메인별 패키지 분리 및 Spring Security/JWT 기반 인증

## 3. 핵심 기능 기술 명세
- **채팅 시스템**: STOMP 프로토콜 기반. Redis 활성화 시 Pub/Sub 기반 브로드캐스팅, 비활성화 시 로컬 저장 및 DB 동기화.
- **예외 처리**: `GlobalExceptionHandler`를 통한 표준 에러 응답 규격(ApiResponse) 준수.

## 4. 성능 기준
- API 응답 속도: p95 200ms 이하
- DB 커넥션 풀 최적화 및 N+1 쿼리 제거
- Redis 캐시(Cache Aside 패턴)를 통한 API 응답 가속화