# 하네스 자체 개선 및 진화 운영 체계 (Harness Evolution Policy)

이 문서는 에이전트의 작업 실패 / 버그 발생 / 사용자 피드백 접수 시 **하네스 자체를 점진적으로 개선하고 이력을 관리하는 표준 루프**를 정의합니다.

---

## 1. 하네스 개선 5단계 라이프사이클

```
[1. 이슈/문제 발생] 
        ↓  기록: .Agent/incidents/open/INCIDENT-<일자>-<제목>.md
[2. 원인 분석 및 개선안 도출]
        ↓  작성: .Agent/improvements/proposed/RFC-<번호>-<제목>.md
[3. 사용자의 명시적 승인]
        ↓  이동: .Agent/improvements/approved/ (반려 시 rejected/)
[4. 하네스 파일 수정 및 검증]
        ↓  수정: .Agent/ 하위 규칙 / 정책 파일 갱신 및 스크립트 검증
[5. 변경 로그 기록 및 이슈 해결]
           기록: .Agent/changes/harness-change-log.md
           이동: .Agent/incidents/resolved/
           이동: .Agent/improvements/implemented/
```

---

## 2. 장애 / 이슈 기록 양식 (`incidents/open/`)
* **이슈 식별자**: `INCIDENT-YYYYMMDD-<이름>.md`
* **내용 구성**:
  1. 발생 일시 및 작업 맥락
  2. 사용자의 문제 제기 또는 에이전트 실패 증상
  3. 근본 원인 분석(Root Cause Analysis)
  4. 재발 방지를 위한 하네스 개선 요구사항

---

## 3. 하네스 개선 제안서 양식 (`improvements / proposed/`)
* **문서 식별자**: `RFC-YYYYMMDD-<개선명>.md`
* **내용 구성**:
  1. 개선 배경 및 목표
  2. 수정 대상 하네스 정책 / 파일 목록
  3. 구체적인 변경 전/후 비교 (Diff)
  4. 사용자 승인 요청 항목

---