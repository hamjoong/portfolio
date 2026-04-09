# Developer

---

# Context Engineering Project Guideline

---

# 목적
이 문서는 프로젝트 전반의 의사결정, 협업 규칙, 개발 표준, 아키텍처 방향성을 명확하게 정의하기 위한 실행 가이드입니다.

# 운영 기준
- 10명의 시니어 전문가 협업 기준
- 안정성 우선
- 보안 우선
- 유지보수성 우선
- 확장성 우선
- 자동화 우선

# 1. 프로젝트 개요
이 프로젝트는 AI가 사용자의 입력을 분석하여 문서의 목적과 맥락을 자동으로 구분하고,  
그에 맞는 규칙과 출력 형식을 적용할 수 있도록 설계된 컨텍스트 엔지니어링 기반 문서 체계입니다.

# 대상 역할
- 프론트엔드
- 백엔드
- 풀스택
- UI/UX 디자이너
- DBA
- 보안
- QA
- 기획
- 마케팅
- 인프라

---

# 2. 핵심 목표

# 비즈니스 목표
- 사용자 증가
- 매출 증가
- 운영 효율화
- 데이터 기반 의사결정

# 기술 목표
- API 응답 속도 200ms 이하
- 시스템 가용성 99.9% 이상
- Zero Trust Architecture 구현
- DevSecOps 환경 구축
- 자동 배포 시스템 구축
- Observability 기반 운영

---

# 3. 프로젝트 원칙
- 안정성 우선
- 보안 우선
- 유지보수성 우선
- 확장성 우선
- 자동화 우선
- 불확실한 정보는 추측하지 않고 명확히 표시
- 특정 스택 강요 금지
- 실무 중심 제안
- 보안 취약한 방법 제안 금지
- 최신 트렌드보다 검증된 안정성 우선

---

# 4. 문서 구조
본 프로젝트의 모든 문서는 Markdown 기반으로 작성한다.

```text
/docs
├ PRD.md
├ TRD.md
├ ARCHITECTURE.md
├ API.md
├ SECURITY.md
├ DEPLOYMENT.md
├ QA.md
├ RULES.md
├ ROLES.md
├ STANDARDS.md
├ ADR.md
```

---

# 5. 문서 타입 정의

# PRD (Product Requirements Document) : 제품 요구사항 정의서 PRD는 기획 중심 문서입니다.
- 무엇을 만드는가
- 왜 만드는가
- 어떤 문제를 해결하는가

# TRD (Technical Requirements Document) : 기술 상세 설계서 TRD는 개발 중심 문서입니다.
- 어떻게 구현하는가
- 어떤 기술 선택을 하는가
- 어떤 제약과 예외가 있는가

# ARCHITECTURE
- 시스템 구조
- 서비스 경계
- 계층 분리
- 확장 전략

# SECURITY
- 인증/인가
- 암호화
- 취약점 대응
- 접근 통제

# DEPLOYMENT
- 배포 방식
- 환경 분리
- 롤백 전략
- CI/CD

# QA
- 테스트 전략
- 품질 기준
- 릴리즈 조건

# RULES
- 협업 규칙
- 커뮤니케이션 규칙
- 변경 관리 규칙

# ROLES
- 역할 정의
- 책임 범위
- 승인 권한

# STANDARDS
- 코딩 규칙
- API 표준
- 폴더 구조
- 예외 처리 표준
- 개발 단계의 DB / 배포 관련은 테스트 환경으로 한다.

# Architecture Decision Records
- 도입 배경
- ADR 작성 양식
- 핵심 패턴

---

# 6. AI 동작 원칙
AI는 사용자의 입력을 아래 기준으로 분류하여 문서를 생성하거나 수정한다.

# 분류 규칙
- 목적, 문제, 범위, 사용자, 기대효과 → PRD
- API, DB, 구조, 성능, 예외, ARCHITECTURE, 구현 → TRD
- 보안, 인증, 인가, 암호화, 취약점 → SECURITY
- 배포, 환경, CI/CD, 롤백, 운영 → DEPLOYMENT
- 테스트, 검증, 부하, 회귀 → QA
- 협업, 승인, 커뮤니케이션, 책임 → RULES / ROLES

# 출력 원칙
- Markdown 기반 작성
- 구조적 문서 작성
- 코드 블록 사용
- JSON / YAML 표준 사용
- 두괄식 설명
- 쉬운 비유 설명
- 용어 설명 포함
- 정보 부족 시 질문

---

# 7. 운영 방식
- Agile 기반 Sprint 운영
- Sprint 기간: 2주
- Daily Standup: 15분
- Sprint Review 수행
- Sprint Retrospective 수행

---

# 8. 기술 스택

# Frontend
- HTML
- CSS
- SCSS
- Tailwind CSS
- JavaScript (ES6+)
- TypeScript
- React
- Vue
- Next.js

# Backend
- Node.js
- Spring Boot
- Java
- NestJS
- FastAPI
- Python

# Database
- SQL
- MySQL
- PostgreSQL
- Redis
- MongoDB
- AWS EKS
- Terraform

# Infra
- AWS
- Docker
- Kubernetes

# CI/CD
- GitHub
- GitHub Actions
- Jenkins
- AWS CI/CD
- Amazon EC2
- Amazon ECS

---

# 9. 핵심 품질 기준

# 성능 Performance
프론트엔드는 Lighthouse 점수 90점 이상을 목표로 하며, 백엔드는 DB 인덱싱 최적화와 캐싱 전략을 수립합니다.
DB 인덱스 최적화, CDN 활용, 비동기 메시지 큐를 통한 부하 분산.
캐싱, 로드밸런싱, DB인덱싱 전략

- API 응답 200ms 이하
- DB Index 최적화
- Redis Cache 활용
- CDN 사용
- Lazy Loading 적용
- Pagination 적용
- Query Plan 분석
- 이미지 최적화
- 불필요한 API 호출 방지
- 불필요한 DB 조회 방지
- LCP (Largest Contentful Paint) : 2.5초 이내
- CLS (Cumulative Layout Shift) : 0.1 이하
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

# 보안
- HTTPS 사용
- JWT 인증
- OWASP Top 10 대응
- XSS 방어
- CSRF 방어
- Rate Limiting
- RBAC 접근 제어
- ABAC 접근 제어
- Zero Trust Architecture
- Internal mTLS : 마이크로서비스 간 통신 시 상호 TLS 인증을 적용한다
- Secret Manager : `.env` 파일 사용을 지양하고, AWS Secret Manager 또는 HashiCorp Vault를 연동하여 런타임에 주입한다
- API Key 노출 금지(.env 활용)
- 인증/인가 분리
- RLS 접근 제어
- DAC 접근 제어
- MAC 접근 제어
- BYOD 분리
- SCA (Software Composition Analysis) : CI 파이프라인에서 오픈소스 라이브러리의 취약점을 자동 스캔한다. (Snyk, GitHub Dependency Graph)
- Container Scan : Docker 이미지 빌드 시 베이스 이미지의 취약점을 점검한다. (Trivy)

# 운영 도구 모니터링
- Prometheus
- Grafana
- ELK Stack
- OpenTelemetry
- CPU, Memory, API Latency, Error Rate, DB Query Time 모니터링
- DML Audit Log
- N+1 Query Detection

---

# 10. 작성 원칙
- 문서는 명확하고 짧게 작성한다.
- 책임자와 승인자를 명시한다.
- 모호한 표현을 제거한다.
- 수치 기준을 넣는다.
- 예외 상황을 포함한다.
- 변경 가능성이 높은 내용은 별도 문서로 분리한다.
- 공통 규칙은 `STANDARDS.md`로 모은다.
- 구현 세부는 `TRD.md`로 이동한다.
- 의사결정은 `ARCHITECTURE.md` 또는 ADR로 남긴다.

---

# 11. README 작성 원칙
README는 누구나 보고 빠르게 이해할 수 있어야 한다.

- 프로젝트 이름
- 프로젝트 개요
- 기술 스택
- 기술 선택 이유
- 아키텍처
- 핵심 트러블슈팅
- 성능 개선 수치
- 실행 방법

---

# Architecture Decision Records

# 도입 배경
10명의 시니어가 협업함에 있어, 특정 기술 선택의 이유와 포기한 대안을 기록하여 향후 기술 부채 파악 및 리팩토링의 근거로 삼는다.

# ADR 작성 양식
- Status : Proposed / Accepted / Deprecated / Superseded
- Context : 해당 결정이 필요한 배경과 비즈니스 요구사항
- Decision : 선택한 기술/패턴 및 구현 방식
- Consequences : 이 선택으로 얻는 이득과 감수해야 할 트레이드오프(Trade-off)

# 핵심 패턴
- Hexagonal Architecture : 도메인 로직을 외부 인프라(DB, API)로부터 격리하여 테스트 가능성을 극대화한다.
- Circuit Breaker : 외부 서비스(AI API 등) 장애가 시스템 전체로 전이되지 않도록 타임아웃 및 서킷 브레이커를 적용한다.

---

# PRD.md

---

# Product Requirements Document

---

# 1. 문서 목적
이 문서는 무엇을 만들고 왜 만드는지를 정의한다.

# 2. 배경
# 현재 문제
- 기존 서비스의 확장성 부족
- 증가하는 트래픽 대응 필요
- 사용자 경험 저하
- 운영 비용 증가
- 보안 위협 증가
- 데이터 증가로 인한 성능 문제

# 시장 상황
- SaaS 플랫폼 경쟁 심화
- 데이터 기반 의사결정 요구 증가
- 빠른 서비스 출시 요구
- AI 기반 서비스 확산

# 내부 요구사항
- 개발 생산성 향상
- 유지보수 가능한 구조
- 자동화된 배포 시스템
- 보안 중심 아키텍처

---

# 3. 문제 정의
- 확장성 부족
- 사용자 경험 문제
- 운영 비용 증가
- 보안 취약점
- 코드 유지보수 어려움
- 기술 부채 증가

---

# 4. 프로젝트 범위
# 포함 범위
- 신규 서비스 개발
- 기존 시스템 개선
- API 플랫폼 구축
- 데이터 분석 기반 대시보드
- DevOps 자동화 구축

# 제외 범위
- 외부 파트너 시스템
- 레거시 시스템 전면 리팩토링
- 타 조직 내부 시스템 변경

---

# 5. 페르소나
# Primary Persona
복잡한 데이터를 실시간으로 확인하려는 엔터프라이즈 사용자

# Secondary Persona
보안성과 안정성을 중요하게 생각하는 내부 관리자

# Custom Persona
실제 서비스 타겟 고객

# 사용자 유형

| 구분 | 설명 |
|------|------|
| End User | 일반 사용자 |
| Admin | 관리자 |
| Operator | 운영 담당자 |

# 포함 항목
- 사용자 유형
- 사용자 목표
- Pain Point
- User Journey Map

---

# 6. 비전
기술적 한계를 뛰어넘는 사용자 중심 무결성 기반 확장 가능한 플랫폼 구축

# 비전 키워드
- Scalability
- Security
- User Experience
- Observability
- Long-term Maintainability

---

# 7. 목표
- 사용자 증가
- 매출 증가
- 운영 효율화
- 데이터 기반 의사결정

---

# 8. 성공 기준
- 사용자 만족도 향상
- 장애 감소
- 배포 안정성 향상
- 운영 비용 절감
- 응답 속도 개선

---

# 9. 이해관계자
- 기획
- 개발
- QA
- 보안
- 인프라
- 운영
- 마케팅
- 경영진

---

# 10. 승인 기준
- 요구사항 정의 완료
- 범위 확정
- 우선순위 정리
- 일정 승인
- 책임자 지정

---

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

# RULES.md

---

# Collaboration Rules

---

# 1. 문서 목적
이 문서는 협업 방식, 커뮤니케이션 규칙, 변경 관리 기준을 정의한다.

# 2. 협업 원칙
- Agile 기반 Sprint 운영
- Sprint 기간은 2주
- Daily Standup은 15분
- Sprint Review 수행
- Sprint Retrospective 수행

---

# 3. 커뮤니케이션 규칙
- 모호한 요청은 명확히 질문한다.
- 추측으로 결정하지 않는다.
- 변경 요청은 문서로 남긴다.
- 중요한 결정은 기록한다.
- 기술적 판단과 기획 판단을 분리한다.

---

# 4. 변경 관리
- 요구사항 변경은 영향 범위를 먼저 분석한다.
- 일정, 비용, 품질 영향도를 함께 기록한다.
- 승인 전 구현하지 않는다.
- 변경 이력은 버전으로 관리한다.

---

# 5. 책임 원칙
- 각 파트장은 코드 리뷰 및 아키텍처 승인 권한을 가진다.
- 주니어는 구현 중심, 시니어는 설계와 품질 중심으로 책임을 진다.
- 보안과 인프라 이슈는 별도 승인 절차를 따른다.
- 외부 라이브러리 도입은 보안 승인 필수다.

---

# 6. 제약 조건
- 외부 라이브러리 도입 시 보안 승인 필수
- 보안 취약 코드 금지
- 안정성 우선
- 불확실한 정보는 추측하지 않고 명확히 표시
- 특정 스택 강요 금지
- 과도한 이론 설명 지양
- 실무 중심 제안
- 보안 취약한 방법 제안 금지
- 최신 트렌드보다 안정성 우선

---

# ROLES.md

---

# Roles & Responsibilities

# 1. 역할 정의
본 프로젝트는 10명의 시니어 전문가 협업을 기준으로 한다.

| Role | Description |
|------|-------------|
| Frontend Developer | UI 개발, 상태 관리, 성능 최적화 |
| Backend Developer | 서버 개발, 비즈니스 로직 구현, API 설계 |
| Fullstack Developer | 전체 서비스 구현 |
| UI/UX Designer | UX 설계, 사용자 여정, 와이어프레임, 디자인 시스템 |
| DBA | DB 설계, 데이터 모델링, 쿼리 튜닝, 샤딩 전략, 백업 정책 |
| Security Engineer | 방화벽, 인증/인가, 암호화, 접근 제어, 취약점 분석 |
| QA Engineer | 테스트 자동화, 부하 테스트, 회귀 테스트, 품질 정책 |
| Planner | 서비스 기획, 요구사항 구체화, 로드맵 관리 |
| Marketer | 마케팅 전략, 시장 분석, 유저 피드백, SEO, 성장 지표 |
| Infra Engineer | 인프라 구축, K8s 운영, CI/CD, 모니터링 구성 |

---

# 2. 공통 책임
- 기술 가이드 제공
- 주니어 멘토링
- 코드 리뷰
- 품질 관리

---

# 3. 승인 권한
- 아키텍처 변경 승인
- 보안 정책 승인
- 배포 정책 승인
- 품질 기준 승인
- 대규모 리팩토링 승인

---

# 4. 파트별 책임
# Frontend
- UI 구현
- 성능 최적화
- 접근성 고려
- 상태 관리 안정화

# Backend
- API 설계
- 비즈니스 로직 구현
- 에러 처리
- 성능과 확장성 고려

# DBA
- 스키마 설계
- 인덱스 최적화
- 쿼리 튜닝
- 백업 및 복구 정책

# Security
- 인증/인가 설계
- 취약점 점검
- 보안 정책 수립
- 비밀정보 관리

# QA
- 테스트 케이스 작성
- 자동화 테스트 구축
- 회귀 검증
- 품질 기준 관리

# Infra
- 배포 자동화
- 모니터링 구성
- 장애 대응
- 환경 분리 관리

---

# SECURITY.md

---

# Security Standard

---

# 1. 보안 원칙
- HTTPS 사용
- JWT 인증
- OWASP Top 10 대응
- XSS 방어
- CSRF 방어
- Rate Limiting
- RBAC 접근 제어
- ABAC 접근 제어
- Zero Trust Architecture
- Internal mTLS : 마이크로서비스 간 통신 시 상호 TLS 인증을 적용한다
- Secret Manager : `.env` 파일 사용을 지양하고, AWS Secret Manager 또는 HashiCorp Vault를 연동하여 런타임에 주입한다
- API Key 노출 금지(.env 사용)
- 인증/인가 분리
- RLS 접근 제어
- DAC 접근 제어
- MAC 접근 제어
- BYOD 분리
- SCA (Software Composition Analysis) : CI 파이프라인에서 오픈소스 라이브러리의 취약점을 자동 스캔한다. (Snyk, GitHub Dependency Graph)
- Container Scan : Docker 이미지 빌드 시 베이스 이미지의 취약점을 점검한다. (Trivy)

---

# 2. 비밀정보 관리
- 환경 변수는 `.env` 또는 Secret Manager로 관리한다.
- 코드 저장소에 직접 포함하지 않는다.
- 로그에 민감정보를 출력하지 않는다.

---

# 3. 인증/인가
- 인증과 인가는 분리한다.
- 역할 기반 접근 제어를 적용한다.
- 관리자 기능은 별도 권한 레벨로 분리한다.

---

# 4. 개발 시 금지 사항
- 하드코딩된 API Key 사용 금지
- 검증되지 않은 입력 직접 사용 금지
- SQL Injection 취약 코드 금지
- 민감정보 로그 출력 금지
- 보안 승인 없는 라이브러리 도입 금지

---

# DEPLOYMENT.md

---

# Deployment Strategy

---

# 1. 배포 원칙
- 무중단 배포를 목표로 한다.
- 운영 영향도를 최소화한다.
- 배포 실패 시 빠르게 롤백할 수 있어야 한다.

---

# 2. 배포 방식
Deployment Strategy Blue-Green Deployment 또는 Canary Release를 통한 무중단 배포
CI/CD, Canary Release, Rollback 시나리오

- Blue-Green Deployment
- Canary Release
- Rollback 전략
- CI/CD 자동화
- 개발 / 스테이징 / 운영 분리
- GitHub / GitHub Actions / Jenkins CI/CD / AWS CI/CD / Amazon EC2 / Amazon ECS
- Canary Release : 신규 버전 배포 시 전체 트래픽의 5%부터 점진적으로 확대하며 에러율을 모니터링한다
- Graceful Shutdown : 배포 시 현재 처리 중인 요청을 안전하게 마친 후 프로세스를 종료하도록 설정한다
- Distributed Tracing : 서비스 간 호출 흐름을 파악하기 위해 `Trace ID`를 전파한다 (OpenTelemetry 적용)
- Error Tracking : `Sentry` 등을 연동하여 클라이언트 및 서버 에러를 실시간 수집하고 담당자에게 알림을 발송한다

---

# 3. 환경 분리
- Local
- Dev
- Staging
- Production

---

# 4. CI/CD Pipeline
```text
Commit
↓
Lint
↓
Build
↓
Test
↓
Security Scan
↓
Performance Test
↓
Deploy
```

---

# 5. DevSecOps
CI 파이프라인에서 자동 수행한다.

- SAST
- DAST
- Dependency Scan
- Container Scan

---

# 6. 운영 체크
- 배포 전 테스트 통과 확인
- 보안 스캔 통과 확인
- 성능 기준 확인
- 롤백 기준 확인
- 모니터링 대시보드 확인

---

# QA.md

---

# QA Strategy

---

# 1. 품질 목표
- 안정적으로 동작해야 한다.
- 회귀가 없어야 한다.
- 릴리즈 후 장애를 최소화해야 한다.

---

# 2. 테스트 전략
- Unit Test
- Integration Test
- E2E Test
- Load Test
- Security Test

---

# 3. 품질 기준
- 테스트 커버리지 80% 이상
- 주요 시나리오 E2E 검증
- 장애 재현 시나리오 확보
- 회귀 테스트 자동화

---

# 4. 검증 원칙
- 기능 변경 후 테스트 수행
- 리팩토링 후 회귀 검증 수행
- 배포 전 필수 시나리오 확인
- 성능 이슈 발생 시 부하 테스트 수행

---

# 5. 프로젝트 핵심 원칙 Final Principle
- 안정성 우선
- 보안 우선
- 유지보수성
- 확장성
- 자동화

---

# 6. Static Analysis 목적 : 잠재적 버그 사전 탐지
#도구
- SonarQube
- CodeQL

---

# 7. Debug
# 규칙
- Null Safety 확인
- 예외 처리 명확화
- Error Message 명확화

---

# 8. 최적화 대상 Performance Optimization
- DB Query
- DB Connection Pool 관리
- N+1 Query 제거
- Lock Contention 최소화
- API Response
- Frontend Rendering
- Network Request

# 주의사항
성능 최적화 이후 **기능 변경 금지**

---

# 9. Refactoring
# 규칙
- 기능 변경 금지
- 테스트 통과 필수
- 코드 가독성 향상

---

# 10. Regression Test : 리팩토링 이후 기존 기능 검증

---

# 11. Final Lint Validation : 성능 최적화 이후 반드시 실행
- Lint 재실행
- Static Analysis 재실행
- Unit Test 재실행
- Memory Leak 검사
- Dead Code 제거

---

# 12. 규칙
- 빌드 전 자동 실행
- Warning 0
- Error 0

---