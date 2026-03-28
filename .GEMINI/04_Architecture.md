# Context Engineering Project Guideline

---

04_Architecture

---

# 시스템 아키텍쳐 System Architecture
마이크로서비스 / 모놀리식 / 하이브리드 선택 근거
계층형 구조 : UI - API Gateway - Business Logic - Data Access
관심사 분리 : 각 기능은 모듈화되어 서로의 영역을 침범하지 않습니다.

예시
Client
↓
CDN
↓
Load Balancer
↓
API Gateway
↓
Service Layer
↓
Database

---

# Development Standard & Architecture

## 기술 스택 Technology Stack

| Layer | Technology |
|------|------------|
| Frontend | HTML / CSS / Scss / Tailwind CSS / JavaScript (ES6+) / TypeScript / React / Vue / Next.js / Python|
| Backend | Node.js / Spring Boot / Java 21 (Spring Boot 3.x) / NestJS / FastAPI / Python |
| Database | SQL / MySQL / PostgreSQL / Redis / MongoDB / AWS (EKS) / Terraform |
| Infra | AWS / Docker / Kubernetes |
| CI/CD | GitHub / GitHub Actions / Jenkins / AWS CI/CD / Amazon EC2 / Amazon ECS |

---

# 보안 정책 Security
1. HTTPS
2. JWT 인증
3. OWASP TOP 10 대응
4. XSS 방어
5. CSRF 방어
6. Rate Limiting
7. RBAC 접근제어 레벨 분리
8. Zero Trust Architecture
9. Secret Manager 사용
10. API Key 노출 금지(.env 활용)
11. 인증/인가 분리

---