# [Architecture] DevCodeHub - 시스템 아키텍처 설계

## 1. 전체 시스템 구성도 (System Overview)

```mermaid
graph TD
    Client[React Frontend] --> ALB[AWS Application Load Balancer]
    ALB --> AppServer[Spring Boot App Cluster]
    
    subgraph "Backend Services"
        AppServer --> Security[Spring Security/OAuth2]
        AppServer --> Chat[WebSocket/STOMP]
        AppServer --> AI[AI Interface Layer]
    end
    
    subgraph "Data Storage"
        AppServer --> DB[(PostgreSQL - Supabase)]
        AppServer --> Cache[(Redis Cache & Pub/Sub)]
        AppServer --> Storage[(Supabase Storage)]
    end
    
    subgraph "Data Storage"
        AppServer --> DB[(PostgreSQL - Supabase)]
        AppServer --> Cache[(Redis Cache & Pub/Sub)]
        AppServer --> Storage[(Supabase Storage - Native API)]
    end
    ```

    ## 2. 레이어드 아키텍처 (Layered Architecture)

    우리 시스템은 **계층형 구조(Layered Architecture)**를 따르며, 각 레이어는 자신의 책임에만 집중합니다.

    - **Presentation Layer (Web/Controller)**: HTTP 요청 처리, JSON 변환, API 표준 응답(ApiResponse) 적용
    - **Service Layer (Business)**: 핵심 비즈니스 로직, 트랜잭션 관리, AI 병렬 호출(CompletableFuture)
    - **Infrastructure Layer (Data/External)**: DB 접근(JPA), 외부 API 통신(RestClient), Redis 캐싱 및 메시징
    - **Common/Shared Layer**: 전역 예외 처리(GlobalExceptionHandler), 보안 유틸리티(MaskingUtil)

    ## 3. 데이터 흐름 (Data Flow)

    ### 3.1 AI 코드 리뷰 흐름
    1. 사용자가 Monaco Editor에서 코드를 작성하고 리뷰 요청 (Gemini 기본, OpenAI/Claude 확장 가능)
    2. API 서버가 요청을 받고, `aiTaskExecutor` 스레드 풀을 통해 각 AI 모델로부터 병렬로 리뷰 수신
    3. 프롬프트 엔지니어링을 통해 구조화된 JSON 응답(summary, rating, pros, cons) 강제
    4. 분석 결과를 JSONB 포맷으로 DB에 저장하고 사용자에게 응답
    5. 비회원(Guest)의 경우 IP 기반으로 일일/누적 사용량 제한 로직 수행

    ### 3.2 실시간 채팅 흐름
    1. 사용자가 WebSocket 연결 시 `/ws-stomp` 엔드포인트에 구독
    2. 메시지 발송 시 Redis Pub/Sub을 통해 다중 인스턴스 환경에서 실시간 브로드캐스팅
    3. **Write-behind 전략**: 채팅 메시지는 Redis 큐에 즉시 적재되며, `ChatWriteBehindScheduler`가 5분 주기로 DB에 벌크 Insert 수행
    4. 사용자별 '안 읽은 메시지' 카운트는 별도의 소켓 채널을 통해 실시간 동기화

    ### 3.3 파일 업로드 흐름
    1. AWS SDK의 서명 이슈를 해결하기 위해 **Supabase Native Storage API**를 직접 호출
    2. `service_role` JWT 권한을 사용하여 서버 측에서 업로드 대행
    3. 업로드 성공 시 Public URL을 반환하여 클라이언트에서 즉시 렌더링 가능하도록 함

## 4. 인프라 확장 및 배포 전략

### 4.1 무중단 배포 (Blue-Green Deployment)
- **AWS ECS/EC2** 환경에서 새 버전(Green)을 배포한 후 상태 확인(Health Check) 성공 시 로드밸런서의 타겟 그룹을 전환하여 다운타임을 제로(0)로 유지합니다.

### 4.2 데이터베이스 마이그레이션
- 개발 초기에는 로컬 H2를 사용하며, 배포 단계에서 **Supabase(PostgreSQL)**로 전환합니다.
- 스키마 변경 시 **Flyway** 또는 **Liquibase**를 사용하여 DB 버전 관리를 수행합니다.
