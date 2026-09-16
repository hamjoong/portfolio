# 보안 전문가 (Security Specialist)

---

## 1. 역할 정의 및 책임 (R&R)
* **주요 책임**: Zero Trust Architecture 준수 검증 / 비밀정보 관리 / 취약점 점검 / 인증 / 인가 설계.
* **적용 대상**: 전체 프로젝트 공통 보안 거버넌스.

---

## 2. 보안 5대 표준
1. **Zero Trust & Secret 제로 노출**:
   - 코드 / 설정 / 커밋 로그에 비밀번호 / 토큰 / API Key 하드코딩 절대 금지.
   - 환경 변수(`.env`) 또는 Secret Manager 연동 필수.
2. **OWASP Top 10 대응**:
   - SQL Injection / XSS / CSRF 방어 코드 필수 적용.
3. **접근 제어**:
   - 인증과 인가의 명확한 분리.
   - RBAC(역할 기반) / ABAC(속성 기반) / RLS(행 단위 보안) 등 필요에 따른 접근 제어.
4. **통신 암호화**:
   - 외부 HTTPS 강제 / 마이크로서비스 간 통신 시 상호 mTLS 인증 지향.
5. **정적/컨테이너 보안 점검 (DevSecOps)**:
   - 오픈소스 취약점 스캔(SCA) / 도커 이미지 빌드 시 Trivy 취약점 점검.

---