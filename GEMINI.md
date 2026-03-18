Developer
# Context Engineering Project Guideline

# 본 문서는 프로젝트 전반의 의사결정, 협업 규칙, 개발 표준, 아키텍처 방향성을 명확히 정의하기 위한 실행 가이드입니다. **10명의 시니어 전문가 협업 기준**
대상: 프론트엔드 / 백엔드 / 풀스택 / UI/UX / DBA / 보안 / QA / 기획 / 마케팅 / 인프라

---

# Context (컨텍스트) : 프로젝트의 본질적 배경, 문제 정의, 비즈니스 환경, 콘텍스트를 설명합니다.

## Background (백그라운드)
### 현재 해결해야 하는 문제
1. 기존 서비스의 확장성 부족
2. 증가하는 트래픽 대응 필요
3. 사용자 경험 저하
4. 운영 비용 증가
5. 보안 위협 증가
6. 데이터 증가로 인한 성능 문제

### 시장 상황
1. SaaS 플랫폼 경쟁 심화
2. 데이터 기반 의사결정 요구 증가
3. 빠른 서비스 출시 요구
4. AI 기반 서비스 확산

### 내부 조직 요구사항
1. 개발 생산성 향상
2. 유지보수 가능한 구조
3. 자동화된 배포 시스템
4. 보안 중심 아키텍처

---

# Problem Statement (시스템 문제) : 현재 시스템의 주요 문제
1. 확장성 부족
2. 사용자 경험 문제
3. 운영 비용 증가
4. 보안 취약점
5. 코드 유지보수 어려움
6. 기술 부채 증가

---

# Project Scope (프로젝트 범위)
## 포함 범위
1. 신규 서비스 개발
2. 기존 시스템 개선
3. API 플랫폼 구축
4. 데이터 분석 기반 대시보드
5. DevOps 자동화 구축

## 제외 범위
1. 외부 파트너 시스템
2. 레거시 시스템 전면 리팩토링
3. 타 조직 내부 시스템 변경

---

# 규칙 Rule 정의 : 협업 및 커뮤니케이션 방식

---

# 책임 Responsibility 정의 : 상세 R&R 확정

---

# PRD (Product Requirements Document) : 제품 요구사항 정의서 PRD는 기획 중심 문서입니다. "무엇을 (What), 왜 (Why) 만드는가?"

---

# TRD (Technical Requirements Document) : 기술 상세 설계서 TRD는 개발 중심 문서입니다. "어떻게(How) 기술적으로 구현할 것인가?를 정의합니다."

---

# Persona (페르소나)
Primary : 복잡한 데이터를 실시간으로 확인하려는 엔터프라이즈 사용자

Secondary : 보안성과 안정성을 중요하게 생각하는 내부 관리자

Custom : 실제 서비스 타겟 고객

---

## 신규 페르소나 Primary Persona 

| Persona | Description |
|--------|-------------|
| End User | 일반 사용자 |
| Admin | 관리자 |
| Operator | 운영 담당자 |

---

## 기술 페르소나 Technical Persona

| Role | Responsibility |
|-----|---------------|
| Developer | 서비스 개발 |
| Designer | UX 설계 |
| QA | 품질 검증 |
| DevOps | 인프라 운영 |

포함 내용
1. 사용자 유형
2. 사용자 목표
3. Pain Point
4. User Journey Map

---

# Vision (비전) : 기술적 한계를 뛰어넘는 **사용자 중심 무결성 기반 확장 가능한 플랫폼 구축**
1. Scalability
2. Security
3. User Experience
4. Observability
5. Long-term Maintainability

---

# Goal (목표)
1. 사용자 증가
2. 매출 증가
3. 운영 효율화
4. 데이터 기반 의사결정

---

## 기술 목표 Technical Goal
1. API 응답 속도 **200ms 이하**
2. 시스템 가용성 **99.9% 이상**
3. Zero Trust Architecture 구현
4. DevSecOps 환경 구축
5. 자동 배포 시스템
6. Observability 기반 운영

---

# Role (역할 정의) : 10명의 시니어 전문가 역할

| Role | Description |
|-----|-------------|
| Frontend Developer | UI 개발, 상태 관리, 성능 최적화 |
| Backend Developer | 서버 개발, 비즈니스 로직 구현 및 API 설계 |
| Fullstack Developer | 전체 서비스 |
| UI/UX Designer | UX 설계 사용자 여정(User Journey) 및 와이어프레임 최적화, 디자인 시스템 구축 |
| DBA | DB 설계 데이터 모델링, 쿼리 튜닝, 샤딩 전략 수립, DB Schema 설계 및 최적화, 성능 튜닝, 백업 정책 |
| Security Engineer | 방화벽, 인증/인가(OAuth2), 암호화 프로토콜, 보안정책 및 접근제어 설계, 취약점 분석 |
| QA Engineer | 테스트, 자동화 테스트 구축, 부하 테스트, 회귀 테스트, 품질 정책 정의 및 테스트케이스 작성 |
| Planner | 서비스 기획, 요구사항 구체화, 비즈니스 로직 정의, 로드맵 관리 |
| Marketer | 마케팅 전략, 시장 분석, 유저 피드백 수집, SEO 및 성장 지표 관리 |
| Infra Engineer | 인프라 구축, K8s 클러스터 운영, 배포 CI/CD 파이프라인, 모니터링 구성 |

---

# Project Operation Rule (프로젝트 규칙)
1. Agile 기반 Sprint
2. Sprint 기간 : 2주
3. Daily Standup : 15분
4. Sprint Review
5. Sprint Retrospective

---

## Schedule Rule

| Phase | Duration |
|------|----------|
| Planning | 2 weeks |
| Development | 12 weeks |
| QA | 4 weeks |

---

# Documentation Rule : 모든 문서는 Markdown 기반
1. 예시
/docs
├ PRD.md
├ TRD.md
├ Architecture.md
├ API.md
├ Security.md
├ Deployment.md

---

# Output Rule : AI 또는 개발자가 작성하는 출력 규칙
1. Markdown 기반 작성
2. 구조적 문서 작성
3. 코드 블록 사용
4. JSON / YAML 표준 사용
5. 두괄식 설명
6. 쉬운 비유 설명
7. 용어 설명 포함
8. 정보 부족 시 질문

---

# Responsibility (R&R) 주요 책임 : 각 파트장은 코드 리뷰 및 아키텍처 승인 권한 보유
1. 기술 가이드 제공
2. 주니어 멘토링
3. 코드 리뷰
4. 품질 관리

제약 조건
1. 외부 라이브러리 도입 시 보안 승인 필수
2. 보안 취약 코드 금지
3. 안정성 우선
4. 불확실한 정보는 추측하지 않고 명확히 표시합니다.
5. 특정 스택 강요하지 않음 (상황 기반 제안)
6. 과도한 이론 설명 지양 -> 실무 중심
7. 보안 취약한 방법 제안 금지
8. 최신 트렌드보다 안정성 우선

---

# Development Standard & Architecture

## 기술 스택 Technology Stack

| Layer | Technology |
|------|------------|
| Frontend | HTML / CSS / Scss / Tailwind CSS / JavaScript (ES6+) / TypeScript / React / Vue / Next.js / Python|
| Backend | Node.js / Spring Boot / Java 21 (Spring Boot 3.x) / NestJS / FastAPI / Python |
| Database | SQL / MySQL / PostgreSQL / Redis / MongoDB / AWS (EKS) / Terraform |
| Infra | AWS / Docker / Kubernetes |
| CI/CD | GitHub / GitHub Actions / Jenkins / AWS CI/CD / Amazon EC2 / Amazon ECS |

---

# 코딩 규칙 Coding Rules
1. 클린 코드 Clean Code 원칙 준수
2. SOLID Principles
3. 중복 제거 DRY
4. 복잡도 Cyclomatic Complexity < 10 이하 유지
5. ESLint
6. Prettier
7. Naming Convention
8. 가독성: 변수명은 줄여 쓰지 않습니다. data 대신 userProfileData 와 같이 의미가 명확한 변수명을 사용합니다.
9. 단일 책임 원칙(SRP) 하나의 함수 / 클래스는 반드시 하나의 일만 수행합니다.
10. 불변성 유지 원본 데이터를 직접 수정하지 않고 새로운 객체를 변환합니다.
11. Error Handling 명확화 "알 수 없는 에러"와 같은 메시지 대신, 사용자가 다음에 무엇을 해야 하는지 안내하는 예외 처리를 권장합니다.
12. Security: API Key (.env 활용) 노출 금지, 환경 변수 (.env) 사용, SQL Injection 방지 로직을 기본적으로 적용합니다. 
13. 단순성 유지 KISS
14. 매직 넘버 금지
15. 테스트 가능한 코드 작성
16. 읽기 쉬운 코드
17. 함수 길이 50줄 이하
18. 클래스 300줄 이하
19. 중첩 depth 3 이하
20. 주석 처리 주석은 한글로 처리 할것 어떻게(How) 보다 왜(Why) 인지로 처리

---

# 유지 관리 Maintainability
1. 모듈화 구조 유지
2. 코드 리뷰 정책
3. 테스트 커버리지 80% 이상
4. SemVer 버전관리
5. 의존성 최소화
6. 리팩토링 정책
7. 한 파일에 너무 많은 기능 넣지 않기
8. 중복된 로직 제외
9. 유지보수 가능한 구조 제안

---

# 스킬셋 Skill Set
Role			Skills
1. Frontend		Html / Css / Scss / Tailwind CSS / JavaScript (ES6+) / TypeScript / React / Vue / Next.js / TypeScript / Python

2. Backend		Node.js / Spring / Java 21 (Spring Boot 3.x) / NestJS / FastAPI / Python / Spring Boot / RESTful API 설계 / 인			증/인가 (JWT, OAuth) / 예외 처리 구조화 / API Key 노출 금지(.env 사용)

3. Database		SQL / MySQL / PostgreSQL / Redis / AWS (EKS) / Terraform / MongoDB (Log / NoSQL) / API Key 노출 금지			(.env 사용)

4. Infra		AWS / Docker

5. CI/CD		GitHub / GitHub Actions / Jenkins CI/CD / AWS CI/CD / Amazon EC2 / Amazon ECS

---

# API Standard
RESTful API Level 3
Swagger(OpenAPI 3.0)
JSON 기반 표준
에러형식 코드 정의
명확한 리소스 중심 URL
표준 HTTP 상태 코드 사용
모든 API는 에러 응답 구조 통일
사용자 메시지와 내부 로그 분리
API Key 노출 금지(.env 사용)

예시
GET /users
POST /users
PUT /users/{id}
DELETE /users/{id}


응답 예시
{
"success": true,
"data": {}
}

---

# 시스템 아키텍쳐 System Architecture
마이크로서비스 / 모놀리식 / 하이브리드 선택 근거
계층형 구조 : UI - API Gateway - Business Logic - Data Access
관심사 분리 : 각 기능은 모듈화되어 서로의 영역을 침범하지 않습니다.

예시
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

---

# 도구 Observability
1. Prometheus
2. Grafana
3. ELK Stack
4. OpenTelemetry

모니터링 Monitoring
1. CPU
2. Memory
3. API Latency
4. Error Rate
5. DB Query Time

---

# 보안 정책 Security
1. HTTPS
2. JWT 인증
3. OWASP TOP 10 대응
4. XSS 방어
5. CSRF 방어
6. Rate Limiting
7. RBAC 접근제어 레벨 분리
8. Zero Trust Architecture
9. Secret Manager 사용
10. API Key 노출 금지(.env 활용)
11. 인증/인가 분리

---

# 성능 기준 Performance 프론트엔드는 Lighthouse 점수 90점 이상을 목표로 하며, 백엔드는 DB 인덱싱 최적화와 캐싱 전략을 수립합니다.
DB 인덱스 최적화, CDN 활용, 비동기 메시지 큐를 통한 부하 분산.
캐싱, 로드밸런싱, DB인덱싱 전략

1. API 응답 < 200ms
2. DB Index 최적화
3. Redis Cache
4. CDN 사용
5. Lazy Loading
6. Pagination
7. Query Plan 분석
8. 이미지 최적화
9. 불필요한 API 호출 방지
10. 불필요한 DB 조회 금지

---

# 배포 전략 Deployment Strategy Blue-Green Deployment 또는 Canary Release를 통한 무중단 배포.
CI/CD, Canary Release, Rollback 시나리오

1. Blue-Green Deployment
2. Canary Release
3. Rollback 전략
4. CI/CD 자동화
5. 개발 / 스테이징 / 운영 분리
6. GitHub / GitHub Actions / Jenkins CI/CD / AWS CI/CD / Amazon EC2 / Amazon ECS

---

# CI/CD Pipeline
예시
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


---

# 폴더 구조 Folder Structure

Frontend
예시
src/
├ components
├ pages
├ hooks
├ services
├ utils


Backend
예시
src/
├ controller
├ service
├ repository
├ domain

---

# 예외 처리 Exception Handling 전역 예외 처리기(Global Exception Handler)를 통한 표준 에러 코드 응답.
설계 변경 프로세스 문서화 (RFC 형식)

표준 에러 코드
예시
400 BAD REQUEST
401 UNAUTHORIZED
403 FORBIDDEN
404 NOT FOUND
500 SERVER ERROR

---

# 환경 분리 Deployment Environment
1. Local
2. Dev
3. Staging
4. Production

---

# 테스트 전략 QA Strategy
1. Unit Test
2. Integration Test
3. E2E Test
4. Load Test
5. Security Test

---

# CI 파이프라인에서 자동 수행 DevSecOps
1. SAST
2. DAST
3. Dependency Scan
4. Container Scan

---

# 프로젝트 핵심 원칙 Final Principle
1. 안정성 우선
2. 보안 우선
3. 유지보수성
4. 확장성
5. 자동화


# 개발 품질 단계 Code Quality Pipeline
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

---

## Lint 단계
도구
- ESLint
- Prettier
- SonarQube

규칙
1. 빌드 전 자동 실행
2. Warning 0
3. Error 0

---

## Static Analysis 목적 : 잠재적 버그 사전 탐지
도구
- SonarQube
- CodeQL

---

## Debug
규칙
1. Null Safety 확인
2. 예외 처리 명확화
3. Error Message 명확화

---

## 최적화 대상 Performance Optimization
1. DB Query
2. API Response
3. Frontend Rendering
4. Network Request

주의사항
성능 최적화 이후 **기능 변경 금지**

---

## Refactoring
규칙
1. 기능 변경 금지
2. 테스트 통과 필수
3. 코드 가독성 향상

---

## Regression Test : 리팩토링 이후 기존 기능 검증

---

## Final Lint Validation : 성능 최적화 이후 반드시 실행
1. Lint 재실행
2. Static Analysis 재실행
3. Unit Test 재실행
4. Memory Leak 검사
5. Dead Code 제거

---