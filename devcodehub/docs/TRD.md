# [TRD] DevCodeHub - 기술 상세 설계서

## 1. 기술 스택
- **Backend**: Spring Boot 3.4.1 (Java 21), Spring Security(JWT·OAuth2), JPA, PostgreSQL(Supabase), Redis 7(선택)
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query, STOMP(SockJS)
- **외부 연동**: Gemini·Claude·OpenAI API, PortOne(V2 SDK, V1·V2 서버 검증), Supabase Native Storage
- **로컬 인프라**: Docker Compose(PostgreSQL 16, Redis 7). 운영 호스팅은 선정 중입니다.

## 2. 아키텍처 원칙
- **계층형 구조**: Controller - Service - Repository
- **비동기 처리**: AI 분석은 `aiTaskExecutor` 전용 스레드 풀로 격리하고 DB 트랜잭션 밖에서 실행합니다.
- **보안 설계**: stateless JWT, 최소 공개 GET 화이트리스트, STOMP 인증, `service_role` 키는 서버에서만 사용
- **환경 독립**: 주소·키는 모두 환경변수로 받아 호스팅에 종속되지 않습니다(`backend/.env.example`).

## 3. 핵심 기능 기술 명세
- **채팅**: STOMP 기반. 메시지는 DB에 즉시 저장하고 브로드캐스트합니다. Redis Pub/Sub은 다중 인스턴스 전파용 선택 기능입니다. 안 읽은 수·알림은 커밋 이후 비동기로 전송합니다.
- **AI 리뷰**: `AiProvider` 인터페이스(Gemini·Claude·OpenAI)로 추상화. 키가 있는 모델만 `isAvailable()`이 true이며 서버가 호출 전에 검증합니다.
- **결제**: `PaymentStrategy`(V1: `imp_` 접두사, V2: 그 외)가 결제를 `PaymentInfo`로 정규화하고, `PaymentService`가 상태·금액·소유자·중복을 검증합니다.
- **스토리지**: AWS SDK 없이 Supabase Native Storage API를 직접 호출합니다.
- **예외 처리**: `GlobalExceptionHandler`가 표준 응답(`success`, `data`, `error`)을 반환하고 내부 정보는 노출하지 않습니다.
- **활동 잔디**: 게시글·댓글·AI 리뷰·시니어 리뷰를 날짜별 `GROUP BY`로 집계합니다.

## 4. 성능 설계
수치 목표는 두지 않고(측정 전) 구조적으로 병목을 줄입니다.
- N+1: `@EntityGraph`, `default_batch_fetch_size: 50`, 집계 쿼리, 전체 로드 대신 조건 쿼리
- `open-in-view: false`, 벌크 DELETE, 조회수·크레딧의 DB 원자 처리
- 외부 호출 타임아웃(연결 5초·읽기 60초), AI 호출 90초 상한
- 프론트: 라우트 코드 분할, selector 구독, 이미지 지연 로딩
- 리소스 기준: 컨테이너는 `-XX:MaxRAMPercentage=75`로 메모리 한도에 맞춥니다.
