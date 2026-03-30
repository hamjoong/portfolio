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