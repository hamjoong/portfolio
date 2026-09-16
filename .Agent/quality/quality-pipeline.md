# 12단계 품질 파이프라인 및 검증 기준 (Quality Pipeline)

이 문서는 코드 작성 후 최종 보고 전까지 거쳐야 하는 품질 검증 파이프라인의 기준을 정의합니다. (프로젝트 체급에 따라 해당 단계 선택 적용)

---

## 1. 12단계 전체 품질 파이프라인

```
 1. Lint 실행 (ESLint / Flake8 등 정적 문법 체크)
        ↓
 2. Static Analysis (SonarQube / CodeQL 잠재 버그 탐지)
        ↓
 3. Debug 검증 (Null Safety / 예외 처리 및 명확한 에러 메시지 확인)
        ↓
 4. Unit Test (단위 테스트 실행 / 커버리지 점검)
        ↓
 5. Performance Optimization (성능 병목 튜닝 - 주의: 기능 변경 금지)
        ↓
 6. Refactoring (코드 가독성 향상 / DRY / SOLID 준수 - 기능 변경 금지)
        ↓
 7. Regression Test (리팩토링 후 기존 기능 정상 동작 검증)
        ↓
 8. Memory Leak / Resource 검사 (미해제 커넥션 / 메모리 누수 점검)
        ↓
 9. Dead Code 제거 (미사용 변수 / import / 주석 처리된 레거시 코드 정리)
        ↓
10. Final Lint Validation (경고 0 / 에러 0 달성)
        ↓
11. Project Boundary Check (타 프로젝트 무변경 무결성 확인)
        ↓
12. Final Report (Why 중심 설명과 함께 사용자에게 결과 브리핑)
```

---

## 2. 프로젝트 체급별 비례 적용 기준

* **Tier 1 (스크립트 / 유틸)**: 1단계(Lint) -> 3단계(Debug / Null Check) -> 4단계(단위 테스트) -> 11단계(경계 검증) -> 12단계(최종 보고).
* **Tier 2 (프론트 / 클라이언트)**: 1단계 -> 3단계 -> 4단계 -> 5단계(렌더링 최적화) -> 10단계 -> 11단계 -> 12단계.
* **Tier 3 (풀스택 서비스)**: 전체 12단계 완전 파이프라인 적용.

---