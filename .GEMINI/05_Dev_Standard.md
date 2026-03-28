# Context Engineering Project Guideline

---

05_Dev_Standard

---

# 스킬셋 Skill Set
Role			Skills
1. Frontend		Html / Css / Scss / Tailwind CSS / JavaScript (ES6+) / TypeScript / React / Vue / Next.js / TypeScript / Python

2. Backend		Node.js / Spring / Java 21 (Spring Boot 3.x) / NestJS / FastAPI / Python / Spring Boot / RESTful API 설계 / 인			증/인가 (JWT, OAuth) / 예외 처리 구조화 / API Key 노출 금지(.env 사용)

3. Database		SQL / MySQL / PostgreSQL / Redis / AWS (EKS) / Terraform / MongoDB (Log / NoSQL) / API Key 노출 금지			(.env 사용)

4. Infra		AWS / Docker

5. CI/CD		GitHub / GitHub Actions / Jenkins CI/CD / AWS CI/CD / Amazon EC2 / Amazon ECS

---

# 코딩 규칙 Coding Rules
1. 클린 코드 Clean Code 원칙 준수
2. SOLID Principles
3. 중복 제거 DRY
4. 복잡도 Cyclomatic Complexity < 10 이하 유지
5. ESLint
6. Prettier
7. Naming Convention
8. 가독성: 변수명은 줄여 쓰지 않습니다. data 대신 userProfileData 와 같이 의미가 명확한 변수명을 사용합니다.
9. 단일 책임 원칙(SRP) 하나의 함수 / 클래스는 반드시 하나의 일만 수행합니다.
10. 불변성 유지 원본 데이터를 직접 수정하지 않고 새로운 객체를 변환합니다.
11. Error Handling 명확화 "알 수 없는 에러"와 같은 메시지 대신, 사용자가 다음에 무엇을 해야 하는지 안내하는 예외 처리를 권장합니다.
12. Security: API Key (.env 활용) 노출 금지, 환경 변수 (.env) 사용, SQL Injection 방지 로직을 기본적으로 적용합니다. 
13. 단순성 유지 KISS
14. 매직 넘버 금지
15. 테스트 가능한 코드 작성
16. 읽기 쉬운 코드
17. 함수 길이 50줄 이하
18. 클래스 300줄 이하
19. 중첩 depth 3 이하
20. 주석 처리 주석은 한글로 처리 할것 어떻게(How) 보다 왜(Why) 인지로 처리

---

# 유지 관리 Maintainability
1. 모듈화 구조 유지
2. 코드 리뷰 정책
3. 테스트 커버리지 80% 이상
4. SemVer 버전관리
5. 의존성 최소화
6. 리팩토링 정책
7. 한 파일에 너무 많은 기능 넣지 않기
8. 중복된 로직 제외
9. 유지보수 가능한 구조 제안

---

# 성능 기준 Performance 프론트엔드는 Lighthouse 점수 90점 이상을 목표로 하며, 백엔드는 DB 인덱싱 최적화와 캐싱 전략을 수립합니다.
DB 인덱스 최적화, CDN 활용, 비동기 메시지 큐를 통한 부하 분산.
캐싱, 로드밸런싱, DB인덱싱 전략

1. API 응답 < 200ms
2. DB Index 최적화
3. Redis Cache
4. CDN 사용
5. Lazy Loading
6. Pagination
7. Query Plan 분석
8. 이미지 최적화
9. 불필요한 API 호출 방지
10. 불필요한 DB 조회 금지

---

# 예외 처리 Exception Handling 전역 예외 처리기(Global Exception Handler)를 통한 표준 에러 코드 응답.
설계 변경 프로세스 문서화 (RFC 형식)

표준 에러 코드
예시
400 BAD REQUEST
401 UNAUTHORIZED
403 FORBIDDEN
404 NOT FOUND
500 SERVER ERROR

---

# API Standard
RESTful API Level 3
Swagger(OpenAPI 3.0)
JSON 기반 표준
에러형식 코드 정의
명확한 리소스 중심 URL
표준 HTTP 상태 코드 사용
모든 API는 에러 응답 구조 통일
사용자 메시지와 내부 로그 분리
API Key 노출 금지(.env 사용)

예시
GET /users
POST /users
PUT /users/{id}
DELETE /users/{id}


응답 예시
{
"success": true,
"data": {}
}

---

# 폴더 구조 Folder Structure

Frontend
예시
src/
├ components
├ pages
├ hooks
├ services
├ utils


Backend
예시
src/
├ controller
├ service
├ repository
├ domain

---