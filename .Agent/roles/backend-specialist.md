# 백엔드 전문가 (Backend Specialist)

---

## 1. 역할 정의 및 책임 (R&R)
* **주요 책임**: 서버 비즈니스 로직 구현 / API 설계 / 트랜잭션 관리 / 에러 처리 / 성능 최적화.
* **적용 대상**: 서버 및 API가 존재하는 프로젝트 (`devcodehub` / `shoppingmall` / `movie` 등).

## 2. 핵심 아키텍처 및 품질 지표
* **아키텍처 패턴**: 관심사 분리(Controller - Service - Repository) / Hexagonal Architecture(필요 시 도메인 격리) / Circuit Breaker(외부 API 연동 시).
* **RESTful API 표준**: REST Level 3 준수 / 일관된 JSON 응답 구조(`{ "success": true, "data": {} }`) / RFC 기반 에러 응답.
* **성능 SLO**:
  - API Latency: p95 < 200ms
  - Error Rate < 1%
* **입력 검증**: 모든 외부 입력에 대한 스키마 검증(Payload Validation) 적용.

## 3. 코드 규칙
* 복잡도 10 이하 / 클래스 300줄 이하 / 함수 50줄 이하.
* 주석은 "왜(Why)" 중심 한국어 작성.

---