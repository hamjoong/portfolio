# [Todo] DevCodeHub - 프로젝트 개발 로드맵

## Phase 1: 개발 환경 구축 및 인증 (1~2주) - [완료]
- [x] **프로젝트 초기화**
  - [x] Spring Boot 3.x 기반 프로젝트 생성 (Java 21)
  - [x] React 18+ Vite 프로젝트 생성 (TypeScript)
  - [x] Docker Compose 설정 (Redis, PostgreSQL)
  - [x] Supabase PostgreSQL 연동 및 프로파일 분리 (local/prod)
  - [x] **인증 시스템 구현**
  - [x] Spring Security + OAuth 2.0 (Google, GitHub 등) 연동
  - [x] JWT 발급 및 검증 로직 구현
  - [x] ID/PW 가입 및 찾기 로직 구현

## Phase 2: 게시판 및 사용자 프로필 (2~3주) - [완료]
- [x] **프로필 관리**
  - [x] 프로필 정보 수정 API 개발
  - [x] 아바타 및 프로필 이미지 업로드 연동
- [x] **커뮤니티 게시판**
  - [x] IT 스킬 / AI 정보 게시판 CRUD API 개발
  - [x] 태그 기반 검색 및 페이징 처리
  - [x] 좋아요, 북마크, 조회수 기능 구현

## Phase 3: AI 코드 리뷰 및 에디터 (3~4주) - [완료]
- [x] 코드 스플리팅 및 Lazy Loading 적용
- [x] Monaco Editor 적용
- [x] AI 서비스 연동 (OpenAI/Claude/Gemini)
- [x] 크레딧 차감 및 한도 시스템 구현

## Phase 4: 실시간 채팅 및 알림 (4~5주) - [완료]
- [x] WebSocket (STOMP) 설정 및 서버 구현
- [x] Redis Pub/Sub 및 Write-behind 구현
- [x] 다중 인스턴스 간 중복 방지 로직 구현
- [x] 알림 센터 알림 시스템 구현

## Phase 5: 시니어 리뷰 및 게이미피케이션 (5~6주) - [완료]
- [x] 하이브리드 매칭 시스템 구현
- [x] 크레딧 정산 및 플랫폼 수수료 시스템 구현

## Phase 6: 수익화 및 한도 시스템 (7~8주) - [완료]
- [x] 크레딧 트랜잭션 및 정산 로직 구현
- [x] 가입 회원 주간 한도 관리 스케줄러 구현
- [x] 결제 검증 연동 (PortOne)

## Phase 7: GitHub 연동 및 자동화 (9주) - [완료]
- [x] GitHub OAuth2 Scope 연동 및 레포지토리 목록 조회

## Phase 8: 관리 시스템 및 통계 고도화 - [완료]
- [x] 관리자 통계 대시보드 구축
- [x] 통합 운영 도구 및 감사 로그 시스템 구현

## Phase 9: 배포 및 자동화 - [완료]
- [x] GitHub Actions 기반 CI/CD 파이프라인 구축
- [x] 경로 기반 스마트 빌드 및 선별 배포 적용
- [x] 운영 환경 AWS ECS/Fargate 안정화
- [x] Supabase Native API 스토리지 연동 이슈 해결

## Phase 10: 안정화 및 고도화 (진행 예정)
- [x] 부하 테스트 및 성능 튜닝
- [] AI 모델 추가 (Claude, OpenAI API 키 활성화)
