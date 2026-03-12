# Context Engineering Project Guideline

# 본 문서는 프로젝트 전반의 의사결정, 협업 규칙, 개발 표준, 아키텍처 방향성을 명확히 정의하기 위한 실행 가이드입니다.
1. 대상: 프론트엔드, 백엔드, 풀스택, UI/UX, DBA, 보안, QA, 기획, 마케팅, 인프라 시니어 전문가

# Context (컨텍스트) 프로젝트의 본질적 배경, 문제 정의, 비즈니스 환경, 콘텍스트을 설명합니다.
Background (백그라운드)
1. 현재 해결해야 하는 문제
2. 시장 상황
3. 내부 조직 요구사항

Problem Statement (시스템 문제) 현재 시스템의 문제
1. 확장성 부족
2. 사용자 경험 문제
3. 운영 비용 증가
4. 보안 취약점

Project Scope (프로젝트 범위)
포함 범위
1. 신규 서비스 개발
2. 기존 시스템 개선
3. API 플랫폼 구축

제외 범위
1. 외부 파트너 시스템
2. 레거시 시스템 리팩토링

규칙(Rule) 정의: 커뮤니케이션 및 협업 방식

책임(Responsibility) 정의: 상세 R&R 확정

PRD (Product Requirements Document): 제품 요구사항 정의서

TRD (Technical Requirements Document): 기술 상세 설계서

# Persona (페르소나)
Primary: 복잡한 데이터 처리를 실시간으로 확인하고자 하는 엔터프라이즈 유저.
Secondary: 안정성과 보안성을 최우선으로 고려하는 사내 운영진 및 관리자.
custom: 실제 타겟 고객 또는 사용자 유형

Primary Persona (신규 페르소나)
Persona		Description
1. End User		서비스를 사용하는 일반 사용자
2. Admin		관리자
3. Operator		운영 담당자

Technical Persona (기술 페르소나)
Role			Responsibility
1. Developer	서비스 개발
2. Designer		UX 설계
3. QA			품질 검증
4. DevOps		인프라 운영

포함 내용:
1. 사용자 유형, 목표, 니즈, Pain Points
2. 시스템 사용 시나리오 (User Journey Map 포함 가능)

# Vision (비전) 프로젝트의 장기적 방향성 "기술적 한계를 뛰어넘는 사용자 중심의 무결성 기반의 시스템 확장 가능한 플랫폼 구축"
핵심 비전
1. Scalability
2. Security
3. User Experience
4. User Experience
5. long-term direction

# Goal (목표)
Business Goal (비지니스 목표)
1. 사용자 증가
2. 매출 증가
3. 운영 효율화

Technical Goal (기술 목표)
1. 응답 속도 < 200ms 대용량 트래픽 상황에서도 응답 속도 200ms 이내 유지
2. 시스템 가용성 99.9% 이상의 서비스 업타임 확보
3. 제로 트러스트(Zero Trust) 아키텍처 구현
4. 자동 배포 환경 구축
5. 사용자의 만족도 향상, 개발 문화 개선 등

# Role (역할 정의) 10명의 시니어 전문가 역할
Role					Description
1. Frontend Developer		UI 개발
2. Backend Developer		서버 개발, 비즈니스 로직 구현 및 API 설계
3. Fullstack Developer		전체 서비스 개발
4. UI/UX Designer		UX 설계 사용자 여정(User Journey) 및 와이어프레임 최적화, 디자인 시스템 구축
5. DBA				DB 설계 데이터 모델링, 쿼리 튜닝, 샤딩 전략 수립, DB Schema 설계 및 최적화
6. Security Engineer		방화벽, 인증/인가(OAuth2), 암호화 프로토콜, 보안정책 및 접근제어 설계
7. QA Engineer			테스트, 자동화 테스트 구축, 부하 테스트, 회귀 테스트, 품질 정책 정의 및 테스트케이스 작성
8. Planner				서비스 기획, 요구사항 구체화, 비즈니스 로직 정의, 로드맵 관리
9. Marketer				마케팅 전략, 시장 분석, 유저 피드백 수집, SEO 및 성장 지표 관리
10. Infra Engineer		인프라 구축, K8s 클러스터 운영, 배포 CI/CD 파이프라인, 모니터링 구성

# Rule (프로젝트 규칙)
Project Operation Rule
1. Agile 기반 Sprint 운영
2. Sprint 기간 : 2주
3. Daily Standup : 15분

Schedule Rule
Phase		Duration
1. Planning		2 weeks
2. Development	12 weeks
3. QA			4 weeks

Documentation Rule 모든 문서는 Markdown 기반
1. 예시
/docs
 ├ PRD.md
 ├ TRD.md
 ├ Architecture.md
 ├ API.md

Output Rule AI 또는 개발자가 작성하는 출력 규칙
1. 구조적 답변: Markdown 을 활용해 제목, 표, 리스트로 가독성을 높인다
2. 코드 블록 사용
3. JSON / YAML 표준 사용
4. 두괄식 답변: 모든 답변의 첫 줄은 핵심 요약으로 시작합니다.
5. 쉬운 비유: 기술 개념 설명 시 일상적인 예시(식당, 택배, 도서관 등) 을 활용합니다.
6. 용어 풀이: 답변 하단에 사용된 어려운 IT 용어를 별도로 설명합니다.
7. 추측하지 말고 정보가 부족하면 질문합니다

# Responsibility (R&R)
R&R: 각 파트장은 코드 리뷰 및 최종 아키텍처 승인 권한을 가짐.
주요 책임: 시니어로서 기술 가이드 제시 및 주니어 개발자 멘토링 병행.
제약 조건: 외부 라이브러리 도입 시 보안팀(Security) 승인 필수.
기술-비즈니스 언어 가교: 복잡한 기술 요구사항을 비전공자도 이해할 수 있는 비즈니스 언어로 변환 적용합니다.
기술적 멘토링: 주니어 코드를 리뷰하고 유지보수가 쉬운 방향(Clean Code)을 제시 적용합니다.
표준 수호: 프로젝트의 코딩 규칙과 보안 가이드라인이 준수되도록 관리 적용합니다.

제약조건 (Constraints)
1. 불확실한 정보는 추측하지 않고 명확히 표시합니다.
2. 특정 스택 강요하지 않음 (상황 기반 제안)
3. 과도한 이론 설명 지양 -> 실무 중심
4. 보안 취약한 방법 제안 금지
5. 최신 트렌드보다 안정성 우선

Frontend Developer
책임
1. UI 개발
2. 상태 관리
3. 성능 최적화

제약
1. 디자인 시스템 준수

Backend Developer
책임
1. API 개발
2. 비즈니스 로직
3. 인증 시스템

DBA
책임
1. 데이터 모델링
2. 성능 튜닝
3. 백업 정책

Security Engineer
책임
1. 취약점 분석
2. 보안 정책
3. 접근 제어

QA
책임
1. 테스트 케이스 작성
2. 자동화 테스트

Infra
책임
1. 클라우드 인프라
2. CI/CD

# PRD (Product Requirements Document) PRD는 기획 중심 문서입니다. "무엇을 (What), 왜 (Why) 만드는가?"
핵심 기능: 핵심 가치 전달을 위한 기능 명세서.
사용자 흐름: 유저가 진입 후 전환에 이르는 모든 경로.
성공 지표: 목표 달성을 측정할 KPI 설정.

Product Overview (제품개요)
1. 서비스 설명

Target Users (타겟유저)
1. 일반 사용자
2. 관리자

Core Features (핵심기능)
Feature			Description
1. Login			사용자 로그인
2. Dashboard		데이터 시각화
3. Admin Panel		관리자 기능

User Flow (유저플로우)
1. 예시
User
 ↓
Login
 ↓
Dashboard
 ↓
Service Feature

# TRD (Technical Requirements Document) TRD는 개발 중심 문서입니다. "어떻게(How) 기술적으로 구현할 것인가?를 정의합니다."
인터페이스 명세: 시스템 간 통신 방식 (gRPC, REST, Kafka).
인프라 구성도: 클라우드 리소스 배치 및 네트워크 토폴로지.

System Overview (시스템오버뷰)
1. 전체 시스템 구조

Architecture (아키텍쳐)
1. 예시
Client
 ↓
API Gateway
 ↓
Backend Services
 ↓
Database

Data Flow (데이터 흐름)
1. 예시
User Request
 ↓
Load Balancer
 ↓
Application Server
 ↓
Database

# Development Standard & Architecture
Technology Stack (기술스택)
Layer			Technology
1. Frontend		Html / Css / Scss / Tailwind CSS / JavaScript (ES6+) / TypeScript / React / Vue / Next.js / TypeScript / Python
2. Backend		Node.js / Spring / Java 21 (Spring Boot 3.x) / NestJS / FastAPI / Python / Spring Boot
3. Database		SQL / MySQL / PostgreSQL / Redis / AWS (EKS) / Terraform / MongoDB (Log / NoSQL)
4. Infra		AWS / Docker
5. CI/CD		GitHub / GitHub Actions / Jenkins CI/CD / AWS CI/CD / Amazon EC2 / Amazon ECS

# Comment Standard (코멘트 기준 주석처리)
주석 및 규칙
1. JSDoc
2. JavaDoc
3. TypeDoc
4. Swagger
5. Docstring
6. 표준화 준수
7. 모든 주석 한국어 처리
8. 어떻게(HOW)보다 왜 (Why) 를 설명하는 주석 작성
9. 복잡한 로직에는 흐름 설명 포함
10. 비즈니스 로직은 반드시 설명 포함
11. TODO 는 명확히 작성

12. 예시
/**
 * 사용자 로그인 처리
 * @param email
 * @param password
 * @returns token
 */

# Coding Rules (코딩규칙)
1. Clean Code (클린 코드) 원칙 준수
2. SOLID Principles
3. DRY (중복 제거)
4. 복잡도(Cyclomatic Complexity) 10 이하 유지
5. ESLint
6. Prettier
7. Naming Convention
8. 가독성: 변수명은 줄여 쓰지 않습니다. data 대신 userProfileData 와 같이 의미가 명확한 변수명을 사용합니다.
9. 단일 책임(SRP): 하나의 함수 / 클래스는 반드시 하나의 일만 수행합니다.
10. 불변성: 원본 데이터를 직접 수정하지 않고 새로운 객체를 변환합니다.
11. Error Handling: "알 수 없는 에러"와 같은 메시지 대신, 사용자가 다음에 무엇을 해야 하는지 안내하는 예외 처리를 권장합니다.
12. Security: API Key(.env 활용) 노출 금지, 환경 변수 (.env) 사용, SQL Injection 방지 로직을 기본적으로 적용합니다.
13. KISS (단순성 유지)
14. 명확한 책임 분리 (SRP)
15. 읽기 쉬운 코드
16. 매직 넘버 금지
17. 코딩 특정 작업시 해당 기능이 기존에 있는지 기존 기능 수정시 다른 부분 영향은 없는지 필수 확인 할 것

# Maintainability (유지 관리)
1. 모듈화
2. 코드 리뷰
3. 테스트 커버리지 80%
4. Clean Code (클린 코드) 원칙 준수
5. 복잡도(Cyclomatic Complexity) 10 이하 유지.
6. 버전 규칙(SemVer)
7. 코드리뷰 정책
8. 매직 넘버 금지 -> 상수화
9. 의존성 최소화
10. 모듈화 구조 유지
11. 한 파일에 너무 많은 기능 넣지 않기
12. 중복된 로직 제외
13. 코드 리뷰 가능한 수준의 코드 형태 유지
14. 리팩토링 방향 제시
15. 유지보수 가능한 구조 제안

# Skill Set (스킬셋)
Role			Skills
1. Frontend		Html / Css / Scss / Tailwind CSS / JavaScript (ES6+) / TypeScript / React / Vue / Next.js / TypeScript / Python

2. Backend		Node.js / Spring / Java 21 (Spring Boot 3.x) / NestJS / FastAPI / Python / Spring Boot / RESTful API 설계 / 인			증/인가 (JWT, OAuth) / 예외 처리 구조화 / API Key 노출 금지(.env 사용)

3. Database		SQL / MySQL / PostgreSQL / Redis / AWS (EKS) / Terraform / MongoDB (Log / NoSQL) / API Key 노출 금지			(.env 사용)

4. Infra		AWS / Docker

5. CI/CD		GitHub / GitHub Actions / Jenkins CI/CD / AWS CI/CD / Amazon EC2 / Amazon ECS

# API Standard (API 기준)
RESTful API 성숙도 모델 Level 3 지향, Swagger(OpenAPI 3.0) 필수.
JSON 기반 표준, 에러형식 코드 정의
명확한 리소스 중심 URL
표준 HTTP 상태 코드 사용
모든 API는 에러 응답 구조 통일
사용자 메시지와 내부 로그 분리
API Key 노출 금지(.env 사용)

REST API 기준
1. 예시
GET /users
POST /users
PUT /users/{id}
DELETE /users/{id}

응답 형식
1. 예시
{
 "success": true,
 "data": {}
}

# System Architecture (시스템 아키텍쳐)
마이크로서비스 / 모놀리식 / 하이브리드 선택 근거
계층형 구조 : UI - API Gateway - Business Logic - Data Access
관심사 분리 : 각 기능은 모듈화되어 서로의 영역을 침범하지 않습니다.

1. 예시
CDN
 ↓
Load Balancer
 ↓
Application Server
 ↓
Cache (Redis)
 ↓
Database

# Folder Structure (폴더구조)
Frontend
1. 예시
src/
 ├ components
 ├ pages
 ├ hooks
 ├ services
 ├ utils

Backend
1. 예시
src/
 ├ controller
 ├ service
 ├ repository
 ├ domain

1. 예시
src/ 
├── app/			# Next.js App Router (Routing)
├── components/ 		# UI 컴포넌트 (Atomic Design) 
│ 	├── common/ 	# 공용 버튼, 입력창 등 
│ 	└── layout/ 		# 페이지 레이아웃
├── hooks/ 			# 커스텀 훅 (비즈니스 로직 분리)
├── services/ 			# API 통신 클래스/함수
├── store/ 			# 전역 상태 관리 (Zustand/Redux) 
├── types/			# TypeScript 타입 정의
└── utils/ 			# 공통 유틸 함수 (날짜 포맷 등)

# Exception Handling (예외처리)
전역 예외 처리기(Global Exception Handler)를 통한 표준 에러 코드 응답.
설계 변경 프로세스 문서화 (RFC 형식)

표준 에러 코드
1. 예시
400 BAD REQUEST
401 UNAUTHORIZED
500 SERVER ERROR

# Security (보안) 모든 API 는 JWT 인증 및 Role-Based 권한 제어를 거칩니다. 민감한 정보는 DB에 저장할 때 반드시 암호화합니다.
SQL Injection 방지, JWT 기반 무상태 인증, 데이터 암호화(AES-256).
인증(SSO, JWT), 접근제어(RBAC), 암호화 규칙

보안 정책
1. HTTPS
2. JWT 인증
3. OWASP TOP 10 대응
4. XSS / CSRF 방어
5. Rate Limiting
6. 접근제어 레벨 분리 (RBAC)
7. 인증/인가 분리
8. API Key 노출 금지(.env 활용)

# Performance (성능) 프론트엔드는 Lighthouse 점수 90점 이상을 목표로 하며, 백엔드는 DB 인덱싱 최적화와 캐싱 전략을 수립합니다.
DB 인덱스 최적화, CDN 활용, 비동기 메시지 큐를 통한 부하 분산.
캐싱, 로드밸런싱, DB인덱싱 전략

성능 기준
1. API 응답 < 200ms
2. DB Query 최적화
3. CDN 캐싱
4. DB 인덱싱
5. 캐싱 전략
6. 이미지 최적화
7. API 응답 200ms 이하 목표
8. 캐시 사용 (Redis 등)
9. 불필요한 API 호출 방지
10. 불필요한 DB 조회 금지
11. Lazy Loading
12. 대용량 처리 시 페이징 필수
13. 인덱스 고려

# Deployment Strategy (배포전략)
Blue-Green Deployment 또는 Canary Release를 통한 무중단 배포.
CI/CD, Canary Release, Rollback 시나리오

배포 전략
1. Blue-Green Deployment
2. Canary Release
3. 개발 / 스테이징 / 운영 분리
4. CI/CD 자동화
5. 롤백 전략 필수
6. GitHub / GitHub Actions / Jenkins CI/CD / AWS CI/CD / Amazon EC2 / Amazon ECS

CI/CD
1. 예시
Commit
 ↓
Build
 ↓
Test
 ↓
Deploy