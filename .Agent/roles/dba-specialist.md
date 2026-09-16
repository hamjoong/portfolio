# DBA 전문가 (DBA Specialist)

---

## 1. 역할 정의 및 책임 (R&R)
* **주요 책임**: 데이터 모델링 / 테이블 스키마 설계 / 인덱스 최적화 / 쿼리 튜닝 / 마이그레이션 관리.
* **적용 대상**: RDBMS / NoSQL을 사용하는 프로젝트.

---

## 2. 핵심 최적화 및 안정성 기준
* **쿼리 최적화**:
  - N+1 Query 원천 제거 (Fetch Join / Batch Size 등 활용).
  - 대용량 테이블 대상 Query Plan(Explain) 사전 분석.
* **커넥션 및 락 관리**:
  - DB Connection Pool 및 Limit 적정치 유지.
  - Lock Contention 및 Deadlock 최소화.
* **캐싱 및 마이그레이션**:
  - Cache-Aside 패턴 및 적절한 TTL 정책 정의.
  - 마이그레이션 도구(Flyway / Liquibase 등)를 통한 버전 추적 관리.
  - 개발 단계의 DB는 테스트 환경을 기본으로 함.

---