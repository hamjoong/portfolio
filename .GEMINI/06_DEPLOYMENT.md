# DEPLOYMENT.md

---

# Deployment Strategy

---

# 1. 배포 원칙
- 무중단 배포를 목표로 한다.
- 운영 영향도를 최소화한다.
- 배포 실패 시 빠르게 롤백할 수 있어야 한다.

---

# 2. 배포 방식
Deployment Strategy Blue-Green Deployment 또는 Canary Release를 통한 무중단 배포
CI/CD, Canary Release, Rollback 시나리오

- Blue-Green Deployment
- Canary Release
- Rollback 전략
- CI/CD 자동화
- 개발 / 스테이징 / 운영 분리
- GitHub / GitHub Actions / Jenkins CI/CD / AWS CI/CD / Amazon EC2 / Amazon ECS
- Canary Release : 신규 버전 배포 시 전체 트래픽의 5%부터 점진적으로 확대하며 에러율을 모니터링한다
- Graceful Shutdown : 배포 시 현재 처리 중인 요청을 안전하게 마친 후 프로세스를 종료하도록 설정한다
- Distributed Tracing : 서비스 간 호출 흐름을 파악하기 위해 `Trace ID`를 전파한다 (OpenTelemetry 적용)
- Error Tracking : `Sentry` 등을 연동하여 클라이언트 및 서버 에러를 실시간 수집하고 담당자에게 알림을 발송한다

---

# 3. 환경 분리
- Local
- Dev
- Staging
- Production

---

# 4. CI/CD Pipeline
```text
Commit
↓
Lint
↓
Build
↓
Test
↓
Security Scan
↓
Performance Test
↓
Deploy
```

---

# 5. DevSecOps
CI 파이프라인에서 자동 수행한다.

- SAST
- DAST
- Dependency Scan
- Container Scan

---

# 6. 운영 체크
- 배포 전 테스트 통과 확인
- 보안 스캔 통과 확인
- 성능 기준 확인
- 롤백 기준 확인
- 모니터링 대시보드 확인

---