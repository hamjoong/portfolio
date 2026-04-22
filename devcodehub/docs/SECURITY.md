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
- **Storage Security**: 모든 파일 업로드는 S3를 사용하며, 버킷은 `Private`으로 전환. 외부 접근은 **CloudFront OAC**를 통해서만 허용.
- **Access Control**: 관리자 페이지 및 중요 API는 RBAC로 엄격히 통제.
- **Rate Limiting**: IP당 호출 제한(`RateLimitFilter`)으로 DoS 공격 방어.

## 4. 보안 점검 파이프라인
- SCA (Software Composition Analysis) 상시 실행.
- 컨테이너 취약점 점검 (Trivy).
- 실시간 장애 알림 및 비상 연락망 가동.