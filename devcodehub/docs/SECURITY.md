# [SECURITY] DevCodeHub - 보안 표준 (2026 Edition)

## 1. 보안 원칙
- HTTPS 사용 (CloudFront 기반)
- JWT 인증 체계
- Zero Trust Architecture
- Internal mTLS 적용

## 2. 민감정보 관리 및 마스킹
- **런타임 보안**: `.env` 파일은 로컬 개발용임. 운영 환경에서는 **AWS Secrets Manager**를 사용하여 런타임에 값을 주입함 (환경 변수 하드코딩 절대 금지).
- **로깅 마스킹**: `LogMaskingConverter`를 통한 이메일/전화번호 상시 마스킹. 로그에 개인정보(PII) 출력 금지.

## 3. 인프라 보안
- **Storage Security**: 파일 업로드는 **Supabase Native API**를 사용하며, 서버 측에서 `service_role` JWT를 통해 권한을 제어함. 클라이언트는 직접적인 스토리지 쓰기 권한을 가지지 않음.
- **Access Control**: 관리자 페이지 및 중요 API는 RBAC(Role-Based Access Control)로 엄격히 통제 (Spring Security).
- **Rate Limiting**: IP당 호출 빈도 제한(`RateLimitFilter`)을 적용하여 무차별 대입 및 DoS 공격 방어.
- **CORS Policy**: 운영 환경 도메인(`*.cloudfront.net`)에 대해서만 명시적으로 허용.

## 4. 보안 점검 파이프라인
- SCA (Software Composition Analysis) 상시 실행.
- 컨테이너 취약점 점검 (Trivy).
- 실시간 장애 알림 및 비상 연락망 가동.