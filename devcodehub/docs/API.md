# [API] DevCodeHub - API 명세서 (Core Endpoints)

## 1. 인증 및 회원 (Auth & User)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/auth/signup` | 자체 회원가입 | N |
| POST | `/api/v1/auth/login` | 자체 로그인 (JWT 발급) | N |
| GET | `/api/v1/oauth2/authorization/{provider}`| 소셜 로그인 시작 (google·github·kakao·naver). 성공 시 프론트 `/login/callback#token=…` 으로 이동 | N |
| GET | `/api/v1/auth/check-id` | 로그인 ID 중복 확인 (`?loginId=`) | N |
| GET | `/api/v1/auth/check-email` | 이메일 중복 확인 (`?email=`) | N |
| GET | `/api/v1/auth/check-nickname` | 닉네임 중복 확인 (`?nickname=`) | N |
| POST | `/api/v1/auth/find-id` | 이메일/연락처로 ID 찾기 | N |
| GET | `/api/v1/users` | 모든 회원 리스트 조회 (본인 제외) | Y |
| GET | `/api/v1/users/me` | 내 프로필 정보 조회 | Y |
| PUT | `/api/v1/users/me` | 프로필 정보 수정 (비밀번호 변경 시 `currentPassword` 필요) | Y |
| POST | `/api/v1/users/me/image` | 프로필 이미지 업로드 | Y |
| PATCH | `/api/v1/users/me/avatar` | 아바타(DiceBear) 변경 | Y |
| GET | `/api/v1/users/me/growth-graph` | 사용자 성장 경험치 및 레벨 정보 | Y |
| GET | `/api/v1/users/me/activity-heatmap` | 날짜별 활동 건수(활동 잔디). `?days=365`(최대 365) | Y |
| POST | `/api/v1/users/me/verify-senior`| 시니어 인증 신청 | Y |

## 2. 크레딧 및 결제 시스템 (Credits & Economy)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/credits/balance` | 현재 잔액 및 주간 AI 한도 정보 조회 | Y |
| POST | `/api/v1/credits/validate` | 결제 검증 후 충전 (V1/V2 자동 분기, 결제 ID 1회용, 충전 금액 1,000·5,000·10,000·50,000) | Y |
| GET | `/api/v1/credits/transactions` | 크레딧 이용 내역 | Y |
| POST | `/api/v1/credits/subscribe/validate`| 구독 결제 검증 (서버 가격표와 대조, 이미 구독 중이면 거절) | Y |
| POST | `/api/v1/credits/unsubscribe` | 구독 해지 (실결제 금액 기준 남은 기간만큼 크레딧 환급) | Y |

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
| GET | `/api/v1/reviews/ai/models` | 모델별 사용 가능 여부 (API 키 등록 여부) | N |
| POST | `/api/v1/reviews/ai` | AI 코드 리뷰 요청 (다중 모델, 키 미등록 모델은 400) | Y/Guest |
| GET | `/api/v1/reviews/ai/guest-usage` | 비회원 AI 리뷰 사용 횟수 조회 | N |
| GET | `/api/v1/reviews/history` | 내 AI 리뷰 이력 조회 | Y |
| GET | `/api/v1/reviews/latest` | 최신 AI 리뷰 제목 목록 (3건) | Y |
| POST | `/api/v1/reviews/senior/requests` | 시니어 리뷰 요청 생성 | Y |
| GET | `/api/v1/reviews/senior/requests` | 시니어 리뷰 요청 목록 | N |
| GET | `/api/v1/reviews/senior/requests/{id}` | 시니어 리뷰 상세 | N |
| POST | `/api/v1/reviews/senior/requests/{id}/apply` | 시니어 리뷰 지원 | Y |
| GET | `/api/v1/reviews/senior/requests/{id}/applications` | 지원자 목록 조회 (요청 작성자·관리자) | Y |
| POST | `/api/v1/reviews/senior/requests/{id}/applications/{appId}/accept` | 리뷰어 매칭 수락 (대기 상태의 본인 요청만) | Y |
| POST | `/api/v1/reviews/senior/requests/{id}/complete` | 리뷰 작성 완료 및 정산 (담당 시니어, 1회) | Y |
| GET | `/api/v1/reviews/senior/requests/{id}/result` | 리뷰 결과 조회 (요청자·담당 시니어·관리자) | Y |
| POST | `/api/v1/reviews/senior/requests/{id}/rate` | 리뷰 평점 등록 | Y |

## 5. 실시간 채팅 (Real-time Chat)

- **WebSocket/STOMP Endpoint**: `/api/v1/ws-stomp` (SockJS). 연결 시 `Authorization: Bearer <JWT>` 헤더 필수 — 인증 없는 연결은 거부됩니다.
- **발행(SEND)**: `/pub/chat/message` — 본문 `{roomId, message, type}`. 발신자는 서버가 인증 정보에서 정합니다.
- **구독(SUBSCRIBE)**

| Destination | 설명 | 허용 대상 |
| :--- | :--- | :--- |
| `/sub/chat/room/{roomId}` | 채팅방 메시지 | 방 참여자 |
| `/sub/chat/unread/{loginId}` | 안 읽은 메시지 수 갱신 | 본인 |
| `/sub/notifications/{loginId}` | 실시간 알림 | 본인 |
| `/sub/notifications/senior` | 시니어 리뷰 요청 알림 | 시니어·관리자 |
| `/sub/notifications/admin` | 시니어 인증 신청 알림 | 관리자 |


| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/chats/rooms` | 채팅방 목록 | Y |
| POST | `/api/v1/chats/rooms` | 채팅방 생성 (1:1/그룹) | Y |
| GET | `/api/v1/chats/rooms/{roomId}/messages`| 채팅 내역 조회 (참여자만) | Y |
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
| GET | `/api/v1/notifications` | 내 알림 목록(최근 24시간) | Y |
| GET | `/api/v1/rankings` | 경험치 기반 TOP 5 랭킹 | N |
| GET | `/health` | 시스템 헬스 체크 | N |

## 8. 공통 규칙

- 성공 응답: `{ "success": true, "data": ... }` / 실패 응답: `{ "success": false, "error": { "code": "...", "message": "..." } }`
- 인증: `Authorization: Bearer <JWT>`. 공개 GET은 게시판 조회·랭킹·최신 리뷰·시니어 요청 목록/상세·AI 모델 목록·헬스 체크뿐이며, 그 외 모든 요청은 인증이 필요합니다. `/api/v1/admin/**`는 ADMIN 전용입니다.
- 상태 코드: 입력 오류 400 · 미인증 401 · 권한 없음 403 · 없음 404 · 요청 과다 429. 서버 내부 오류 상세는 응답에 포함하지 않습니다.
- 비밀번호 찾기(`find-pw`) API는 제거되었습니다(관리자 문의로 안내).
