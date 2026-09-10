# 05_SECURITY.md

---

# [가이드] 범용 제로 트러스트 보안 및 샌드박스 표준 (Universal Security Guide)

---

## 1. 개요 및 목적
본 문서는 모든 프로젝트에 필수적으로 요구되는 **범용 제로 트러스트(Zero Trust) 보안 아키텍처와 에이전트 샌드박스 격리 규정**을 정의합니다.

에이전트가 코드를 자율 생성하고 배포하는 환경일수록, 코드 저장소와 실행 런타임에 대한 보안 통제가 철저히 자동화되어야 합니다.

---

## 2. 불변의 보안 검증 원칙 (Security Invariants)
1. **사전 커밋 시크릿 차단 (Pre-commit Secret Scanning)**: Git 훅 및 CI 단계에서 시크릿 스캐너(TruffleHog, Gitleaks)를 상시 구동하여 API 키, 데이터베이스 패스워드, JWT 시크릿이 저장소에 커밋되는 것을 원천 차단한다.
2. **에이전트 실행 환경 격리 (Sandbox & Least Privilege)**: 에이전트의 도구 실행 및 테스트 환경은 호스트 파일시스템 및 운영 데이터베이스와 물리적/논리적으로 분리된 샌드박스(컨테이너) 내에서 구동되며, 불필요한 루트 권한은 일체 부여하지 않는다.
3. **오픈소스 의존성 취약점 자동 검증 (Mandatory SCA)**: 신규 써드파티 패키지 도입 시 Snyk, Dependabot, Trivy 등의 보안 스캔을 필수로 거치며, 심각도(Severity) High 이상의 취약점이 발견되면 빌드를 즉각 중단한다.
4. **민감정보 및 토큰 자동 마스킹 (Redaction)**: 애플리케이션 로그, 에이전트 에러 피드백(Error Envelope)에 개인정보(PII)나 인증 토큰이 평문으로 기록되지 않도록 필터링한다.
5. 소스 코드 내 시크릿(API 키, 토큰, 패스워드) 평문 하드코딩 금지
6. 보안 스캔(SCA) 승인을 받지 않은 신규 외부 라이브러리 임의 추가 금지
7. 경고를 무시하기 위한 린트 비활성화 주석(`eslint-disable`, `@SuppressWarnings` 등) 사용 금지
8. 환경 변수는 `.env` 또는 Secret Manager로 관리한다.
9. 로그에 민감정보를 출력하지 않는다.
10. Secret Manager : `.env` 파일 사용을 지양하고, AWS Secret Manager 또는 HashiCorp Vault를 연동하여 런타임에 주입한다.

---

# [템플릿] 프로젝트 보안 명세서 (Security Specification Template)
*신규 프로젝트 설계 시 Security Architect가 프로젝트 보안 요건을 정의하는 양식입니다.*

```markdown
---
project_name: "{{프로젝트명}}"
version: "1.0.0"
security_tier: "STANDARD | HIGH | CRITICAL"
last_updated: "{{YYYY-MM-DD}}"
---

# 1. 인증 및 인가 아키텍처 (AuthN & AuthZ)
- **사용자 인증 방식**: {{JWT (Access/Refresh) | OAuth 2.0 / OIDC | 세션 쿠키 | HMAC 서명}}
- **권한 제어 모델**:
  - **RBAC (역할 기반 제어)**: 관리자, 일반 사용자, 운영자 간의 기능 접근 통제
  - **RLS (행 단위 DB 보안)**: 멀티 테넌트 환경에서 테넌트 간 데이터 침범 원천 격리
- **통신 암호화**: 전송 구간 HTTPS(TLS 1.3 이상) 및 내부 서비스 간 mTLS 의무화

# 2. 비밀정보 관리 체계 (Secrets Management)
- **로컬 개발**: `.env` 파일은 절대 Git에 커밋되지 않으며, `.gitignore`와 pre-commit 훅으로 강제한다.
- **운영 환경**: 환경 변수는 `.env` 또는 Secret Manager로 관리한다, 클라우드 시크릿 매니저({{AWS Secrets Manager / HashiCorp Vault}})를 통해 런타임에 안전하게 주입한다.

# 3. DevSecOps 자동화 보안 파이프라인

```text
Commit
  ↓
[1. Secret Scan] Gitleaks / TruffleHog (시크릿 커밋 즉시 차단)
  ↓
[2. SAST] CodeQL / SonarQube (정적 보안 취약점 점검)
  ↓
[3. SCA] Snyk / Dependency-Check (오픈소스 취약 패키지 검사)
  ↓
[4. Container Scan] Trivy (Docker 베이스 이미지 취약점 점검)
  ↓
Deploy
```

# 4. 개발 시 엄격 금지 조항 (Strict Security Prohibitions)
1. 클라이언트(브라우저, 앱) 소스 코드에 마스터 API 키 또는 서명 시크릿 포함 금지
2. 사용자 입력을 검증 및 살균(Sanitizing) 없이 SQL 쿼리나 셸 커맨드에 직접 바인딩하는 행위 금지
3. 에러 발생 시 클라이언트에 DB 오류 상세나 서버 스택 트레이스를 반환하는 행위 금지
4. 소스 코드 내 시크릿(API 키, 토큰, 패스워드) 평문 하드코딩 금지
5. 경고를 무시하기 위한 린트 비활성화 주석(`eslint-disable`, `@SuppressWarnings` 등) 사용 금지
6. 환경 변수는 `.env` 또는 Secret Manager로 관리한다.
7. 로그에 민감정보를 출력하지 않는다.
8. Secret Manager : `.env` 파일 사용을 지양하고, AWS Secret Manager 또는 HashiCorp Vault를 연동하여 런타임에 주입한다.

---