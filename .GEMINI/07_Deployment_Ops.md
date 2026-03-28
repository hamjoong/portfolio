# Context Engineering Project Guideline

---

07_Deployment_Ops

---

# 배포 전략 Deployment Strategy Blue-Green Deployment 또는 Canary Release를 통한 무중단 배포.
CI/CD, Canary Release, Rollback 시나리오

1. Blue-Green Deployment
2. Canary Release
3. Rollback 전략
4. CI/CD 자동화
5. 개발 / 스테이징 / 운영 분리
6. GitHub / GitHub Actions / Jenkins CI/CD / AWS CI/CD / Amazon EC2 / Amazon ECS

---

# CI/CD Pipeline
예시
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

---

# 환경 분리 Deployment Environment
1. Local
2. Dev
3. Staging
4. Production

---

# 도구 Observability
1. Prometheus
2. Grafana
3. ELK Stack
4. OpenTelemetry

모니터링 Monitoring
1. CPU
2. Memory
3. API Latency
4. Error Rate
5. DB Query Time

---