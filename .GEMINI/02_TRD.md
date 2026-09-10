# 02_TRD.md

---

# [가이드] 범용 기술 상세 설계서 (Universal TRD Guide)

---

## 1. 개요 및 목적
본 문서는 **어떠한 프로그래밍 언어나 프레임워크를 사용하는 프로젝트에도 공통 적용되는 기술 상세 설계서(TRD) 작성 표준이자 실행 템플릿**입니다.

OpenAI 하네스 엔지니어링의 핵심은 프롬프트 상의 권고가 아닌, **시스템과 도구가 기계적으로 코드 품질을 강제하는 '예측 가능한 가이드라인(Deterministic Rails)'**의 구축에 있습니다. 본 문서는 시스템 구조, 인터페이스 계약, 그리고 에이전트의 자가 치유(Self-Repair)를 위한 에러 규격을 정의합니다.

---

## 2. 불변의 코드 품질 기준 (Engineering Invariants)
어떤 기술 스택(Node.js, Spring, Python, Go, Rust 등)을 사용하든 아래 기준은 로컬 Git 훅과 CI 파이프라인에서 **기계적으로 검사되어 위반 시 즉시 빌드가 차단(Hard Block)**되어야 합니다.

| 점검 항목 | 상한 기준 | 기계적 강제 도구 예시 |
| :--- | :--- | :--- |
| **함수/메서드 길이** | 50줄 이하 | ESLint `max-lines-per-function`, Checkstyle, flake8 |
| **클래스/파일 길이** | 300줄 이하 | ESLint `max-lines`, SonarQube |
| **중첩 깊이 (Depth)** | 3단계 이하 | ESLint `max-depth`, Checkstyle |
| **순환 복잡도 (Complexity)** | Cyclomatic 10 이하 | ESLint `complexity`, Radon, CodeMetrics |
| **빌드 경고 허용치** | **Warning 0, Error 0** | CI 플래그 (`--max-warnings=0`, `-Werror` 등) |
| **테스트 커버리지** | 도메인 로직 80% 이상 | Jest, Pytest-cov, JaCoCo, Go cover |
| **도메인 계층 격리** | 순수 도메인의 외부 의존성 차단 | ArchUnit, dependency-cruiser, ts-morph |

---

# [템플릿] 프로젝트 TRD 실행 양식 (Universal TRD Template)
*신규 프로젝트 설계 시 Architecture Squad가 프로젝트 스택에 맞춰 작성하는 표준 양식입니다.*

```markdown
---
project_name: "{{프로젝트명}}"
version: "1.0.0"
author_squad: "Architecture Squad"
status: "DRAFT | IN_REVIEW | APPROVED"
referenced_prd: "01_PRD.md (v1.0.0)"
created_at: "{{YYYY-MM-DD}}"
updated_at: "{{YYYY-MM-DD}}"
---

# 1. 시스템 아키텍처 및 계층 분리 (Architecture & Layering)
- **적용 패턴**: 헥사고날 아키텍처 (Hexagonal Architecture / Ports and Adapters)
- **계층 분리 원칙**:
  - **도메인(Core Domain)**: 순수 비즈니스 로직만 포함하며, 프레임워크나 데이터베이스, 외부 API 라이브러리를 직접 import하지 않는다.
  - **포트(Ports)**: 도메인이 외부와 소통하기 위한 순수 인터페이스(Inbound/Outbound).
  - **어댑터(Adapters)**: 컨트롤러, 웹 라우터, ORM, 외부 클라이언트 등 기술적 구현체.

```text
[클라이언트 요청]
       │
       ▼
[인바운드 어댑터 (Controller / Router)]
       │
       ▼ (Port Interface)
[코어 도메인 (Entities & Domain Services)]  ← 순수 비즈니스 로직
       │
       ▼ (Port Interface)
[아웃바운드 어댑터 (DB Repository / External Client Sandbox)]
```

# 2. 기술 스택 및 검증 도구 어댑터 매핑 (Tooling Adapter Matrix)
*프로젝트에 선택된 기술 스택과 각 계층별 하네스 검증 도구를 명확히 매핑합니다.*

| 계층 (Layer) | 채택 기술 | 정적 분석 / 린트 도구 | 테스트 실행 도구 |
| :--- | :--- | :--- | :--- |
| **UI / 프론트엔드** | {{예: Next.js / TypeScript}} | {{ESLint / Prettier}} | {{Vitest / Playwright}} |
| **코어 / 백엔드** | {{예: NestJS / Spring Boot / FastAPI}} | {{SonarQube / Checkstyle}} | {{Jest / JUnit / Pytest}} |
| **데이터베이스** | {{예: PostgreSQL / Redis}} | {{Flyway / Prisma / Liquibase}} | {{Testcontainers}} |
| **인프라 / 배포** | {{예: Docker / AWS ECS / K8s}} | {{Trivy / Hadolint}} | {{k6 (부하 테스트)}} |

# 3. 인터페이스 명세 및 데이터 검증 (API & Data Validation)
- 모든 외부 입력값은 런타임 스키마 검증기({{Zod / class-validator / Pydantic}})를 통해 엄격히 검증한다.
- **표준 에러 응답 규격**: 시스템 내부 예외 스택을 노출하지 않고 일관된 응답 구조를 유지한다.

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT | UNAUTHORIZED | NOT_FOUND | INTERNAL_ERROR",
    "message": "사용자에게 노출 가능한 안전한 안내 문구",
    "traceId": "trace-uuid-1234"
  },
  "timestamp": "2026-09-10T15:00:00Z"
}
```

# 4. 자가 치유 에러 피드백 규격 (Self-Repair Error Envelope)
파이프라인 검증 실패 시, 에이전트가 최소한의 토큰으로 결함을 식별할 수 있도록 아래 JSON 구조로 요약 피드백을 전달한다.

```json
{
  "status": "VALIDATION_FAILED",
  "stage": "LINT | UNIT_TEST | BUILD",
  "violations": [
    {
      "file": "src/domain/{{대상파일명}}",
      "line": 42,
      "rule": "COMPLEXITY_LIMIT | FUNCTION_LENGTH | TEST_FAILURE",
      "actual": "실제 발생한 위반 내용 (예: 복잡도 14 초과, 테스트 실패)",
      "expected": "하네스가 요구하는 정상 기준치"
    }
  ],
  "retryBudget": { "attempt": 1, "maxAttempts": 3 },
  "instruction": "기존 비즈니스 로직 동작을 변경하지 않고, 위반된 규칙을 만족하도록 리팩토링하라."
}
```

# 5. 아키텍처 제약 및 의존성 규칙 (Dependency Rules)
1. `domain` 모듈은 `infrastructure` 또는 `database` 패키지를 참조할 수 없다.
2. 모든 의존성은 외부에서 내부(도메인) 방향으로만 향해야 한다.
3. 빌드 단계에서 아키텍처 검증 도구를 구동하여 의존성 규칙 위반 시 즉시 컴파일을 중단한다.

---