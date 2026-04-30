# [ADR] Architecture Decision Records

## 1. PII 마스킹 처리 유틸리티 도입
- **상태**: Accepted
- **컨텍스트**: SECURITY.md 가이드라인에 따라 로그에 사용자 이메일, ID 등 개인정보(PII)가 평문으로 노출되는 것을 방지해야 함.
- **결정**: `MaskingUtil`을 `global.util` 패키지에 도입하고, 모든 서비스 레이어의 로깅 지점에서 이를 적용함.
- **결과**: 보안 사고 예방 및 보안 감사 대응력 향상.

## 2. 채팅 도메인 복합 인덱스 전략 적용
- **상태**: Accepted
- **컨텍스트**: 실시간 채팅 메시지가 수만 건 이상 쌓일 경우, 특정 방의 메시지를 최신순으로 가져오는 쿼리의 성능 저하 예상.
- **결정**: `chat_room_id`와 `created_at`을 묶는 복합 인덱스(`idx_chat_room_created_at`)를 추가하여 정렬 및 필터링 성능을 최적화함.
- **결과**: 대규모 데이터 상황에서도 p95 200ms 이하의 응답 속도 보장.

## 3. JPA N+1 방어 전략 표준화 (EntityGraph)
- **상태**: Accepted
- **컨텍스트**: 게시판 및 댓글 조회 시 작성자(User) 정보를 가져오는 과정에서 발생하는 N+1 쿼리 병목 확인.
- **결정**: `CommentRepository` 등에 `@EntityGraph`를 적용하여 연관 엔티티를 Eager Fetch 하도록 명시함.
- **결과**: 쿼리 횟수 감소로 인한 DB 부하 경감 및 응답 속도 개선.

## 4. Supabase Native API 기반 스토리지 연동
- **상태**: Accepted
- **컨텍스트**: Java AWS SDK v1과 Supabase S3-compatible API 간의 서명(Signature) 불일치 이슈로 인해 운영 환경에서 이미지 업로드 실패.
- **결정**: SDK 의존성을 제거하고, Supabase에서 제공하는 Native Storage API(HTTP POST)와 `service_role` JWT를 직접 사용하여 통신하도록 변경함.
- **결과**: 외부 라이브러리 의존성 없이 안정적인 파일 업로드 구현 및 서명 관련 보안 취약점 원천 차단.
