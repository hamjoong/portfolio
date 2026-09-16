# 역할 오케스트레이터 및 프로젝트 프로파일링 규칙 (Role Orchestrator)

이 문서는 에이전트가 사용자 요청을 수신했을 때 **어떤 전문 직무(Role)를 활성화할지** / 그리고 **프로젝트의 체급에 맞게 어떻게 비례 적용할지**를 결정하는 오케스트레이션 엔진 규칙입니다.

---

## 1. 프로젝트 체급 분류 (3-Tier Proportional Model)

하네스는 프로젝트의 본질과 규모를 먼저 파악하여 과도한 엔지니어링을 방지합니다.

| 티어 | 대상 프로젝트 예시 | 특징 및 적용 수준 | 활성화 역할 |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Script/Utility)** | `ssnvalidation` / `matrixcalculator` | 단일 목적 알고리즘 / 유틸리티 / CLI 스크립트.<br>- 복잡한 인프라 / DB / 캐시 배제.<br>- 함수 단위 테스트 / 예외 처리 / Why 주석 중심. | `Backend` 또는 `Frontend` 단일 역할 |
| **Tier 2 (Client Application)** | `kiosk` / `notepad` / `blog` / `blog2` / `blog3` | 브라우저 기반 단일 클라이언트 앱 또는 정적 사이트.<br>- 서버 / DB 규정 배제.<br>- UI 렌더링 / 컴포넌트 구조 / 웹 접근성 / 상태 관리 중심. | `Frontend` / 필요 시 `UI/UX Designer` / `QA` |
| **Tier 3 (Fullstack / Service)** | `shoppingmall` / `movie` / `devcodehub` | DB / 백엔드 API / 인증 / 사용자 인터랙션이 포함된 서비스.<br>- API p95 레이턴시 / 트랜잭션 / DB 인덱싱 / Zero-Trust 보안 적용. | `Backend` / `Frontend` / `DBA` / `Security` / `QA` / `Infra` 등 다중 역할 협업 |

---

## 2. 10대 시니어 전문가 활성화 매트릭스

1. **단일 작업 매핑**:
   - 프론트엔드 UI / 스타일 / 상태 관리만 다루는 경우 -> `frontend-specialist`만 활성화.
   - 백엔드 비즈니스 로직 / API만 다루는 경우 -> `backend-specialist`만 활성화.
2. **다중 전문가 협업 매핑**:
   - 프론트 + 백엔드 + DB가 연관된 경우 -> `frontend-specialist` / `backend-specialist` / `dba-specialist` 협업 모드.
   - 외부 사용자 인증 / 결제 / 개인정보 관련 작업인 경우 -> `security-specialist`가 검토에 참여.
   - 배포 / 도커 / CI 관련 작업인 경우 -> `infra-specialist`가 참여.

---

## 3. 오버엔지니어링 차단 규칙

* **기존 기술 스택 존중**: 프로젝트에 이미 구축된 언어와 프레임워크(예: 순수 JS / Python 등)를 임의로 다른 프레임워크로 교체하라고 요구하거나 교체하지 않습니다.
* **불필요한 레이어 생성 금지**: Tier 1 프로젝트에 Dockerfile이나 K8s 매니페스트 / Redis 캐싱 레이어를 생성하지 않습니다.

---