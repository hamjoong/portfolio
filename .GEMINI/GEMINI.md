# Context Engineering Project Guideline

---

# Project_Context (프로젝트_컨텍스트) : 프로젝트의 본질적 배경, 문제 정의, 비전, 목표 비즈니스 콘텍스트를 설명합니다.

gemini-review() {
  cat .GEMINI/.01_Project_Context.md | gemini "위 가이드라인을 바탕으로 프로젝트_컨텍스트 정리해줘."
}

---

# Responsibility_Persona (R&R_페르소나) 주요 책임 페르소나 역할 : 각 파트장은 코드 리뷰 및 아키텍처 승인 권한 보유 및 페르소나 역할을 설명합니다.

gemini-review() {
  cat .GEMINI/.02_R&R_Persona.md | gemini "위 가이드라인을 바탕으로 R&R_페르소나 정리해줘."
}

---

# 규칙 Rule 정의 : 협업 및 커뮤니케이션 방식 및 문서화/출력 규칙

gemini-review() {
  cat .GEMINI/.03_Process_Rule.md | gemini "위 가이드라인을 바탕으로 규칙 Rule 정의 정리해줘."
}

---

# System Architecture_Technology Stack_Security : 시스템 아키텍쳐 / 기술스택 / 보안 을 설명합니다.

gemini-review() {
  cat .GEMINI/.04_Architecture.md | gemini "위 가이드라인을 바탕으로 시스템 아키텍쳐 / 기술스택 / 보안 정리해줘."
}

---

# Coding Rules_Maintainability_Performance_Exception Handling_API Standard_Folder Structure 코딩 규칙_유지 관리_성능 기준_예외 처리_API 표준_폴더 구조를 설명합니다.
   
gemini-review() {
  cat .GEMINI/.05_Dev_Standard.md | gemini "위 가이드라인을 바탕으로 코딩 규칙_유지 관리_성능 기준_예외 처리_API 표준_폴더 정리해줘."
}

---

# Quality_Strategy 테스트, 성능기준, 모니터링을 설명합니다.
   
gemini-review() {
  cat .GEMINI/.06_Quality_Strategy.md | gemini "위 가이드라인을 바탕으로 테스트, 성능기준, 모니터링 정리해줘."
}

---

# Deployment Strategy CI/CD, 배포 전략, 환경 분리를 설명합니다.
   
gemini-review() {
  cat .GEMINI/.07_Deployment_Ops.md | gemini "위 가이드라인을 바탕으로 CI/CD, 배포 전략, 환경 분리 정리해줘."
}