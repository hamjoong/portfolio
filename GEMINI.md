# Context Engineering & Workspace Rule Router

이 문서는 Antigravity CLI(`agy`) 및 Gemini AI 에이전트를 위한 **최상위 컨텍스트 엔지니어링 가이드라인이자 라우터(Router)**입니다.
상세한 하네스 엔지니어링 실행 규칙 / 권한 통제 / 전문 직무 R&R 및 검증 스크립트는 [`.Agent/AGENTS.md`](.Agent/AGENTS.md) 및 하위 정책에 정의되어 있으며 에이전트는 이를 필수로 준수합니다.

---

## 1. 운영 기준 및 핵심 원칙

- **10명의 시니어 전문가 협업 기준**: 사용자 요청의 성격에 따라 프론트엔드 / 백엔드 / 풀스택 / UI/UX / DBA / 보안 / QA / 기획 / 마케팅 / 인프라 중 필요한 전문가를 선별 호출하여 협업합니다.
- **5대 대원칙**: 안정성 우선 / 보안 우선 / 유지보수성 우선 / 확장성 우선 / 자동화 우선
- **실무 중심 & 오버엔지니어링 절대 금지**: 특정 기술 스택 강요를 금지하며 / 최신 트렌드보다 검증된 안정성을 우선하며 불확실한 정보는 추측하지 않고 명확히 표시합니다.
- **체급별 비례 적용 (3-Tier Proportional Model)**: 경량 스크립트 / 알고리즘(Tier 1) / 클라이언트 앱(Tier 2) / 풀스택 서비스(Tier 3)에 맞게 품질 및 인프라 기준을 차등 적용합니다.

---

## 2. 작업 권한 계층 요약 (Authority Levels)

- **Level 0 (Read)**: 무변경 단순 파일 조회 (자율 실행)
- **Level 1 (Analyze)**: 소스 / 의존성 / Git 상태 무변경 심층 분석 (`git status` / `git diff` / `git log` 조회 허용)
- **Level 2 (Project Modification)**: 사용자가 명시적으로 지시한 특정 프로젝트 단일 수정 (타 프로젝트 접근 엄격 차단)
- **Level 3 (Controlled Operations)**: Git 쓰기/푸시 / 패키지 설치 / 환경 / 인프라 / DB 변경 / 하네스 자체 변경 -> **반드시 사용자 사전 승인 후 실행** (저장소 삭제 절대 금지)

---

## 3. 핵심 문서 작성 및 코드 주석 원칙

- **문서화 원칙**: 모든 문서는 번역 오류 없는 자연스럽고 명확한 한국어로 작성합니다.
- **코드 주석(Comment)**: "어떻게(What)"가 아닌 **"왜(Why - 설계 이유 / 비즈니스 맥락 / 예외 처리 이유)"** 중심으로 한국어로 작성합니다.
- **개별 프로젝트 README**: 프로젝트 특성 분석 후 7대 필수 항목(프로젝트명 / 소개 / 주요기능 / 기술스택/이유 / 아키텍처 / 실행방법 / 트러블슈팅 / FAQ)을 반영하여 작성합니다.

---

## 4. 하네스 시스템 및 상세 문서 참조 맵 (Progressive Disclosure)

상세 내용이 필요할 때 에이전트는 해당 경로의 문서를 참조(`view_file`)하여 적용합니다.

| 분류 | 문서/디렉터리 경로 | 핵심 내용 |
| :--- | :--- | :--- |
| **통제 헌장** | [`.Agent/AGENTS.md`](.Agent/AGENTS.md) | Antigravity 최상위 실행 하네스 헌장 |
| **최고 헌법** | [`.Agent/constitution/`](.Agent/constitution/) | 핵심 원칙 / 권한 계층 / 안전 수칙 / 프로젝트 격리 / 변경 통제 |
| **전문가 R&R**| [`.Agent/roles/`](.Agent/roles/) | 10대 전문가 페르소나 및 3-Tier 프로파일링 규칙 |
| **운영 정책** | [`.Agent/policies/`](.Agent/policies/) | 단일 수정 / Git/GitHub 통제 / Why 주석 / 하네스 자체 개선 정책 |
| **워크플로우** | [`.Agent/workflows/`](.Agent/workflows/) | 작업 흐름 / Level 1 분석 / Git 워크플로우 / 다중 협업 / 하네스 개선 |
| **품질 검증** | [`.Agent/quality/`](.Agent/quality/) | 12단계 품질 파이프라인 / 코딩 표준 |
| **프로젝트 현황** | [`.Agent/knowledge/project-registry.md`](.Agent/knowledge/project-registry.md) | 11개 하위 프로젝트 성격 및 체급 매트릭스 |
| **자동화 도구** | [`.Agent/scripts/detect-changes.sh`](.Agent/scripts/detect-changes.sh) | 타 프로젝트 오염 감지 무결성 검증 스크립트 |

---

### 10대 표준 엔지니어링 문서 템플릿 (`.Agent/documentation/templates/`)
- [PRD 템플릿](.Agent/documentation/templates/prd-template.md) : 제품 요구사항 정의서
- [TRD 템플릿](.Agent/documentation/templates/trd-template.md) : 기술 상세 설계서 (API 표준 / 코딩 규칙 포함)
- [ADR 템플릿](.Agent/documentation/templates/adr-template.md) : 아키텍처 의사결정 기록 (Hexagonal / Circuit Breaker 등)
- [SECURITY 템플릿](.Agent/documentation/templates/security-template.md) : Zero Trust / Secret 관리 / 접근 제어
- [DEPLOYMENT 템플릿](.Agent/documentation/templates/deployment-template.md) : Blue-Green / Canary / CI/CD / DevSecOps
- [QA 템플릿](.Agent/documentation/templates/qa-template.md) : 커버리지 80% / 회귀 테스트 / 품질 파이프라인
- [RULES 템플릿](.Agent/documentation/templates/rules-template.md) : 협업 및 스프린트 운영 규칙
- [ROLES 템플릿](.Agent/documentation/templates/roles-template.md) : 10개 역할별 승인 권한 및 책임 범위

---