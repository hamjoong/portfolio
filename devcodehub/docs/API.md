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
| POST | `/api/v1/users/me/verify-senior`| 시니어 인증 신청 | Y |

## 2. 크레딧 및 경제 시스템 (Credits & Economy)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/credits/balance` | 현재 잔액 및 주간 AI 한도 정보 조회 | Y |
| POST | `/api/v1/credits/purchase` | 크레딧 충전 요청 | Y |
| POST | `/api/v1/credits/validate` | 결제 검증 (V1/V2 자동 분기) | Y |
| GET | `/api/v1/credits/transactions` | 크레딧 이용 내역 | Y |
| POST | `/api/v1/credits/subscribe` | 구독 신청 | Y |
| POST | `/api/v1/credits/subscribe/validate`| 구독 결제 검증 | Y |
| POST | `/api/v1/credits/unsubscribe` | 구독 해지 | Y |

## 3. 게시판 (Boards)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/boards` | 게시글 목록 조회 | N |
| POST | `/api/v1/boards` | 게시글 작성 | Y |
| GET | `/api/v1/boards/{id}` | 게시글 상세 조회 | N |
| PUT | `/api/v1/boards/{id}` | 게시글 수정 | Y |
| DELETE| `/api/v1/boards/{id}` | 게시글 삭제 | Y |
| POST | `/api/v1/boards/{id}/like` | 좋아요/취소 | Y |
| POST | `/api/v1/boards/{id}/bookmark`| 북마크/취소 | Y |
| GET | `/api/v1/boards/me/bookmarks`| 내 북마크 목록 | Y |
| POST | `/api/v1/boards/{boardId}/comments`| 댓글 작성 | Y |

## 4. 코드 리뷰 (Code Reviews)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/reviews/ai` | AI 코드 리뷰 요청 | Y/Guest |
| POST | `/api/v1/reviews/senior/requests` | 시니어 리뷰 요청 생성 | Y |
| GET | `/api/v1/reviews/senior/requests` | 시니어 리뷰 요청 목록 | N |
| GET | `/api/v1/reviews/senior/requests/{id}` | 시니어 리뷰 상세 | N |
| POST | `/api/v1/reviews/senior/requests/{id}/apply` | 시니어 리뷰 지원 | Y |
| POST | `/api/v1/reviews/senior/requests/{id}/complete` | 리뷰 작성 완료 | Y |
| POST | `/api/v1/reviews/senior/requests/{id}/rate` | 리뷰 평점 등록 | Y |

## 5. 실시간 채팅 (Real-time Chat)

- **WebSocket/STOMP Endpoint**: `/ws-stomp`

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/chats/rooms` | 채팅방 목록 | Y |
| POST | `/api/v1/chats/rooms` | 채팅방 생성 | Y |
| GET | `/api/v1/chats/rooms/{roomId}/messages`| 채팅 내역 | Y |

## 6. GitHub 연동 및 기타

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/github/repos` | GitHub 레포 목록 | Y |
| GET | `/api/v1/rankings` | 활동 랭킹 | N |
| GET | `/api/v1/admin/stats` | 관리자 통계 대시보드 | Y(Admin) |
