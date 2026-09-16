# 작업 계획서 템플릿 (Task Execution Plan Template)

- **계획서 ID**: PLAN-YYYYMMDD-001
- **대상 프로젝트**: [예: kiosk / shoppingmall / devcodehub]
- **프로젝트 체급**: Tier 1 (유틸) / Tier 2 (클라이언트) / Tier 3 (풀스택)
- **작성일자**: YYYY-MM-DD
- **작성자**: Antigravity AI Agent
- **상태**: Active (진행 중) / Pending Review

---

## 1. 작업 개요 및 최종 목표
- **목표 설명**: 이번 작업에서 달성해야 할 구체적인 결과물 정의.
- **포함 범위 (In-Scope)**: 수정 / 생성될 컴포넌트 / API / 모듈.
- **제외 범위 (Out-of-Scope)**: 작업하지 않을 부분 (타 프로젝트 절대 건드리지 않음 명시).

---

## 2. 권한 레벨 및 승인 체크포인트 (Authority Check)
- [ ] Level 0 (Read) / Level 1 (Analyze): 자율 분석 완료
- [ ] Level 2 (Project Modification): 지정 프로젝트 내부 수정 계획
- [ ] Level 3 (Controlled Operations) 포함 여부:
  - [ ] 패키지 신규 설치 (`npm i` / `pip install`) 필요 여부 (필요 시 패키지명 기재)
  - [ ] Git 커밋 / 푸시 / PR 필요 여부
  - [ ] DB 스키마 / 마이그레이션 변경 여부
  - ※ Level 3 작업이 포함된 경우 사용자 사전 승인 획득 여부: [ ] 승인 완료 / [ ] 대기

---

## 3. 단계별 마일스톤 및 실행 체크리스트 (Milestones)

- [ ] **1단계: 요구사항 및 기존 코드 정밀 분석 (Level 1)**
  - 기존 아키텍처 및 영향도 파악 (무변경)
- [ ] **2단계: 격리된 구현 작업 (Level 2)**
  - [ ] 세부 구현 1: Why 중심 한국어 주석 필수 작성
  - [ ] 세부 구현 2: Clean Code & SOLID 준수 (함수 50줄 / 깊이 3 이하)
- [ ] **3단계: 기계적 품질 및 무결성 검증 (Evaluator)**
  - [ ] `bash .Agent/scripts/validate-workspace.sh <대상프로젝트>` 실행 통과
  - [ ] 단위 테스트 통과 (테스트 대상 프로젝트인 경우)
- [ ] **4단계: 최종 결과 브리핑 및 아카이빙**
  - [ ] 사용자 보고 완료 후 본 계획서를 `.Agent/plans/completed/`로 이동

---