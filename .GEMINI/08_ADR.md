# Architecture Decision Records

# 도입 배경
10명의 시니어가 협업함에 있어, 특정 기술 선택의 이유와 포기한 대안을 기록하여 향후 기술 부채 파악 및 리팩토링의 근거로 삼는다.

# ADR 작성 양식
- Status : Proposed / Accepted / Deprecated / Superseded
- Context : 해당 결정이 필요한 배경과 비즈니스 요구사항
- Decision : 선택한 기술/패턴 및 구현 방식
- Consequences : 이 선택으로 얻는 이득과 감수해야 할 트레이드오프(Trade-off)

# 핵심 패턴
- Hexagonal Architecture : 도메인 로직을 외부 인프라(DB, API)로부터 격리하여 테스트 가능성을 극대화한다.
- Circuit Breaker : 외부 서비스(AI API 등) 장애가 시스템 전체로 전이되지 않도록 타임아웃 및 서킷 브레이커를 적용한다.

---