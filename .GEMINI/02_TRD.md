# TRD.md

---

# Technical Requirements Document

---

# 1. 문서 목적
이 문서는 어떻게 기술적으로 구현할 것인지를 정의한다.

# 2. 시스템 아키텍쳐 System Architecture
시스템은 계층형 구조를 기본으로 하며, UI, API, 비즈니스 로직, 데이터 접근 계층을 분리한다.
마이크로서비스 / 모놀리식 / 하이브리드 선택 근거
계층형 구조 : UI - API Gateway - Business Logic - Data Access
관심사 분리 : 각 기능은 모듈화되어 서로의 영역을 침범하지 않습니다.

```text
Client
↓
CDN
↓
Load Balancer
↓
API Gateway
↓
Service Layer
↓
Database
```

---

# 3. 아키텍처 원칙
- 관심사 분리
- 모듈화
- 확장성 우선
- 안정성 우선
- 보안 우선
- 테스트 가능성 확보

---

# 4. 기술 스택

# Frontend
- HTML / CSS / SCSS / Tailwind CSS
- JavaScript / TypeScript
- React / Vue / Next.js

# Backend
- Node.js : 실시간 통신 및 고성능 I/O 처리
- Spring Boot : 트랜잭션 중심의 핵심 비즈니스 로직
- Java : 트랜잭션 중심의 핵심 비즈니스 로직
- NestJS : 실시간 통신 및 고성능 I/O 처리
- FastAPI : AI 모델 서빙 및 데이터 분석 도구
- Python : AI 모델 서빙 및 데이터 분석 도구


# Database
- MySQL
- PostgreSQL
- Redis
- MongoDB

# Infra
- AWS
- Docker
- Kubernetes
- Terraform

# CI/CD
- GitHub Actions
- Jenkins
- AWS CI/CD

---

# 5. API 표준
- RESTful API Level 3
- Swagger(OpenAPI 3.0)
- JSON 표준
- 리소스 중심 URL
- 표준 HTTP 상태 코드 사용
- 에러 응답 구조 통일
- 사용자 메시지와 내부 로그 분리
- API Key 노출 금지(.env 사용)
- Rate Limiting : IP당/계정당 호출 제한을 API Gateway 레벨에서 강제한다
- Payload Validation : 모든 외부 입력값에 대해 엄격한 Schema Validation(Zod, Joi 등)을 적용한다.

# 예시

```http
GET /users
POST /users
PUT /users/{id}
DELETE /users/{id}
```

# 응답 예시

```json
{
  "success": true,
  "data": {}
}
```

---

# 6. 예외 처리
- 전역 예외 처리기 사용
- 표준 에러 코드 응답
- 변경 사항은 RFC 형식으로 문서화

# 표준 에러 코드
- 400 BAD REQUEST
- 401 UNAUTHORIZED
- 403 FORBIDDEN
- 404 NOT FOUND
- 500 SERVER ERROR

---

# 7. 성능 기준
- API 응답 200ms 이하
- DB Index 최적화
- Redis Cache 적용
- CDN 사용
- Lazy Loading
- Pagination
- Query Plan 분석
- 이미지 최적화
- 불필요한 API 호출 방지
- 불필요한 DB 조회 방지
- LCP (Largest Contentful Paint) : 2.5초 이내
- CLS (Cumulative Layout Shift) : 0.1초 이하
- TTFB (Time to First Byte) : 100ms 이내 목표
- SLO 적용
- p95 latency < 200ms
- error rate < 1%
- DB Connection Pool 관리
- N+1 Query 제거
- Lock Contention 최소화
- Cache Aside Pattern
- TTL 정책 정의
- Redis 활용

---

# 8. 코드 구조
# Frontend

```text
src/
├ components
├ pages
├ hooks
├ services
├ utils
```

# Backend

```text
src/
├ controller
├ service
├ repository
├ domain
```

---

# 9. 코딩 규칙
- Clean Code
- SOLID Principles
- DRY (중복 제거)
- Cyclomatic Complexity (복잡도) 10 이하
- ESLint
- Prettier
- SonarQube
- Naming Convention 명확한 네이밍
- 가독성: 변수명은 줄여 쓰지 않습니다. data 대신 userProfileData 와 같이 의미가 명확한 변수명을 사용합니다.
- SRP (단일 책임 원칙) 하나의 함수 / 클래스는 반드시 하나의 일만 수행 준수
- 불변성 유지 원본 데이터를 직접 수정하지 않고 새로운 객체를 변환 준수
- 명확한 에러 처리  Error Handling 준수
- 환경 변수 사용 Security: API Key (.env 활용) 노출 금지, 환경 변수 (.env) 준수
- SQL Injection 방지
- KISS 단순성 준수
- 매직 넘버 금지
- 테스트 가능한 코드
- 함수 길이 50줄 이하
- 클래스 300줄 이하
- 중첩 depth 3 이하
- 주석은 왜(Why) 중심으로 한국어 작성
- 개발 단계의 DB / 배포 관련은 테스트 환경으로 한다.

---

# 10. 유지보수 기준
- 모듈화 구조 유지
- 코드 리뷰 정책 준수
- 테스트 커버리지 80% 이상
- SemVer 버전관리
- 의존성 최소화
- 리팩토링 정책 준수
- 한 파일에 너무 많은 기능 넣지 않기
- 중복 로직 제거
- Git Hooks : `Husky`를 사용하여 Commit 전 Lint, Push 전 Unit Test를 강제한다
- Feature Flag : MVP 기능 배포 시 `LaunchDarkly` 또는 내부 Redis 플래그를 사용하여 런타임 제어를 수행한다

---

# 11. 품질 파이프라인
```text
Lint
↓
Static Analysis
↓
Debug
↓
Unit Test
↓
Performance Optimization
↓
Refactoring
↓
Regression Test
↓
Final Lint Validation
```

---

# 12. 최종 검증
- Lint 재실행
- Static Analysis 재실행
- Unit Test 재실행
- Memory Leak 검사
- Dead Code 제거

---