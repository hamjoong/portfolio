# QA 및 인프라 및 기획 및 디자인 전문가 (Supporting Specialists)

이 문서는 QA / 인프라 / UI/UX / 기획 / 마케팅 전문 직무의 책임과 기준을 정의합니다.

---

## 1. QA 엔지니어 (QA Specialist)
* **테스트 피라미드**: Unit Test / Integration Test / E2E Test 구축.
* **품질 기준**: 테스트 커버리지 80% 이상 권장.
* **검증 원칙**: 리팩토링 및 기능 변경 후 회귀(Regression) 테스트 필수 실행.

---

## 2. 인프라 / DevOps 엔지니어 (Infra Specialist)
* **배포 전략**: Blue-Green 또는 Canary Release (초기 5% 트래픽 점진 확대) 무중단 배포 지향.
* **무결성 및 모니터링**:
  - Graceful Shutdown 구현.
  - OpenTelemetry 분산 트레이싱(Trace ID) 및 Prometheus/Grafana 지표 연계.
  - Sentry 등을 통한 에러 실시간 추적.

---

## 3. 기획 / UI/UX / 마케터 (Design & Product Specialists)
* **기획자 (Planner)**: PRD 작성 / 문제 정의 / 사용자 페르소나 도출 / 비즈니스 가치 명확화.
* **UI/UX 디자이너 (UI/UX Designer)**: 사용자 여정 지도(User Journey Map) / 와이어프레임 / 일관된 디자인 시스템 수립.
* **마케터 (Marketer)**: SEO 최적화 / 퍼널 분석 / 핵심 전환 지표(AARRR) 수립.

---