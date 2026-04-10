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
- PII 방어
- SCA (Software Composition Analysis) : CI 파이프라인에서 오픈소스 라이브러리의 취약점을 자동 스캔한다. (Snyk, GitHub Dependency Graph)
- Container Scan : Docker 이미지 빌드 시 베이스 이미지의 취약점을 점검한다. (Trivy)
- Incident Response : 장애 발생 시 누가 승인하고 어떻게 전파하는지에 대한 '비상 연락망 및 대응 프로세스'

# 운영 도구 모니터링
- Prometheus
- Grafana
- ELK Stack
- OpenTelemetry
- CPU, Memory, API Latency, Error Rate, DB Query Time 모니터링
- DML Audit Log
- N+1 Query Detection
- Migration 관리 : Flyway, Liquibase
- Connection Pool : 대규모 트래픽 대비
- Connection Limit : 설정
- Deadlock : 모니터링 수치

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

gemini-review() {
  cat .GEMINI/.01_PRD.md | gemini "위 가이드라인을 목적, 문제, 범위, 사용자, 기대효과 정리해줘."
}

@portfolio/.GEMINI/01_PRD.md | gemini "위 가이드라인을 목적, 문제, 범위, 사용자, 기대효과 정리해줘."

---

gemini-review() {
  cat .GEMINI/.02_TRD.md | gemini "위 가이드라인을 API, DB, 구조, 성능, 예외, ARCHITECTURE, 구현 정리해줘."
}

@portfolio/.GEMINI/02_TRD.md | gemini "위 가이드라인을 API, DB, 구조, 성능, 예외, ARCHITECTURE, 구현 정리해줘."

---

gemini-review() {
  cat .GEMINI/.03_RULES.md | gemini "위 가이드라인을 협업, 승인, 커뮤니케이션, 책임 정리해줘."
}

@portfolio/.GEMINI/03_RULES.md | gemini "위 가이드라인을 협업, 승인, 커뮤니케이션, 책임 정리해줘."

---

gemini-review() {
  cat .GEMINI/.04_ROLES.md | gemini "위 가이드라인을 협업, 승인, 커뮤니케이션, 책임 정리해줘."
}

@portfolio/.GEMINI/04_ROLES.md | gemini "위 가이드라인을 협업, 승인, 커뮤니케이션, 책임 정리해줘."

---

gemini-review() {
  cat .GEMINI/.05_SECURITY.md | gemini "위 가이드라인을 보안, 인증, 인가, 암호화, 취약점 정리해줘."
}

@portfolio/.GEMINI/05_SECURITY.md | gemini "위 가이드라인을 보안, 인증, 인가, 암호화, 취약점 정리해줘."

---

gemini-review() {
  cat .GEMINI/.06_DEPLOYMENT.md | gemini "위 가이드라인을 배포, 환경, CI/CD, 롤백, 운영 정리해줘."
}

@portfolio/.GEMINI/06_DEPLOYMENT.md | gemini "위 가이드라인을 배포, 환경, CI/CD, 롤백, 운영 정리해줘."

---

gemini-review() {
  cat .GEMINI/.07_QA.md | gemini "위 가이드라인을 테스트, 검증, 부하, 회귀 정리해줘."
}

@portfolio/.GEMINI/07_QA.md | gemini "위 가이드라인을 테스트, 검증, 부하, 회귀 정리해줘."

---

gemini-review() {
  cat .GEMINI/.08_ADR.md | gemini "위 가이드라인을 결정이 필요한 배경과 비즈니스 요구사항 및 선택한 기술/패턴 및 구현 방식 정리해줘."
}

@portfolio/.GEMINI/08_ADR.md | gemini "위 가이드라인을 결정이 필요한 배경과 비즈니스 요구사항 및 선택한 기술/패턴 및 구현 방식 정리해줘."

---