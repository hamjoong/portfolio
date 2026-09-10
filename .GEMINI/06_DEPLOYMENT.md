# 06_DEPLOYMENT.md

---

# [가이드] 범용 지속적 배포 및 자동 롤백 표준 (Universal Deployment Guide)

---

## 1. 개요 및 목적
본 문서는 웹, API, 모바일, 클라우드 환경 등 모든 배포 대상에 적용 가능한 **무중단 배포 전략, 관측 가능성(Observability) 기반의 자동 롤백, 그리고 프로덕션 릴리즈 승인 관문([Gate 2])**을 정의합니다.

---

## 2. 불변의 배포 운영 원칙 (Deployment Invariants)
1. **무중단 릴리즈 (Zero-Downtime)**: 신규 버전 배포 시 사용자 요청의 유실이나 서비스 중단이 전혀 발생하지 않아야 한다.
2. **자동 카나리 분석 (Automated Canary Analysis, ACA)**: 신규 버전을 프로덕션에 전면 노출하기 전, 전체 트래픽의 5~10%를 카나리 인스턴스로 분기하여 실시간 메트릭(지연시간, 에러율)을 자동 검증한다.
3. **지표 기반 자동 롤백 (Instant Rollback)**: 카나리 구간에서 사전에 정의된 SLO 임계치를 위반할 경우, 사람의 개입을 기다리지 않고 이전 정상 버전으로 즉각 자동 롤백한다.
4. **[Gate 2] 릴리즈 승인 관문**: 카나리 검증이 성공적으로 완료된 후, 100% 트래픽 전면 전환은 담당 엔지니어의 명시적 승인을 거쳐 최종 집행한다.

---

# [템플릿] 프로젝트 배포 및 롤백 명세서 (Deployment Specification Template)
*신규 프로젝트 설계 시 DevOps / SRE 엔지니어가 배포 인프라와 롤백 기준을 정의하는 양식입니다.*

```markdown
---
project_name: "{{프로젝트명}}"
version: "1.0.0"
deployment_strategy: "CANARY | BLUE_GREEN | ROLLING"
target_platform: "{{AWS ECS | K8s | Vercel | Cloudflare Pages | On-Premise}}"
last_updated: "{{YYYY-MM-DD}}"
---

# 1. 환경 분리 및 프로모션 파이프라인

| 환경 (Environment) | 주 목적 | 배포 자동화 수준 | 승인 관문 |
| :--- | :--- | :--- | :--- |
| **Local Sandbox** | 에이전트 자율 개발 및 로컬 테스트 | Docker 기반 실시간 구동 | 자율 구동 |
| **Staging** | 프로덕션 미러링 환경, 부하/통합 검증 | Main 브랜치 머지 시 자동 배포 | 자동 검증 |
| **Production** | 실 서비스 사용자 대상 제공 | 카나리 점진적 배포 (5% $\rightarrow$ 100%)| **[Gate 2] Lead Engineer 승인** |

# 2. 카나리 트래픽 프로모션 시나리오

```text
[V1: 기존 버전 100%]
       │
       ▼ (카나리 인스턴스 기동)
[V1: 95%] + [V2 Canary: 5%] ───→ 10~15분간 실시간 텔레메트리 관측
       │
       ├─→ [이상 감지 시] 즉시 V1으로 100% 자동 롤백 (Auto-Rollback Trigger)
       │
       ▼ (SLO 정상 확인)
[Gate 2: 담당 엔지니어 최종 승인]
       │
       ▼
[V2: 프로덕션 100% 전면 배포 완료]
```

# 3. 자동 롤백 임계 기준 (Automated Rollback Criteria)
- **응답 지연시간 (Latency)**: 카나리 인스턴스의 p95 응답 속도가 {{예: 200ms}}를 지속 초과할 때
- **서버 에러율 (5xx Error Rate)**: 전체 요청 중 5xx 응답 비율이 {{예: 1.0%}}를 초과할 때
- **컨테이너 헬스체크**: Readiness/Liveness 프로브가 3회 연속 실패할 때

# 4. 모니터링 및 운영 보증 (Observability Integration)
- **분산 추적 (Distributed Tracing)**: OpenTelemetry 표준 Trace ID를 요청 헤더에 주입하여 서비스 전 구간 호출 흐름을 추적한다.
- **에러 알림**: Sentry 등을 연동하여 런타임 미처리 예외를 실시간 수집하고 슬랙 채널로 즉시 전파한다.
- **안전한 종료 (Graceful Shutdown)**: 프로세스 종료 신호(SIGTERM) 수신 시 인플라이트(In-flight) 요청을 최대 30초간 정상 처리 후 프로세스를 안전하게 종료한다.

---