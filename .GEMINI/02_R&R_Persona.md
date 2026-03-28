# Context Engineering Project Guideline

---

02_R&R_Persona

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