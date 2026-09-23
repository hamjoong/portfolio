# Context Engineering & Workspace Rule Router

이 문서는 Antigravity CLI(`agy`) 및 Gemini AI 에이전트를 위한 **최상위 컨텍스트 엔지니어링 가이드라인이자 라우터(Router)**입니다.
상세한 하네스 엔지니어링 실행 규칙 / 권한 통제 / 전문 직무 R&R 및 검증 스크립트는 .Agent/AGENTS.md 및 하위 정책에 정의되어 있으며 에이전트는 이를 필수로 준수합니다.

@.Agent/AGENTS.md

---

## 1. 운영 기준 및 핵심 원칙

- **직무별 관점 점검 (Specialist Perspectives)**: 작업의 성격(프론트엔드/백엔드/UI/DBA/보안/QA/인프라 등)에 맞추어 전문 엔지니어 관점의 체크리스트를 적용하여 검토합니다.
- **5대 대원칙**: 안정성 우선 / 보안 우선 / 유지보수성 우선 / 확장성 우선 / 자동화 우선
- **실무 중심 & 오버엔지니어링 절대 금지**: 특정 기술 스택 강요를 금지하며, 불필요한 고비용 인프라(K8s/Blue-Green 등)를 토이/경량 프로젝트에 강요하지 않습니다. 불확실한 정보는 추측하지 않고 사용자에게 확인합니다.
- **체급별 비례 적용 (3-Tier Proportional Model)**: 경량 스크립트(Tier 1) / 클라이언트 앱(Tier 2) / 풀스택 서비스(Tier 3)에 맞게 검증 수준과 인프라 기준을 차등 적용합니다.

---

## 2. 작업 권한 계층 요약 (Authority Levels)

- **Level 0 (Read)**: 전체 프로젝트 및 파일 무변경 조회/탐색 (자율 실행)
- **Level 1 (Analyze)**: 소스 / 의존성 / Git 상태 무변경 심층 분석 (`git status` / `git diff` / `git log` 조회 허용)
- **Level 2 (Project Modification)**: 사용자가 명시적으로 지시한 특정 대상 프로젝트 내부 소스/문서 단일 수정 (타 프로젝트 파일 수정 엄격 차단)
- **Level 3 (Controlled Operations)**: Git 쓰기/푸시 / 신규 패키지 설치 / 시스템 환경 / DB 마이그레이션 / 하네스 자체 변경 -> **반드시 사용자 사전 승인 후 실행** (저장소 삭제 절대 금지)

---

## 3. 핵심 문서 작성 및 코드 주석 원칙

- **문서화 원칙**: 모든 문서는 번역 오류 없는 자연스럽고 명확한 한국어로 작성합니다.
- **코드 주석(Comment)**: "어떻게(What)"가 아닌 **"왜(Why - 설계 이유 / 비즈니스 맥락 / 예외 처리 이유)"** 중심으로 한국어로 작성합니다.
- **개별 프로젝트 README**: 프로젝트 특성 분석 후 필수 항목을 반영하여 작성합니다.
  [프로젝트 이름]
  1. 프로젝트 소개: 서비스의 핵심 가치를 타겟 사용자의 관점으로 한 줄 요약
  2. 프로젝트 개요: 제작 배경 / 기획 의도 / 프로젝트 목표 중심
  3. 주요 기능: 핵심 기능을 사용자 관점 목록 및 설명
  4. 기술 스택: 사용 기술 (언어 / 프레임워크 / 라이브러리 / DB / 인프라)
  5. 기술 선택 이유: 해당 기술을 선택한 현실적이고 실무적인 이유
  6. 시스템 아키텍처: 계층 구조 및 모듈 간 관계 (서버 / DB / 외부 API) / 다이어그램으로 표현한다.
  7. 프로젝트 폴더 구조: 디렉터리 구조 트리 (디렉터리 다이어그램으로 표현)
  8. 트러블슈팅: 개발 중 직면했던 문제 / 원인 / 구체적인 해결 과정 결과 (Why/How)
  9. 성능 개선: 성능 개선 포인트 (렌더링 최적화 / 쿼리 튜닝 / 번들 크기 절감 등) / 개선 전/후 수치와 측정 방법
  10. 실행 및 테스트 방법: 로컬 환경 요구사항 (Node 버전 / 브라우저 등) / 설치 및 실행 명령어 (`npm install` / `npm start` / 등) / 테스트 실행 방법

---

## 4. 하네스 시스템 및 상세 문서 참조 맵 (Progressive Disclosure)

상세 내용이 필요할 때 에이전트는 해당 경로의 문서를 참조(`view_file`)하여 적용합니다.

| 분류 | 문서/디렉터리 경로 | 핵심 내용 |
| :--- | :--- | :--- |
| **통제 헌장** | [`.Agent/AGENTS.md`](.Agent/AGENTS.md) | Antigravity 최상위 실행 하네스 헌장 |
| **최고 헌법** | [`.Agent/constitution/`](.Agent/constitution/) | 핵심 원칙 / 권한 계층 / 안전 수칙 / 프로젝트 경계 / 변경 통제 |
| **전문가 관점**| [`.Agent/roles/`](.Agent/roles/) | 직무별 체크리스트 및 3-Tier 프로파일링 가이드 |
| **운영 정책** | [`.Agent/policies/`](.Agent/policies/) | 단일 수정 / Git 통제 / Why 주석 / 하네스 자체 개선 정책 |
| **워크플로우** | [`.Agent/workflows/`](.Agent/workflows/) | 작업 흐름 / Level 1 분석 / Git 워크플로우 / 다중 협업 절차 |
| **품질 검증** | [`.Agent/quality/`](.Agent/quality/) | 품질 파이프라인 및 코딩 표준 (Tier별 비례 적용) |
| **프로젝트 현황** | [`.Agent/knowledge/project-registry.md`](.Agent/knowledge/project-registry.md) | 11개 하위 프로젝트 성격 및 체급 매트릭스 |
| **자동화 도구** | [`.Agent/scripts/`](.Agent/scripts/) | 타 프로젝트 오염 감지 및 Secret 검출 무결성 검증 도구 |

---

## 5. 개발 엔지니어링 표준 문서 템플릿 (`.Agent/documentation/templates/`)
- [PRD 템플릿](.Agent/documentation/templates/prd-template.md) : 제품 요구사항 정의서
- [TRD 템플릿](.Agent/documentation/templates/trd-template.md) : 기술 상세 설계서 (API 표준 / 코딩 규칙 포함)
- [ADR 템플릿](.Agent/documentation/templates/adr-template.md) : 아키텍처 의사결정 기록 (Hexagonal / Circuit Breaker 등)
- [SECURITY 템플릿](.Agent/documentation/templates/security-template.md) : Zero Trust / Secret 관리 / 접근 제어
- [DEPLOYMENT 템플릿](.Agent/documentation/templates/deployment-template.md) : Blue-Green / Canary / CI/CD / DevSecOps
- [QA 템플릿](.Agent/documentation/templates/qa-template.md) : 커버리지 80% / 회귀 테스트 / 품질 파이프라인
- [RULES 템플릿](.Agent/documentation/templates/rules-template.md) : 협업 및 스프린트 운영 규칙
- [ROLES 템플릿](.Agent/documentation/templates/roles-template.md) : 10개 역할별 승인 권한 및 책임 범위