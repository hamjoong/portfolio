# SECURITY.md

---

# Security Standard

---

# 1. 보안 원칙
- HTTPS 사용
- JWT 인증
- OWASP Top 10 대응
- XSS 방어
- CSRF 방어
- Rate Limiting
- RBAC 접근 제어
- ABAC 접근 제어
- Zero Trust Architecture
- Internal mTLS : 마이크로서비스 간 통신 시 상호 TLS 인증을 적용한다
- Secret Manager : `.env` 파일 사용을 지양하고, AWS Secret Manager 또는 HashiCorp Vault를 연동하여 런타임에 주입한다
- API Key 노출 금지(.env 사용)
- 인증/인가 분리
- RLS 접근 제어
- DAC 접근 제어
- MAC 접근 제어
- BYOD 분리
- PII 방어
- SCA (Software Composition Analysis) : CI 파이프라인에서 오픈소스 라이브러리의 취약점을 자동 스캔한다. (Snyk, GitHub Dependency Graph)
- Container Scan : Docker 이미지 빌드 시 베이스 이미지의 취약점을 점검한다. (Trivy)
- Incident Response : 장애 발생 시 누가 승인하고 어떻게 전파하는지에 대한 '비상 연락망 및 대응 프로세스'

---

# 2. 비밀정보 관리
- 환경 변수는 `.env` 또는 Secret Manager로 관리한다.
- 코드 저장소에 직접 포함하지 않는다.
- 로그에 민감정보를 출력하지 않는다.

---

# 3. 인증/인가
- 인증과 인가는 분리한다.
- 역할 기반 접근 제어를 적용한다.
- 관리자 기능은 별도 권한 레벨로 분리한다.

---

# 4. 개발 시 금지 사항
- 하드코딩된 API Key 사용 금지
- 검증되지 않은 입력 직접 사용 금지
- SQL Injection 취약 코드 금지
- 민감정보 로그 출력 금지
- 보안 승인 없는 라이브러리 도입 금지

---