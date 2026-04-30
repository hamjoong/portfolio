# [API] DevCodeHub - API 명세서 (Core Endpoints)

## 1. 인증 및 회원 (Auth & User)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/auth/signup` | 자체 회원가입 | N |
| POST | `/api/v1/auth/login` | 자체 로그인 (JWT 발급) | N |
| GET | `/api/v1/auth/oauth2/{provider}`| 소셜 로그인 리다이렉션 | N |
| POST | `/api/v1/auth/find-id` | 이메일/연락처로 ID 찾기 | N |
| POST | `/api/v1/auth/find-pw` | ID/이메일/연락처로 PW 재설정 | N |
| GET | `/api/v1/users` | 모든 회원 리스트 조회 (본인 제외) | Y |
| GET | `/api/v1/users/me` | 내 프로필 정보 조회 | Y |
| PUT | `/api/v1/users/me` | 프로필 정보 수정 | Y |
| POST | `/api/v1/users/me/image` | 프로필 이미지 업로드 | Y |
| PATCH | `/api/v1/users/me/avatar` | 아바타(DiceBear) 변경 | Y |
| GET | `/api/v1/users/me/growth-graph` | 사용자 성장 경험치 및 레벨 정보 | Y |
| GET | `/api/v1/users/me/activity-logs` | 최근 7일 활동 로그 (경험치 획득 이력) | Y |
| POST | `/api/v1/users/me/verify-senior`| 시니어 인증 신청 | Y |

## 2. 크레딧 및 경제 시스템 (Credits & Economy)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/credits/balance` | 현재 잔액 및 주간 AI 한도 정보 조회 | Y |
| POST | `/api/v1/credits/purchase` | 크레딧 충전 요청 (테스트용) | Y |
| POST | `/api/v1/credits/validate` | 결제 검증 (V1/V2 자동 분기) | Y |
| GET | `/api/v1/credits/transactions` | 크레딧 이용 내역 | Y |
| POST | `/api/v1/credits/subscribe` | 구독 신청 | Y |
| POST | `/api/v1/credits/subscribe/validate`| 구독 결제 검증 | Y |
| POST | `/api/v1/credits/unsubscribe` | 구독 해지 (남은 기간 환불) | Y |

## 3. 게시판 (Boards)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/boards` | 게시글 목록 조회 (필터/검색 포함) | N |
| POST | `/api/v1/boards` | 게시글 작성 | Y |
| GET | `/api/v1/boards/{id}` | 게시글 상세 조회 | N |
| PUT | `/api/v1/boards/{id}` | 게시글 수정 | Y |
| DELETE| `/api/v1/boards/{id}` | 게시글 삭제 | Y |
| POST | `/api/v1/boards/{id}/like` | 좋아요/취소 토글 | Y |
| POST | `/api/v1/boards/{id}/bookmark`| 북마크/취소 토글 | Y |
| POST | `/api/v1/boards/{id}/views` | 조회수 증가 | N |
| GET | `/api/v1/boards/me/bookmarks`| 내 북마크 목록 | Y |
| GET | `/api/v1/boards/{boardId}/comments`| 댓글 목록 조회 | N |
| POST | `/api/v1/boards/{boardId}/comments`| 댓글 작성 | Y |
| PUT | `/api/v1/boards/{boardId}/comments/{id}`| 댓글 수정 | Y |
| DELETE| `/api/v1/boards/{boardId}/comments/{id}`| 댓글 삭제 | Y |

## 4. 코드 리뷰 (Code Reviews)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/reviews/ai` | AI 코드 리뷰 요청 (다중 모델) | Y/Guest |
| GET | `/api/v1/reviews/ai/guest-usage` | 비회원 AI 리뷰 사용 횟수 조회 | N |
| GET | `/api/v1/reviews/history` | 내 AI 리뷰 이력 조회 | Y |
| GET | `/api/v1/reviews/latest` | 최신 리뷰 목록 (3건) | N |
| POST | `/api/v1/reviews/senior/requests` | 시니어 리뷰 요청 생성 | Y |
| GET | `/api/v1/reviews/senior/requests` | 시니어 리뷰 요청 목록 | N |
| GET | `/api/v1/reviews/senior/requests/{id}` | 시니어 리뷰 상세 | N |
| POST | `/api/v1/reviews/senior/requests/{id}/apply` | 시니어 리뷰 지원 | Y |
| GET | `/api/v1/reviews/senior/requests/{id}/applications` | 지원자 목록 조회 | Y |
| POST | `/api/v1/reviews/senior/requests/{id}/applications/{appId}/accept` | 리뷰어 매칭 수락 | Y |
| POST | `/api/v1/reviews/senior/requests/{id}/complete` | 리뷰 작성 완료 및 정산 | Y |
| GET | `/api/v1/reviews/senior/requests/{id}/result` | 리뷰 결과 조회 | N |
| POST | `/api/v1/reviews/senior/requests/{id}/rate` | 리뷰 평점 등록 | Y |

## 5. 실시간 채팅 (Real-time Chat)

- **WebSocket/STOMP Endpoint**: `/ws-stomp`

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/chats/rooms` | 채팅방 목록 | Y |
| POST | `/api/v1/chats/rooms` | 채팅방 생성 (1:1/그룹) | Y |
| GET | `/api/v1/chats/rooms/{roomId}/messages`| 채팅 내역 조회 | Y |
| PATCH | `/api/v1/chats/rooms/{roomId}/read` | 마지막 읽은 메시지 업데이트 | Y |
| DELETE | `/api/v1/chats/rooms/{roomId}/leave` | 채팅방 나가기 | Y |

## 6. 관리자 및 통계 (Admin)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/admin/stats` | 대시보드 통계 (가입자, 매출, AI 점유율 등) | Admin |
| GET | `/api/v1/admin/users` | 사용자 통합 관리 (검색/목록) | Admin |
| POST | `/api/v1/admin/users/{loginId}/adjust-credits` | 크레딧 강제 조정 | Admin |
| GET | `/api/v1/admin/verifications` | 시니어 인증 대기 목록 | Admin |
| PATCH | `/api/v1/admin/verifications/{id}/approve` | 시니어 등급 승인 | Admin |
| PATCH | `/api/v1/admin/verifications/{id}/reject` | 시니어 등급 반려 | Admin |
| POST | `/api/v1/admin/reviews/{requestId}/cancel` | 리뷰 매칭 강제 취소 및 환불 | Admin |
| GET | `/api/v1/admin/boards` | 게시글 통합 관리 | Admin |
| DELETE | `/api/v1/admin/boards/{id}` | 게시글 강제 삭제 | Admin |
| PATCH | `/api/v1/admin/comments/{id}/delete` | 댓글 강제 삭제 (치환) | Admin |
| GET | `/api/v1/admin/logs` | 운영 감사 로그 조회 | Admin |

## 7. 기타 (Others)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/github/repos` | 연동된 GitHub 레포 목록 | Y |
| GET | `/api/v1/rankings` | 경험치 기반 TOP 5 랭킹 | N |
| GET | `/health` | 시스템 헬스 체크 | N |
