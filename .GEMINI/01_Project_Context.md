# Context Engineering Project Guideline

---

01_Project_Context

---

# Context (컨텍스트) : 프로젝트의 본질적 배경, 문제 정의, 비즈니스 환경, 콘텍스트를 설명합니다.

# 본 문서는 프로젝트 전반의 의사결정, 협업 규칙, 개발 표준, 아키텍처 방향성을 명확히 정의하기 위한 실행 가이드입니다. **10명의 시니어 전문가 협업 기준**
대상: 프론트엔드 / 백엔드 / 풀스택 / UI/UX / DBA / 보안 / QA / 기획 / 마케팅 / 인프라

---

## Background (백그라운드)
### 현재 해결해야 하는 문제
1. 기존 서비스의 확장성 부족
2. 증가하는 트래픽 대응 필요
3. 사용자 경험 저하
4. 운영 비용 증가
5. 보안 위협 증가
6. 데이터 증가로 인한 성능 문제

### 시장 상황
1. SaaS 플랫폼 경쟁 심화
2. 데이터 기반 의사결정 요구 증가
3. 빠른 서비스 출시 요구
4. AI 기반 서비스 확산

### 내부 조직 요구사항
1. 개발 생산성 향상
2. 유지보수 가능한 구조
3. 자동화된 배포 시스템
4. 보안 중심 아키텍처

---

# Problem Statement (시스템 문제) : 현재 시스템의 주요 문제
1. 확장성 부족
2. 사용자 경험 문제
3. 운영 비용 증가
4. 보안 취약점
5. 코드 유지보수 어려움
6. 기술 부채 증가

---

# Project Scope (프로젝트 범위)
## 포함 범위
1. 신규 서비스 개발
2. 기존 시스템 개선
3. API 플랫폼 구축
4. 데이터 분석 기반 대시보드
5. DevOps 자동화 구축

## 제외 범위
1. 외부 파트너 시스템
2. 레거시 시스템 전면 리팩토링
3. 타 조직 내부 시스템 변경

---

# 규칙 Rule 정의 : 협업 및 커뮤니케이션 방식

---

# 책임 Responsibility 정의 : 상세 R&R 확정

---

# PRD (Product Requirements Document) : 제품 요구사항 정의서 PRD는 기획 중심 문서입니다. "무엇을 (What), 왜 (Why) 만드는가?"

---

# TRD (Technical Requirements Document) : 기술 상세 설계서 TRD는 개발 중심 문서입니다. "어떻게(How) 기술적으로 구현할 것인가?를 정의합니다."

---

# Vision (비전) : 기술적 한계를 뛰어넘는 **사용자 중심 무결성 기반 확장 가능한 플랫폼 구축**
1. Scalability
2. Security
3. User Experience
4. Observability
5. Long-term Maintainability

---

# Goal (목표)
1. 사용자 증가
2. 매출 증가
3. 운영 효율화
4. 데이터 기반 의사결정

---

## 기술 목표 Technical Goal
1. API 응답 속도 **200ms 이하**
2. 시스템 가용성 **99.9% 이상**
3. Zero Trust Architecture 구현
4. DevSecOps 환경 구축
5. 자동 배포 시스템
6. Observability 기반 운영

---