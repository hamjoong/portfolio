# 12단계 품질 파이프라인 및 검증 기준 (Quality Pipeline)

이 문서는 코드 작성 후 최종 보고 전까지 거치는 품질 검증 파이프라인의 기준을 정의합니다.
프로젝트의 실제 체급(Tier 1/2/3) 및 설치된 검증 도구 유무에 맞추어 **실제 실행 가능한 단계만 비례 적용**합니다.

---

## 1. 12단계 전체 품질 파이프라인 가이드 (Full Pipeline)

```
 1. Lint 실행 (ESLint / Flake8 등 정적 문법 체크 - 도구 설치 시)
        ↓
 2. Static Analysis (타입 체크 / 잠재 버그 탐지)
        ↓
 3. Debug 검증 (Null Safety / 예외 처리 및 명확한 에러 메시지 확인)
        ↓
 4. Unit Test (단위 테스트 실행 - 테스트 환경 구성 시)
        ↓
 5. Performance Optimization (성능 병목 튜닝 - 주의: 기능 변경 금지)
        ↓
 6. Refactoring (코드 가독성 향상 / Clean Code 준수 - 기능 변경 금지)
        ↓
 7. Regression Test (리팩토링 후 기존 기능 정상 동작 검증)
        ↓
 8. Memory Leak / Resource 검사 (미해제 커넥션 / 자원 누수 점검)
        ↓
 9. Dead Code 제거 (미사용 변수 / import / 방치된 주석 코드 정리)
        ↓
10. Final Lint Validation (경고 및 린트 에러 해소)
        ↓
11. Project Boundary Check (.Agent/scripts/validate-workspace.sh 실행)
        ↓
12. Final Report (Why 중심 설명과 함께 사용자에게 결과 브리핑)
```

---

## 2. 프로젝트 체급별 비례 적용 기준 (현실적 실행 기준)

프로젝트에 실제 테스트 러너나 CI 도구가 없을 경우, 이를 무리하게 강제하지 않고 다음 필수 단계를 수행합니다:

* **Tier 1 (스크립트 / 유틸 - 예: `ssnvalidation`, `matrixcalculator`)**:
  - 필수 검증: **3단계(Debug / 예외 처리)** $\rightarrow$ **11단계(경계 검증)** $\rightarrow$ **12단계(결과 보고)**
* **Tier 2 (프론트엔드 / 클라이언트 - 예: `kiosk`, `notepad`, `blog3`)**:
  - 필수 검증: **1단계(린트/문법 체크)** $\rightarrow$ **3단계(예외 처리)** $\rightarrow$ **5단계(UI 반응성/렌더링)** $\rightarrow$ **11단계(경계 검증)** $\rightarrow$ **12단계(결과 보고)**
* **Tier 3 (풀스택 서비스 - 예: `devcodehub`, `shoppingmall`, `movie`)**:
  - 프로젝트 내 `package.json`이나 `pom.xml`에 정의된 공식 스크립트(`npm test`, `npm run lint` 등)를 우선 활용하며 전체 파이프라인을 비례 적용.

---