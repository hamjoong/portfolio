# 하네스 규칙 개선 워크플로우 (Harness Change Workflow)

이 문서는 작업 실패 / 버그 / 사용자 피드백 발생 시 하네스 규칙을 수정하고 검증하는 공식 절차를 정의합니다.

---

## 1. 하네스 개선 5단계 순환 주기

```
[1. 인시던트 등록]
   - 문제 발생 즉시 .Agent/incidents/open/ 에 파일 생성
   - 증상 / 컨텍스트 / 사용자의 지적 사항 기록
        ↓
[2. 개선안(RFC) 초안 작성]
   - .Agent/improvements/proposed/ 에 RFC 작성
   - 원인 분석 및 하네스 정책 / 스크립트 변경 전/후 비교(Diff) 명시
        ↓
[3. 사용자 검토 및 승인 (Level 3)]
   - 사용자에게 개선안 보고 후 명시적 승인 요청
   - 승인 시: .Agent/improvements/approved/ 로 이동
   - 반려 시: .Agent/improvements/rejected/ 로 이동
        ↓
[4. 하네스 파일 변경 및 검증]
   - 실제 .Agent/ 하위 파일 수정
   - bash .Agent/scripts/detect-changes.sh 등 검증 스크립트 실행
        ↓
[5. 이력 보관 및 종료]
   - .Agent/changes/harness-change-log.md 에 이력 추가
   - incident 파일을 .Agent/incidents/resolved/ 로 이동
   - RFC 파일을 .Agent/improvements/implemented/ 로 이동
```

---