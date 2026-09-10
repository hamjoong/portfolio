# 04_ROLES.md

---

# [가이드] 범용 심포니 다중 에이전트 오케스트레이션 (Universal Roles Guide)

---

## 1. 개요 및 목적
본 문서는 OpenAI의 심포니(Symphony) 오케스트레이션 체계에 착안하여, 프로젝트의 규모와 도메인에 관계없이 **AI 에이전트의 전문 역할을 4대 스쿼드(Squad)로 구조화하고, 단계별 산출물 계약(Artifact Contract)을 통해 결함의 전파를 차단**하는 협업 표준 가이드입니다.

---

## 2. 심포니 4대 에이전트 스쿼드 구조
어떠한 프로젝트든 개발 라이프사이클은 다음 4개 스쿼드의 순차 검증 파이프라인을 거치게 됩니다.

```text
[담당 엔지니어 (Lead Engineer)]
       │
       ▼ [Gate 1: 기획 및 사양 승인]
┌─────────────────────────────────┐
│ 1. 기획/전략 (Strategy Squad)   │ ──→ 요구사항 명세, 비즈니스 KPI, SLO 수치화 (01_PRD.md)
└─────────────────────────────────┘
       │
       ▼ (PRD 핸드오프)
┌─────────────────────────────────┐
│ 2. 기술설계 (Architecture Squad)│ ──→ 헥사고날 구조, 스택 매핑, 기술 결정 (02_TRD.md, 08_ADR.md)
└─────────────────────────────────┘
       │
       ▼ (TRD & ADR 핸드오프)
┌─────────────────────────────────┐
│ 3. 자율구현 (Implementation)    │ ──→ 무수동 코딩 자율 구현, TDD 단위 테스트 (코드베이스)
└─────────────────────────────────┘
       │
       ▼ (컴파일 및 단위테스트 통과)
┌─────────────────────────────────┐
│ 4. 검증/운영 (Governance Squad) │ ──→ 정적 분석, 보안 스캔, 카나리 배포 검증 (05, 06, 07_QA.md)
└─────────────────────────────────┘
       │
       ▼ [Gate 2: 프로덕션 릴리즈 승인]
[프로덕션 배포 완료]
```

---

## 3. 스쿼드 간 산출물 계약 (Handoff Contracts)

| 전환 단계 | 송신 스쿼드 | 수신 스쿼드 | 필수 인도 산출물 | 게이트 진입 조건 |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1 $\rightarrow$ 2** | Strategy | Architecture | `01_PRD.md` | SLO 정량 수치 포함, [Gate 1] 승인 완료 |
| **Phase 2 $\rightarrow$ 3** | Architecture | Implementation | `02_TRD.md`, `08_ADR.md` | 인터페이스 계약 확정, 검증 도구 어댑터 매핑 완료 |
| **Phase 3 $\rightarrow$ 4** | Implementation | Governance | 구현 코드 및 단위 테스트 | 컴파일 완료, 로컬 단위 테스트 100% 통과 |
| **Phase 4 $\rightarrow$ 릴리즈** | Governance | Lead Engineer | 품질/보안 종합 리포트 | Warning 0, 커버리지 80%+, [Gate 2] 최종 승인 |

---

# [템플릿] 프로젝트 스쿼드 배정 양식 (Squad Assignment Template)
*신규 프로젝트 착수 시 프로젝트 규모에 맞추어 전문 역할을 배정하는 양식입니다.*

```markdown
---
project_name: "{{프로젝트명}}"
version: "1.0.0"
operating_mode: "FULL_SQUAD | LIGHTWEIGHT"  # 규모에 따라 선택
last_updated: "{{YYYY-MM-DD}}"
---

# 1. 4대 스쿼드 전문 역할 배정표

### (1) Strategy Squad (기획 및 분석)
- **Product Planner**: 비즈니스 요구사항을 수집하고 명확한 기능 범위와 SLO를 정의하여 `01_PRD.md`를 완성한다.
- **Growth / User Analyst**: 타겟 사용자의 페르소나를 도출하고 UX 품질 지표를 수립한다.

### (2) Architecture Squad (설계 및 기술 거버넌스)
- **System Architect**: 전체 계층 구조(Hexagonal/Clean)를 설계하고 주요 기술 의사결정을 `08_ADR.md`에 기록한다.
- **Data Architect**: 데이터 모델링, 정규화/인덱싱 최적화, 쿼리 플랜을 검토한다.
- **Security Architect**: 인증/인가 체계, 제로 트러스트 보안 규격을 수립한다.

### (3) Implementation Squad (자율 구현)
- **Core / Backend Engineer**: 도메인 핵심 로직, API 엔드포인트, 트랜잭션 처리를 구현한다.
- **Client / Frontend Engineer**: UI 컴포넌트, 상태 관리, 프론트엔드 성능(Web Vitals)을 최적화한다.
- **UI/UX Designer**: 일관된 디자인 시스템과 웹 접근성(a11y) 규격을 준수한다.

### (4) Governance Squad (품질, 보안 및 릴리즈)
- **QA / SDET Engineer**: 통합/E2E 테스트 시나리오를 작성하고, 실패 시 Error Envelope 피드백을 통제한다.
- **DevOps / SRE Engineer**: CI/CD 파이프라인, 카나리 롤백 메커니즘, 분산 트레이싱을 운영한다.

# 2. 경량 세션(Lightweight Mode) 운영 수칙
- 1인의 에이전트가 단독으로 수행하는 경량 세션일지라도 **[기획] $\rightarrow$ [설계] $\rightarrow$ [구현] $\rightarrow$ [검증]**의 4단계를 건너뛰지 않고 순차적으로 완료해야 한다.
```

---