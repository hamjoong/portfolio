-- ============================================================================
-- DevCodeHub 데모 데이터 (포트폴리오 시연용)
--
-- 내용: 사용자 10명(시니어 3 · 주니어 7), 게시글 32개(IT 기술 18 · AI 정보 14),
--       댓글 70개, 좋아요·북마크, 시니어 리뷰 요청 9건(대기 · 매칭 · 완료 · 취소)과 지원·답변·평점,
--       크레딧 거래 내역, 뱃지.
--
-- 특징
--  - 모든 데모 계정의 login_id는 demo_ 로 시작합니다. 비밀번호는 아무도 모르는 값이라 로그인할 수 없고, 화면에서 '다른 사용자의 글'로 보입니다.
--  - 다시 실행해도 안전합니다. 맨 앞에서 데모 데이터만 지우고 새로 넣습니다(실제 사용자 데이터는 그대로).
--  - 데모 데이터만 지우려면 seed_demo_cleanup.sql 을 실행하세요.
--  - 날짜는 실행 시점 기준 '며칠 전'으로 들어가므로 활동 잔디가 최근 약 100일에 걸쳐 채워집니다.
--  - 스키마(schema.sql)가 먼저 적용되어 있어야 하고, 뱃지는 앱이 한 번 기동되어 badges 테이블이 채워진 뒤에 지급됩니다.
--
-- 실행: Supabase SQL Editor에 전체를 붙여 넣어 실행하거나, psql -f seed_demo.sql
-- 이 파일은 생성기로 만든 결과물입니다(손으로 고치기보다 원본 데이터를 바꿔 다시 생성하세요).
-- ============================================================================

BEGIN;

-- 1. 기존 데모 데이터 정리
-- 데모 사용자(login_id가 demo_ 로 시작)와 그 사용자와 얽힌 데이터를 모두 지웁니다. 실제 사용자 데이터는 건드리지 않습니다.
-- (실제 사용자가 데모 게시글에 남긴 댓글·좋아요·북마크는 게시글과 함께 지워집니다.)
CREATE TEMP TABLE _demo_u ON COMMIT DROP AS SELECT id FROM users WHERE login_id LIKE 'demo\_%';
CREATE TEMP TABLE _demo_b ON COMMIT DROP AS SELECT id FROM boards WHERE user_id IN (SELECT id FROM _demo_u);
CREATE TEMP TABLE _demo_r ON COMMIT DROP AS SELECT id FROM senior_review_requests
  WHERE junior_id IN (SELECT id FROM _demo_u) OR senior_id IN (SELECT id FROM _demo_u);

DELETE FROM notifications WHERE user_id IN (SELECT id FROM _demo_u);
DELETE FROM user_badges WHERE user_id IN (SELECT id FROM _demo_u);
DELETE FROM credit_transactions WHERE user_id IN (SELECT id FROM _demo_u);
DELETE FROM senior_reviews WHERE senior_id IN (SELECT id FROM _demo_u) OR request_id IN (SELECT id FROM _demo_r);
DELETE FROM senior_review_applications WHERE senior_id IN (SELECT id FROM _demo_u) OR request_id IN (SELECT id FROM _demo_r);
DELETE FROM senior_review_request_tags WHERE request_id IN (SELECT id FROM _demo_r);
DELETE FROM senior_review_requests WHERE id IN (SELECT id FROM _demo_r);
DELETE FROM senior_verifications WHERE user_id IN (SELECT id FROM _demo_u);
DELETE FROM comments WHERE user_id IN (SELECT id FROM _demo_u) OR board_id IN (SELECT id FROM _demo_b);
DELETE FROM board_likes WHERE user_id IN (SELECT id FROM _demo_u) OR board_id IN (SELECT id FROM _demo_b);
DELETE FROM board_bookmarks WHERE user_id IN (SELECT id FROM _demo_u) OR board_id IN (SELECT id FROM _demo_b);
DELETE FROM board_tags WHERE board_id IN (SELECT id FROM _demo_b);
DELETE FROM boards WHERE id IN (SELECT id FROM _demo_b);
DELETE FROM reviews WHERE user_id IN (SELECT id FROM _demo_u);
DELETE FROM chat_messages WHERE user_id IN (SELECT id FROM _demo_u);
DELETE FROM chat_room_users WHERE user_id IN (SELECT id FROM _demo_u);
DELETE FROM user_subscriptions WHERE user_id IN (SELECT id FROM _demo_u);
DELETE FROM admin_logs WHERE admin_id IN (SELECT id FROM _demo_u) OR target_user_id IN (SELECT id FROM _demo_u);
DELETE FROM users WHERE id IN (SELECT id FROM _demo_u);

-- 2. 이후 단계에서 id를 이름으로 찾기 위한 임시 표
CREATE TEMP TABLE _k (kind text, key text, id bigint) ON COMMIT DROP;

-- 3. 사용자

WITH ins AS (
  INSERT INTO users (login_id, nickname, email, password, role, credits, experience, level, max_weekly_free_limit, total_spent_credits, weekly_free_review_used, avatar_url, created_at)
  VALUES ('demo_sen_seojun', '서준시니어', 'demo_sen_seojun@example.com', '$2a$10$X5PoIW5bK5ffpkvv6C5xX31Wgp5spW8yJZ7r1vKzNKy/v0XBqtIiU', 'SENIOR', 770, 90, 2, 5, 0, 0,
          'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_sen_seojun', (now() - interval '216000 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'u', 'demo_sen_seojun', id FROM ins;
WITH ins AS (
  INSERT INTO users (login_id, nickname, email, password, role, credits, experience, level, max_weekly_free_limit, total_spent_credits, weekly_free_review_used, avatar_url, created_at)
  VALUES ('demo_sen_hayoon', '하윤프론트', 'demo_sen_hayoon@example.com', '$2a$10$X5PoIW5bK5ffpkvv6C5xX31Wgp5spW8yJZ7r1vKzNKy/v0XBqtIiU', 'SENIOR', 680, 35, 2, 5, 0, 0,
          'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_sen_hayoon', (now() - interval '201600 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'u', 'demo_sen_hayoon', id FROM ins;
WITH ins AS (
  INSERT INTO users (login_id, nickname, email, password, role, credits, experience, level, max_weekly_free_limit, total_spent_credits, weekly_free_review_used, avatar_url, created_at)
  VALUES ('demo_sen_jaemin', '재민DBA', 'demo_sen_jaemin@example.com', '$2a$10$X5PoIW5bK5ffpkvv6C5xX31Wgp5spW8yJZ7r1vKzNKy/v0XBqtIiU', 'SENIOR', 860, 35, 2, 5, 0, 0,
          'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_sen_jaemin', (now() - interval '194400 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'u', 'demo_sen_jaemin', id FROM ins;
WITH ins AS (
  INSERT INTO users (login_id, nickname, email, password, role, credits, experience, level, max_weekly_free_limit, total_spent_credits, weekly_free_review_used, avatar_url, created_at)
  VALUES ('demo_jun_haneul', '하늘코딩', 'demo_jun_haneul@example.com', '$2a$10$X5PoIW5bK5ffpkvv6C5xX31Wgp5spW8yJZ7r1vKzNKy/v0XBqtIiU', 'USER', 600, 85, 1, 5, 400, 1,
          'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_jun_haneul', (now() - interval '158400 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'u', 'demo_jun_haneul', id FROM ins;
WITH ins AS (
  INSERT INTO users (login_id, nickname, email, password, role, credits, experience, level, max_weekly_free_limit, total_spent_credits, weekly_free_review_used, avatar_url, created_at)
  VALUES ('demo_jun_minseo', '민서의개발일지', 'demo_jun_minseo@example.com', '$2a$10$X5PoIW5bK5ffpkvv6C5xX31Wgp5spW8yJZ7r1vKzNKy/v0XBqtIiU', 'USER', 500, 85, 1, 5, 0, 1,
          'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_jun_minseo', (now() - interval '151200 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'u', 'demo_jun_minseo', id FROM ins;
WITH ins AS (
  INSERT INTO users (login_id, nickname, email, password, role, credits, experience, level, max_weekly_free_limit, total_spent_credits, weekly_free_review_used, avatar_url, created_at)
  VALUES ('demo_jun_jihun', '지훈디버거', 'demo_jun_jihun@example.com', '$2a$10$X5PoIW5bK5ffpkvv6C5xX31Wgp5spW8yJZ7r1vKzNKy/v0XBqtIiU', 'USER', 750, 90, 1, 5, 350, 2,
          'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_jun_jihun', (now() - interval '141120 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'u', 'demo_jun_jihun', id FROM ins;
WITH ins AS (
  INSERT INTO users (login_id, nickname, email, password, role, credits, experience, level, max_weekly_free_limit, total_spent_credits, weekly_free_review_used, avatar_url, created_at)
  VALUES ('demo_jun_yuna', '유나는백엔드', 'demo_jun_yuna@example.com', '$2a$10$X5PoIW5bK5ffpkvv6C5xX31Wgp5spW8yJZ7r1vKzNKy/v0XBqtIiU', 'USER', 900, 5, 2, 5, 600, 3,
          'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_jun_yuna', (now() - interval '136800 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'u', 'demo_jun_yuna', id FROM ins;
WITH ins AS (
  INSERT INTO users (login_id, nickname, email, password, role, credits, experience, level, max_weekly_free_limit, total_spent_credits, weekly_free_review_used, avatar_url, created_at)
  VALUES ('demo_jun_taeho', '태호풀스택', 'demo_jun_taeho@example.com', '$2a$10$X5PoIW5bK5ffpkvv6C5xX31Wgp5spW8yJZ7r1vKzNKy/v0XBqtIiU', 'USER', 1000, 35, 2, 5, 0, 2,
          'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_jun_taeho', (now() - interval '129600 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'u', 'demo_jun_taeho', id FROM ins;
WITH ins AS (
  INSERT INTO users (login_id, nickname, email, password, role, credits, experience, level, max_weekly_free_limit, total_spent_credits, weekly_free_review_used, avatar_url, created_at)
  VALUES ('demo_jun_sora', '소라SQL', 'demo_jun_sora@example.com', '$2a$10$X5PoIW5bK5ffpkvv6C5xX31Wgp5spW8yJZ7r1vKzNKy/v0XBqtIiU', 'USER', 1200, 70, 1, 6, 1300, 3,
          'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_jun_sora', (now() - interval '120960 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'u', 'demo_jun_sora', id FROM ins;
WITH ins AS (
  INSERT INTO users (login_id, nickname, email, password, role, credits, experience, level, max_weekly_free_limit, total_spent_credits, weekly_free_review_used, avatar_url, created_at)
  VALUES ('demo_jun_dongmin', '동민의프롬프트', 'demo_jun_dongmin@example.com', '$2a$10$X5PoIW5bK5ffpkvv6C5xX31Wgp5spW8yJZ7r1vKzNKy/v0XBqtIiU', 'USER', 500, 10, 2, 5, 0, 0,
          'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_jun_dongmin', (now() - interval '115200 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'u', 'demo_jun_dongmin', id FROM ins;

-- 4. 시니어 인증(승인됨)

INSERT INTO senior_verifications (user_id, career_summary, status, created_at, updated_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), '백엔드 개발 8년차. 커머스·결제 도메인에서 Spring Boot 기반 API 서버를 설계하고 운영했습니다. 코드 리뷰 문화 정착과 신입 멘토링 경험이 있습니다.', 'APPROVED', (now() - interval '213120 minutes'), (now() - interval '214560 minutes'));
INSERT INTO senior_verifications (user_id, career_summary, status, created_at, updated_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), '프론트엔드 개발 7년차. React·TypeScript 기반 서비스와 디자인 시스템을 만들었고, 렌더링 성능 개선과 접근성 개선을 주로 맡았습니다.', 'APPROVED', (now() - interval '198720 minutes'), (now() - interval '200160 minutes'));
INSERT INTO senior_verifications (user_id, career_summary, status, created_at, updated_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), '데이터베이스·인프라 10년차. PostgreSQL 튜닝과 장애 대응, Docker 기반 배포 파이프라인 구축 경험이 있습니다.', 'APPROVED', (now() - interval '191520 minutes'), (now() - interval '192960 minutes'));

-- 5. 게시글과 태그

WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('React에서 useEffect 의존성 배열을 제대로 쓰는 법', '리뷰를 하다 보면 useEffect 때문에 생기는 버그가 가장 많습니다. 제가 코드를 볼 때 확인하는 순서를 정리했어요.

1) 이펙트 안에서 쓰는 값은 전부 의존성 배열에 넣는다
   린트 경고(exhaustive-deps)를 끄는 순간부터 버그가 시작됩니다. 경고가 거슬리면 값을 이펙트 밖으로 빼거나 useCallback으로 고정하세요.

2) 객체와 배열은 매 렌더마다 새로 만들어진다
   const options = { page: 1 } 를 의존성에 넣으면 렌더마다 이펙트가 다시 실행됩니다. 원시 값(page)을 넣거나 useMemo를 쓰세요.

3) 데이터 요청은 이펙트에 직접 쓰기보다 TanStack Query 같은 도구에 맡긴다
   취소, 중복 요청, 캐시를 직접 처리하면 코드가 금방 복잡해집니다.

4) 정리(cleanup) 함수를 잊지 않는다
   타이머, 이벤트 리스너, 소켓 구독은 반드시 해제해야 메모리 누수가 없습니다.

의존성 배열을 비워 두고 싶은 마음이 들 때는 ''이 값이 바뀌어도 정말 상관없나?''를 먼저 물어보세요.', 'SKILL', 214, (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '89340 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's01', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s01'), 'FRONTEND');
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s01'), 'REACT');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('TypeScript 제네릭을 처음 이해한 날 정리', '제네릭이 계속 어렵게 느껴졌는데, ''API 응답 타입을 재사용하는 상황''으로 보니 바로 이해됐습니다.

예를 들어 서버 응답이 항상 이런 모양이라고 해볼게요.

  { success: true, data: ... }

data 안의 내용만 달라지니까 타입을 이렇게 만들 수 있었습니다.

  interface ApiResponse<T> {
    success: boolean;
    data: T;
  }

  const res: ApiResponse<User[]> = await api.get(''/users'');

T는 ''나중에 정해질 타입의 자리 표시자''라고 생각하니 편했어요.
처음에는 any로 때우다가 타입 에러를 많이 놓쳤는데, 제네릭을 쓰고 나서 응답 모양이 바뀌면 컴파일 단계에서 바로 알 수 있게 됐습니다.

혹시 제가 잘못 이해한 부분이 있으면 알려주세요!', 'SKILL', 168, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '79639 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's02', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s02'), 'FRONTEND');
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s02'), 'TYPESCRIPT');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('Tailwind CSS로 반응형 레이아웃 잡을 때 자주 하는 실수', '포트폴리오를 모바일에서 열어 보니 가로 스크롤이 생겨서 한참 고생했습니다. 원인을 정리해 둡니다.

- 고정 너비(w-[600px] 같은 값)를 그대로 쓰면 작은 화면에서 넘칩니다. max-w-full 이나 w-full 과 같이 쓰세요.
- flex 자식에 긴 텍스트가 있으면 min-w-0 을 주지 않으면 줄어들지 않습니다.
- 표(table)는 감싸는 div에 overflow-x-auto 를 줘야 합니다.
- 기본 스타일을 모바일 기준으로 먼저 쓰고, md: lg: 로 넓은 화면을 덧씌우는 게 훨씬 편합니다.

크롬 개발자 도구의 기기 모드에서 320px 폭으로 줄여 놓고 확인하는 습관을 들였더니 같은 실수가 줄었어요.', 'SKILL', 132, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '68498 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's03', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s03'), 'FRONTEND');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('목록 화면 렌더링이 느릴 때 점검하는 순서', '''화면이 느려요''라는 말만으로는 원인을 알 수 없습니다. 저는 이 순서로 봅니다.

1) 네트워크 탭: 요청이 느린가, 렌더링이 느린가부터 구분한다.
2) React Profiler: 어떤 컴포넌트가 몇 번 렌더링되는지 확인한다.
3) 목록 항목 컴포넌트를 React.memo로 감싸고, props로 넘기는 함수는 useCallback으로 고정한다.
4) 항목이 수백 개를 넘으면 페이지네이션이나 가상 스크롤(virtualization)을 쓴다.
5) 이미지는 크기를 지정하고 lazy loading을 적용한다.

최적화는 측정부터 하세요. 느낌으로 memo를 여기저기 붙이면 코드만 복잡해지고 빨라지지 않는 경우가 많습니다.', 'SKILL', 241, (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '47617 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's04', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s04'), 'FRONTEND');
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s04'), 'REACT');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('Spring Boot에서 예외 처리를 한 곳에 모으는 방법', '컨트롤러마다 try-catch가 있으면 응답 형식이 제각각이 됩니다. @RestControllerAdvice 로 한 곳에 모으면 정리됩니다.

1) 비즈니스 규칙 위반용 예외(BusinessException)를 만들고 에러 코드를 enum으로 관리한다.
2) @ExceptionHandler 에서 항상 같은 형태의 에러 응답({ success: false, error: { code, message } })을 돌려준다.
3) 검증 실패(MethodArgumentNotValidException)는 첫 번째 메시지만 사용자에게 보여 준다.
4) 예상하지 못한 예외는 로그에는 자세히 남기고, 응답에는 내부 정보를 숨긴다.

특히 4번이 중요합니다. 스택 트레이스나 SQL 오류 메시지가 그대로 나가면 보안 문제가 됩니다.', 'SKILL', 305, (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '101276 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's05', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s05'), 'BACKEND');
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s05'), 'SPRING');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('JPA N+1 문제를 직접 만나고 해결한 기록', '게시글 목록 API가 느려서 로그를 켜 봤더니 SQL이 수십 번 나가고 있었습니다.

원인: 게시글을 조회한 뒤 작성자(author)를 화면에 쓸 때마다 지연 로딩으로 쿼리가 한 번씩 더 나갔어요. 게시글 10개면 쿼리가 11번(1+N)입니다.

해결 방법 세 가지를 비교해 봤습니다.
- join fetch: 한 번의 쿼리로 같이 가져온다. 페이징과 같이 쓰면 주의가 필요하다.
- @EntityGraph: 메서드에 어노테이션만 붙이면 된다.
- default_batch_fetch_size: IN 쿼리로 묶어서 가져온다. 설정 한 줄로 효과가 크다.

저는 설정으로 batch size를 50으로 두고, 목록 쿼리에만 join fetch를 썼습니다. SQL 로그에서 쿼리 수가 11개에서 2개로 줄었어요.', 'SKILL', 276, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '84375 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's06', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s06'), 'BACKEND');
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s06'), 'JPA');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('JWT 인증 구현할 때 꼭 확인하는 5가지', 'JWT 로그인은 만들기 쉽지만 빠뜨리기도 쉽습니다. 리뷰할 때 제가 확인하는 목록입니다.

1) 비밀키를 코드나 저장소에 넣지 않았는가 (환경변수로 주입)
2) 만료 시간이 있는가, 그리고 만료된 토큰을 서버가 거부하는가
3) 토큰에 비밀번호 같은 민감 정보를 넣지 않았는가 (JWT는 암호화가 아니라 서명일 뿐이라 누구나 내용을 볼 수 있다)
4) 로그인 시도 횟수를 제한하는가 (무차별 대입 방어)
5) 로그아웃·탈퇴 후 토큰 처리 방침이 정해져 있는가

특히 4번은 IP별 요청 제한을 걸 때 프록시 뒤에서 클라이언트 IP를 어떻게 구하는지도 같이 봐야 합니다. X-Forwarded-For 맨 앞 값을 그대로 믿으면 우회됩니다.', 'SKILL', 352, (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '59174 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's07', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s07'), 'BACKEND');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('@Transactional을 붙였는데 롤백이 안 되는 이유', '예외가 났는데 DB에 데이터가 남아 있어서 당황했던 경험을 공유합니다.

확인한 원인 두 가지:
1) 같은 클래스 안에서 this.method() 로 호출하면 프록시를 거치지 않아 @Transactional 이 적용되지 않는다.
2) 체크 예외(Exception)는 기본적으로 롤백되지 않는다. RuntimeException 이거나 rollbackFor 를 지정해야 한다.

그리고 try-catch 로 예외를 삼켜 버리면 트랜잭션이 정상 종료된 것으로 처리돼서 커밋됩니다. 잡아서 로그만 찍고 끝내는 습관은 조심해야 해요.', 'SKILL', 189, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '37953 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's08', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s08'), 'BACKEND');
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s08'), 'SPRING');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('혼자 만든 첫 풀스택 프로젝트 회고', 'React + Spring Boot로 게시판을 처음부터 끝까지 만들어 봤습니다. 한 달 정도 걸렸어요.

잘한 것
- 화면보다 API 명세(요청/응답 JSON)를 먼저 정리했더니 프론트와 백엔드 작업이 덜 꼬였다.
- 로그인과 권한을 초반에 붙여서 나중에 전부 뜯어고치는 일이 없었다.

아쉬운 것
- 테스트 없이 만들다가 수정할 때마다 불안했다.
- 에러 처리를 나중으로 미뤘다가 화면마다 제각각이 됐다.

다음에는 핵심 기능마다 테스트를 하나씩 먼저 쓰고 시작해 보려고 합니다.', 'SKILL', 157, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '75772 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's09', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s09'), 'FULLSTACK');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('프론트와 백엔드 CORS 에러를 한 번에 정리', '로컬에서는 되는데 배포하니 CORS 에러가 나는 경험, 다들 한 번쯤 하시죠.

핵심은 ''브라우저가 막는 것''이라는 점입니다. 서버에서 허용할 출처(Origin)를 명시해야 합니다.

확인 순서
1) 에러 메시지의 Origin이 서버 허용 목록과 글자 하나까지 같은지 본다 (https와 http, 끝 슬래시 포함).
2) 쿠키나 Authorization 헤더를 보낸다면 allowCredentials 와 허용 헤더 설정을 확인한다.
3) Preflight(OPTIONS) 요청이 인증 필터에서 막히지 않는지 확인한다.
4) 개발 중에는 Vite 프록시를 쓰면 CORS 자체를 피할 수 있다.

운영 주소를 환경변수로 받아서 허용 목록에 넣어 두면 배포할 때 코드를 바꿀 필요가 없습니다.', 'SKILL', 203, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '30411 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's10', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s10'), 'FULLSTACK');
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s10'), 'REACT');
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s10'), 'SPRING');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('포트폴리오 프로젝트에서 면접관이 실제로 묻는 것들', '면접에서 포트폴리오를 볼 때 기능 개수보다 ''왜 그렇게 만들었는지''를 묻습니다. 자주 나오는 질문입니다.

- 이 기술을 왜 선택했나요? 다른 대안은 무엇이었나요?
- 가장 어려웠던 문제와 해결 과정은?
- 동시에 요청이 몰리면 어떻게 되나요? (재고 차감, 중복 결제 등)
- 보안은 어떻게 고려했나요? (인증, 입력 검증, 비밀 관리)
- 다시 만든다면 무엇을 바꾸겠나요?

답변을 준비하는 가장 좋은 방법은 README에 ''문제 → 원인 → 해결''을 적어 두는 것입니다. 트러블슈팅 기록이 곧 면접 답변이 됩니다.', 'SKILL', 418, (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '17830 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's11', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s11'), 'FULLSTACK');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('인덱스를 걸었는데도 쿼리가 느린 이유', '게시글 검색에 인덱스를 걸었는데 속도가 그대로였습니다. 알아낸 이유를 적어 봅니다.

- LIKE ''%키워드%'' 처럼 앞에 와일드카드가 있으면 일반 B-Tree 인덱스를 타지 못한다.
- WHERE 절에서 컬럼에 함수를 씌우면(lower(title)) 인덱스를 타지 못한다. 표현식 인덱스를 따로 만들어야 한다.
- 데이터가 적으면 옵티마이저가 인덱스보다 전체 스캔이 빠르다고 판단한다.
- 복합 인덱스는 컬럼 순서가 중요하다. 조건에 자주 쓰는 컬럼을 앞에 둔다.

EXPLAIN으로 실제 실행 계획을 보기 전에는 추측하지 말자는 교훈을 얻었습니다.', 'SKILL', 226, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '64289 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's12', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s12'), 'DB');
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s12'), 'SQL');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('PostgreSQL EXPLAIN ANALYZE 읽는 법', '느린 쿼리를 잡을 때 가장 먼저 쓰는 도구입니다. 처음엔 출력이 길어 보이지만 볼 곳은 몇 군데뿐입니다.

1) 맨 아래 Execution Time: 실제 걸린 시간
2) Seq Scan vs Index Scan: 큰 테이블에서 Seq Scan이 나오면 인덱스를 의심한다
3) rows= 추정치와 actual rows 가 크게 다르면 통계가 오래됐다는 신호다 (ANALYZE 실행)
4) Nested Loop 안쪽에서 loops 가 아주 크면 N+1 과 비슷한 문제다
5) Sort 에서 Disk 를 쓰면 work_mem 이 부족한 것이다

실서비스 DB에서는 EXPLAIN ANALYZE 가 쿼리를 실제로 실행한다는 점을 잊지 마세요. UPDATE/DELETE 는 트랜잭션으로 감싸고 롤백하세요.', 'SKILL', 312, (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '52048 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's13', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s13'), 'DB');
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s13'), 'POSTGRESQL');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('정규화는 어디까지 해야 할까요?', '수업에서는 3정규형까지 하라고 배웠는데, 실제 프로젝트에서는 조회가 복잡해져서 고민입니다.

예를 들어 게시글 테이블에 작성자 닉네임을 같이 저장하면 조회는 빠르지만, 닉네임이 바뀌면 모든 게시글을 고쳐야 합니다.

저는 일단 정규화해서 설계하고, 느린 조회가 실제로 측정된 곳만 비정규화하기로 했는데 이 방향이 맞을까요?
선배님들은 어떤 기준으로 정하시는지 궁금합니다.', 'SKILL', 143, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '26507 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's14', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s14'), 'DB');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('Supabase 무료 플랜에서 커넥션이 부족할 때', '무료 플랜에서는 동시 연결 수가 적어서 애플리케이션 커넥션 풀을 크게 잡으면 금방 한도에 걸립니다.

점검 포인트
- 풀 크기를 작게 유지한다 (예: 5개). 서버가 1대라면 충분한 경우가 많다.
- 직접 연결 대신 Session pooler 주소를 쓴다.
- 쿼리 안에서 외부 API(AI 호출 등)를 기다리면 그동안 커넥션이 점유된다. 트랜잭션 밖으로 빼자.
- 오래 걸리는 쿼리는 로그로 찾아서 줄인다.

커넥션 에러가 나면 코드부터 의심하기 전에 현재 연결 수를 먼저 확인해 보세요.', 'SKILL', 177, (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '13926 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's18', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s18'), 'DB');
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s18'), 'POSTGRESQL');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('Docker 이미지 용량을 절반으로 줄인 방법', 'Spring Boot 이미지가 커서 배포가 느렸습니다. 효과가 컸던 순서대로 적습니다.

1) 멀티스테이지 빌드: 빌드용 이미지(JDK, Maven)와 실행용 이미지(JRE)를 분리한다. 가장 효과가 크다.
2) 실행용 베이스를 JDK 에서 JRE 로 바꾼다.
3) .dockerignore 로 .git, node_modules, 로그, .env 를 제외한다. 용량뿐 아니라 비밀 유출도 막아 준다.
4) 레이어 순서를 바꿔서 자주 안 바뀌는 것(의존성)을 위에 둔다. 캐시가 잘 먹는다.

주의: .env 를 이미지에 넣지 말고 실행할 때 환경변수로 주입하세요.', 'SKILL', 264, (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '56405 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's15', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s15'), 'DEVOPS');
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s15'), 'DOCKER');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('무료 호스팅에서 배포하며 알게 된 것들', 'Render 무료 플랜에 백엔드를 올려 보며 알게 된 점입니다.

- 15분 동안 요청이 없으면 서버가 잠들고, 첫 접속은 깨어나는 데 시간이 걸린다. 포트폴리오에는 안내 문구를 넣어 두면 좋다.
- 메모리가 512MB 라서 JVM 힙을 제한하지 않으면 메모리 부족으로 재시작된다. -Xmx 를 지정했다.
- 환경변수를 바꾸면 서버가 재시작된다.
- 로그를 보는 습관이 중요하다. 로컬에서 안 나던 오류가 배포 환경에서 처음 보인다.

그래도 비용 없이 실제 주소로 공개할 수 있다는 점은 정말 큰 장점입니다.', 'SKILL', 195, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '40944 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's16', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s16'), 'DEVOPS');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('GitHub Actions로 배포 자동화 처음 해본 후기', 'main 브랜치에 푸시하면 자동으로 빌드하고 배포되게 만들어 봤습니다.

처음 막힌 부분
- 비밀값(토큰, 키)을 워크플로 파일에 직접 쓸 뻔했다. 저장소 Secrets 에 넣고 ${{ secrets.NAME }} 으로 읽어야 한다.
- 경로 필터(paths)를 안 걸었더니 다른 프로젝트를 수정해도 배포가 돌았다.
- 캐시 설정으로 의존성 설치 시간을 절반으로 줄였다.

자동화를 만들고 나니 배포가 ''일''이 아니라 ''푸시 한 번''이 돼서 작은 수정도 부담 없이 올리게 됐습니다.', 'SKILL', 121, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '22603 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 's17', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s17'), 'DEVOPS');
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s17'), 'DOCKER');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('ChatGPT에게 코드 리뷰를 시킬 때 쓰는 프롬프트 템플릿', '그냥 ''이 코드 리뷰해줘''라고 하면 뻔한 답이 옵니다. 제가 쓰는 틀을 공유합니다.

[역할] 당신은 10년 차 백엔드 개발자입니다.
[목적] 아래 코드를 리뷰해 주세요. 우선순위는 1) 버그 2) 보안 3) 성능 4) 가독성입니다.
[형식] 문제 / 이유 / 수정 제안(코드) 순서로 항목별로 알려 주세요.
[제약] 확실하지 않은 내용은 추측이라고 표시해 주세요.
[코드] (여기에 붙여넣기)

효과가 컸던 건 ''확실하지 않으면 표시해 달라''는 제약이었습니다. 자신 있게 틀린 답이 줄었어요.', 'AI', 287, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '86682 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 'a01', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a01'), 'CHATGPT');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('ChatGPT가 틀린 답을 자신 있게 말할 때 검증하는 방법', '존재하지 않는 함수나 옵션을 만들어 내는 경우를 몇 번 겪었습니다. 그래서 이렇게 검증합니다.

1) 공식 문서에서 해당 함수·옵션이 실제로 있는지 검색한다.
2) 작은 예제로 직접 실행해 본다.
3) 같은 질문을 다른 표현으로 한 번 더 물어 답이 일관적인지 본다.
4) 버전을 명시해서 묻는다. 라이브러리 버전에 따라 답이 달라진다.

AI의 답은 ''초안''이고 최종 책임은 내가 진다고 생각하면 마음이 편합니다.', 'AI', 198, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '71221 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 'a02', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a02'), 'CHATGPT');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('Gemini로 긴 코드베이스를 한 번에 요약해 본 후기', '처음 보는 오픈소스 저장소를 이해해야 해서 파일 여러 개를 한 번에 붙여 넣고 구조 설명을 부탁해 봤습니다.

좋았던 점
- 긴 입력도 한 번에 읽어서 폴더별 역할을 정리해 줬다.
- ''요청이 들어와서 DB까지 가는 흐름을 순서대로 설명해 줘''가 특히 유용했다.

아쉬웠던 점
- 파일이 너무 많으면 뒤쪽 내용을 놓치기도 했다. 핵심 파일 위주로 나눠서 묻는 편이 정확했다.
- 요약을 믿기 전에 실제 코드를 열어 확인해야 했다.', 'AI', 164, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '54320 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 'a03', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a03'), 'GEMINI');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('Gemini API 503 오류, 재시도로 줄여 본 경험', '제 프로젝트에서 AI 코드 리뷰를 붙였더니 간헐적으로 ''서버가 바쁘다(503)'' 오류가 났습니다.

정리한 내용
- 503은 호출하는 쪽 문제가 아니라 모델 서버가 일시적으로 붐빌 때 나온다.
- 같은 요청을 잠깐 뒤에 다시 보내면 성공하는 경우가 많아서 재시도를 넣었다. 대기 시간을 점점 늘리는 방식(backoff)을 썼다.
- 응답을 기다리다가 타임아웃이 나는 경우도 재시도 대상에 넣었다. 단, 전체 대기 시간 상한은 따로 둬야 한다.
- 모델 이름을 ''latest'' 별칭 대신 고정 이름으로 쓰고, 한 모델이 계속 붐비면 더 가벼운 모델로 바꿔 보는 것도 방법이었다.

재시도는 만능이 아니어서, 끝까지 실패했을 때 사용자에게 보여 줄 메시지도 구분해 두었습니다.', 'AI', 233, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '20479 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 'a04', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a04'), 'GEMINI');
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a04'), 'LLM');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('Claude로 리팩터링할 때 한 번에 너무 많이 맡기지 않는 이유', '파일 여러 개를 한꺼번에 바꿔 달라고 했다가 어디가 바뀌었는지 추적이 안 돼서 곤란했던 적이 있습니다.

지금은 이렇게 합니다.
1) 먼저 ''무엇을 어떻게 바꿀지 계획만'' 설명해 달라고 한다.
2) 계획이 마음에 들면 작은 단위(클래스 하나, 메서드 하나)로 나눠서 요청한다.
3) 바뀔 때마다 테스트를 돌리고 git diff 로 변경 내용을 직접 읽는다.
4) 마음에 안 들면 해당 단위만 되돌린다.

작게 나눌수록 결과를 이해하고 책임질 수 있었습니다.', 'AI', 209, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '45338 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 'a05', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a05'), 'CLAUDE');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('AI가 만든 코드, 머지 전에 내가 확인하는 체크리스트', 'AI 도구 덕분에 코드 작성은 빨라졌지만, 검토하는 사람의 역할은 오히려 중요해졌습니다.

1) 요구한 것만 바꿨는가? (관련 없는 파일을 건드리지 않았는가)
2) 에러 처리와 경계 값(null, 빈 목록, 아주 큰 값)을 처리하는가
3) 보안: 입력 검증, 비밀 값 하드코딩, 권한 검사가 빠지지 않았는가
4) 존재하지 않는 API나 라이브러리를 쓰지 않았는가 (컴파일은 되어도 런타임에서 깨질 수 있다)
5) 테스트가 실제로 동작을 검증하는가, 아니면 통과만 하도록 쓰여 있는가

마지막 항목이 의외로 자주 걸립니다. 테스트가 초록색이라고 안심하지 마세요.', 'AI', 371, (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '35637 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 'a06', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a06'), 'CLAUDE');
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a06'), 'LLM');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('LLM 토큰과 컨텍스트 윈도우를 처음 이해한 방법', '토큰이 글자 수와 같은 줄 알았는데 아니었습니다.

- 토큰은 모델이 텍스트를 쪼개는 단위로, 한국어는 같은 길이의 영어보다 토큰이 더 많이 드는 경향이 있다.
- 컨텍스트 윈도우는 한 번에 볼 수 있는 입력 + 출력의 최대 길이다. 넘으면 앞부분이 잘리거나 오류가 난다.
- 비용과 속도는 토큰 수에 비례하는 경우가 많아서, 불필요한 설명이나 중복 코드를 줄이면 이득이다.

그래서 긴 대화는 중간에 요약하고 새로 시작하는 편이 답이 더 좋았습니다.', 'AI', 186, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '76676 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 'a07', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a07'), 'LLM');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('프롬프트에 예시를 넣으면 답이 달라지는 이유(Few-shot)', '원하는 출력 형식이 있을 때는 설명보다 예시 한두 개가 훨씬 잘 통했습니다.

설명만 한 경우: ''리뷰 결과를 JSON으로 줘'' → 키 이름이 매번 달랐다.
예시를 준 경우: 입력 1개와 기대하는 JSON 1개를 함께 보여 줌 → 형식이 안정적이었다.

팁
- 예시는 실제로 쓸 입력과 비슷하게 만든다.
- 예외 상황(값이 없을 때)의 예시도 하나 넣는다.
- 그래도 서버에서는 반드시 응답을 검증한다. 모델이 형식을 어길 수 있다.', 'AI', 144, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '29535 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 'a08', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a08'), 'LLM');
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a08'), 'CHATGPT');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('VS Code에서 AI 확장을 쓸 때 설정해 두면 좋은 것', 'AI 확장을 설치하고 바로 쓰다가 불편했던 점을 설정으로 해결했습니다.

- 자동 완성 제안이 너무 자주 뜨면 집중이 깨지므로 필요할 때만 단축키로 부르도록 바꿨다.
- 작업 폴더에서 .env, 키 파일, 개인 정보가 들어 있는 폴더는 AI가 읽지 않도록 제외한다.
- 저장 시 자동 포맷(Prettier, Spotless 등)을 켜 둔다. AI가 만든 코드의 들여쓰기가 제각각이어도 정리된다.
- 변경 사항은 항상 Source Control 탭에서 diff 로 확인한다.

편의 기능이지만 비밀 파일을 읽히지 않는 설정만큼은 꼭 확인하세요.', 'AI', 152, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '61594 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 'a09', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a09'), 'VSCODE');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('VS Code 디버거로 Spring Boot 브레이크포인트 걸기', '로그 찍기 대신 디버거를 쓰면 문제를 훨씬 빨리 찾습니다.

1) Java 확장 팩을 설치한다.
2) 메인 클래스 옆의 Debug 를 눌러 실행한다.
3) 의심되는 줄 번호 왼쪽을 클릭해 중단점을 건다.
4) 요청을 보내면 그 줄에서 멈추고 변수 값을 하나씩 볼 수 있다.
5) 조건부 중단점을 쓰면 특정 사용자 요청일 때만 멈춘다.

AI에게 에러 로그를 붙여 물어보는 것도 좋지만, 값을 직접 눈으로 확인하는 경험이 쌓이면 AI의 답이 맞는지 판단하기도 쉬워집니다.', 'AI', 118, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '43593 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 'a10', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a10'), 'VSCODE');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('Cursor로 프론트엔드 작업할 때 규칙 파일 쓰는 법', '에디터형 AI 도구는 프로젝트의 규칙을 알려 줄수록 결과가 좋아집니다. 규칙 파일에 저는 이런 내용을 적습니다.

- 사용하는 기술 스택과 버전 (React, TypeScript, Tailwind)
- 폴더 구조와 파일 이름 규칙
- 지켜야 할 코딩 스타일 (함수형 컴포넌트, 타입 any 금지)
- 하지 말아야 할 일 (새 라이브러리를 임의로 추가하지 않기)

규칙을 적어 두니 같은 설명을 매번 반복하지 않아도 되고, 팀원 모두가 비슷한 결과를 얻습니다. 다만 규칙이 길어지면 오히려 무시되기도 해서 핵심만 짧게 유지하세요.', 'AI', 173, (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '28132 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 'a11', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a11'), 'CURSOR');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('Cursor와 다른 AI 코딩 도구를 고르는 제 기준', '도구마다 장단점이 있어서 ''무엇이 최고''라고 말하긴 어렵습니다. 대신 제가 비교하는 기준을 적어 봅니다.

1) 프로젝트 전체 맥락을 얼마나 잘 읽는가
2) 변경 사항을 diff 로 보여 주고 일부만 선택해서 적용할 수 있는가
3) 내 코드가 외부로 전송되는 범위를 설정할 수 있는가 (회사 코드라면 특히 중요)
4) 비용과 사용량 한도

처음에는 무료로 써 보고, 내 작업 방식에 맞는지 일주일 정도 비교해 보시길 권합니다.', 'AI', 129, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '16991 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 'a12', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a12'), 'CURSOR');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('Antigravity로 에이전트에게 작업을 나눠 맡겨 본 첫인상', '에이전트가 계획을 세우고 파일을 직접 수정하는 방식은 처음이라 신기했습니다.

해 본 일
- 작은 버그를 설명하고 원인 분석과 수정을 맡겨 봤다.
- 계획 문서를 먼저 작성하게 한 뒤 승인하고 진행하게 했다.

느낀 점
- 작업 범위를 명확히 정해 주지 않으면 관련 없는 파일까지 손대려 한다.
- 결과를 검증하는 일(테스트 실행, diff 확인)은 결국 사람의 몫이다.
- 한 번에 큰일을 맡기기보다, 확인 가능한 크기로 쪼개는 편이 안전했다.', 'AI', 97, (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '11950 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 'a13', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a13'), 'ANTIGRAVITY');
WITH ins AS (
  INSERT INTO boards (title, content, type, view_count, user_id, created_at)
  VALUES ('에이전트에게 맡길 일과 직접 할 일을 나누는 기준', 'AI 에이전트를 팀에서 쓰기 시작하면 ''어디까지 맡길까''가 가장 큰 질문입니다.

맡기기 좋은 일
- 반복적이고 패턴이 분명한 수정 (이름 바꾸기, 테스트 보일러플레이트)
- 코드 탐색과 요약, 변경 영향 범위 조사
- 문서 초안과 주석 정리

직접 해야 하는 일
- 아키텍처 결정과 트레이드오프 판단
- 보안·결제·권한처럼 실수의 비용이 큰 부분의 최종 검토
- 요구사항이 모호한 부분의 의사결정

원칙 하나: 결과를 검증할 방법(테스트, 실행)이 없는 일은 맡기지 않습니다.', 'AI', 142, (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '8009 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'b', 'a14', id FROM ins;
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a14'), 'ANTIGRAVITY');
INSERT INTO board_tags (board_id, tag) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a14'), 'LLM');

-- 6. 댓글

INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('저도 컨트롤러마다 try-catch 가 있었는데 오늘 바로 ControllerAdvice로 옮겼어요. 코드가 확 줄었습니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (SELECT id FROM _k WHERE kind='b' AND key='s05'), (now() - interval '101126 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('에러 코드를 enum으로 관리하니까 프론트에서 분기하기도 편하더라고요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (SELECT id FROM _k WHERE kind='b' AND key='s05'), (now() - interval '100433 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('4번 정말 중요합니다. 운영에서 SQL 오류 메시지가 그대로 노출된 사례를 본 적이 있어요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (SELECT id FROM _k WHERE kind='b' AND key='s05'), (now() - interval '99572 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('린트 경고 끄고 지냈는데 오늘부터 바로 켰어요. 객체를 의존성에 넣으면 무한 렌더링 나던 이유가 이거였네요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (SELECT id FROM _k WHERE kind='b' AND key='s01'), (now() - interval '89190 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('정리 감사합니다! useCallback 쓰는 기준도 궁금해요. 자식에게 넘기는 함수에만 쓰면 될까요?', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (SELECT id FROM _k WHERE kind='b' AND key='s01'), (now() - interval '88378 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('@태호풀스택 네, 자식이 React.memo로 감싸져 있거나 다른 이펙트의 의존성에 들어갈 때만 쓰면 충분합니다. 무조건 감싸지는 마세요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (SELECT id FROM _k WHERE kind='b' AND key='s01'), (now() - interval '87272 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('''확실하지 않으면 표시해 달라''는 제약 바로 써 봤는데 효과 있었어요!', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (SELECT id FROM _k WHERE kind='b' AND key='a01'), (now() - interval '86532 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('형식을 고정하는 점이 좋습니다. 실무에서도 체크리스트 형태로 받으면 검토가 쉬워요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (SELECT id FROM _k WHERE kind='b' AND key='a01'), (now() - interval '85790 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('원인과 해결을 SQL 로그로 확인하신 점이 좋습니다. 한 가지 주의: 컬렉션을 join fetch 하면서 페이징하면 메모리에서 잘리니 batch size 쪽이 안전합니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (SELECT id FROM _k WHERE kind='b' AND key='s06'), (now() - interval '84225 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('쿼리가 11개에서 2개로 줄었다니 체감이 크네요. 저도 로그부터 켜 보겠습니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (SELECT id FROM _k WHERE kind='b' AND key='s06'), (now() - interval '83497 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('@서준시니어 맞아요, 컬렉션에서 경고 로그가 뜨는 걸 봤습니다. 말씀하신 대로 batch size로 바꿨어요!', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (SELECT id FROM _k WHERE kind='b' AND key='s06'), (now() - interval '82531 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('이해하신 방향이 정확해요. 한 가지 더, 제네릭에 extends 로 제약을 걸면 더 안전한 타입을 만들 수 있습니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (SELECT id FROM _k WHERE kind='b' AND key='s02'), (now() - interval '79489 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('저도 any로 때우던 사람이라 공감돼요. 예시 코드가 바로 이해됩니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (SELECT id FROM _k WHERE kind='b' AND key='s02'), (now() - interval '78796 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('한국어가 토큰을 더 많이 쓴다는 건 몰랐어요. 프롬프트를 간결하게 쓰는 이유가 생겼네요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (SELECT id FROM _k WHERE kind='b' AND key='a07'), (now() - interval '76526 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('API 명세를 먼저 정한 접근이 좋았습니다. 다음 프로젝트에선 테스트를 하나씩 먼저 써 보세요. 습관이 되면 큰 도움이 됩니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (SELECT id FROM _k WHERE kind='b' AND key='s09'), (now() - interval '75622 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('회고 글 감사합니다. 한 달 안에 로그인까지 완성하신 게 대단해요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (SELECT id FROM _k WHERE kind='b' AND key='s09'), (now() - interval '74943 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('버전을 명시해서 묻는 건 정말 중요하죠. 라이브러리가 바뀌면서 예전 답이 틀리는 경우가 많아요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (SELECT id FROM _k WHERE kind='b' AND key='a02'), (now() - interval '71071 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('작은 예제로 직접 실행해 본다는 게 제일 확실한 방법 같아요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (SELECT id FROM _k WHERE kind='b' AND key='a02'), (now() - interval '70413 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('min-w-0 처음 알았어요! flex 안에서 텍스트가 안 줄어들던 게 이것 때문이었군요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (SELECT id FROM _k WHERE kind='b' AND key='s03'), (now() - interval '68348 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('추가로 이미지는 max-w-full h-auto 를 기본으로 두면 대부분 해결됩니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (SELECT id FROM _k WHERE kind='b' AND key='s03'), (now() - interval '67599 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('정확하게 정리하셨네요. 부분 일치 검색이 필요하면 pg_trgm 확장과 GIN 인덱스를 검토해 보세요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (SELECT id FROM _k WHERE kind='b' AND key='s12'), (now() - interval '64139 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('함수를 씌우면 인덱스를 못 탄다는 건 오늘 처음 알았어요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (SELECT id FROM _k WHERE kind='b' AND key='s12'), (now() - interval '63495 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('비밀 파일 제외 설정은 정말 중요한 팁이네요. 바로 확인해 봤어요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (SELECT id FROM _k WHERE kind='b' AND key='a09'), (now() - interval '61444 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('맞습니다. AI 도구를 쓸 때 어떤 파일이 외부로 전송되는지 먼저 확인하는 습관을 들이세요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (SELECT id FROM _k WHERE kind='b' AND key='a09'), (now() - interval '60667 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('5번 항목은 생각을 못 했어요. 탈퇴한 사용자의 토큰이 만료 전까지 유효한 문제가 있겠네요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (SELECT id FROM _k WHERE kind='b' AND key='s07'), (now() - interval '59024 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('4번에서 프록시 뒤 IP 얘기가 인상적입니다. 저도 확인해 봐야겠어요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (SELECT id FROM _k WHERE kind='b' AND key='s07'), (now() - interval '58331 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('.dockerignore 로 .env 를 막는다는 부분이 특히 중요하네요. 이미지에 키가 들어갈 뻔했어요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (SELECT id FROM _k WHERE kind='b' AND key='s15'), (now() - interval '56255 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('추가 팁: 실행 시 메모리 제한 옵션(-Xmx)도 같이 두면 작은 서버에서 안정적입니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (SELECT id FROM _k WHERE kind='b' AND key='s15'), (now() - interval '55492 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('핵심 파일 위주로 나눠서 묻는 게 정확하다는 점 공감합니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (SELECT id FROM _k WHERE kind='b' AND key='a03'), (now() - interval '54170 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('저도 처음 보는 저장소에서 흐름을 물어보는 용도로 자주 씁니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (SELECT id FROM _k WHERE kind='b' AND key='a03'), (now() - interval '53505 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('rows 추정치와 실제가 다르면 통계 문제라는 점이 유용했어요. ANALYZE를 돌려 보겠습니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (SELECT id FROM _k WHERE kind='b' AND key='s13'), (now() - interval '51898 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('UPDATE에 쓸 때 롤백하라는 팁 감사합니다. 실수할 뻔했네요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (SELECT id FROM _k WHERE kind='b' AND key='s13'), (now() - interval '51226 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('측정부터 하라는 말씀이 와닿아요. 저는 memo부터 붙였다가 변화가 없어서 포기했었어요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (SELECT id FROM _k WHERE kind='b' AND key='s04'), (now() - interval '47467 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('가상 스크롤은 어느 정도 개수부터 고려하나요?', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (SELECT id FROM _k WHERE kind='b' AND key='s04'), (now() - interval '46872 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('계획만 먼저 설명하게 하는 방식 좋습니다. 변경을 이해하지 못한 채 머지하는 게 가장 위험해요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (SELECT id FROM _k WHERE kind='b' AND key='a05'), (now() - interval '45188 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('작은 단위로 나누고 매번 테스트를 돌린다는 점 그대로 따라 해 볼게요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (SELECT id FROM _k WHERE kind='b' AND key='a05'), (now() - interval '44495 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('조건부 중단점은 처음 알았어요. 특정 사용자 요청만 잡을 수 있다니 편하네요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (SELECT id FROM _k WHERE kind='b' AND key='a10'), (now() - interval '43443 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('로그 대신 디버거로 바꾸니 문제 찾는 시간이 확실히 줄었어요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (SELECT id FROM _k WHERE kind='b' AND key='a10'), (now() - interval '42785 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('슬립 안내 문구는 저도 넣어 두었어요. 면접관이 처음 접속했을 때 당황하지 않게요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (SELECT id FROM _k WHERE kind='b' AND key='s16'), (now() - interval '40794 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('무료 서버에서 -Xmx 지정이 필요한 줄은 몰랐어요. 메모리 부족으로 재시작되던 이유가 이거였네요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (SELECT id FROM _k WHERE kind='b' AND key='s16'), (now() - interval '39989 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('내부 호출이 안 먹는 건 저도 당했어요. 별도 빈으로 분리해서 해결했습니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (SELECT id FROM _k WHERE kind='b' AND key='s08'), (now() - interval '37803 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('정확합니다. 분리가 어렵다면 구조를 다시 보는 게 좋습니다. 하나의 메서드가 너무 많은 일을 하고 있다는 신호일 수 있어요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (SELECT id FROM _k WHERE kind='b' AND key='s08'), (now() - interval '36900 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('5번 항목 충격이에요. 통과만 하는 테스트는 생각을 못 했습니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (SELECT id FROM _k WHERE kind='b' AND key='a06'), (now() - interval '35487 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('체크리스트를 팀 규칙으로 만들어도 좋겠네요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (SELECT id FROM _k WHERE kind='b' AND key='a06'), (now() - interval '34899 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('저장해 두고 PR 올리기 전에 매번 확인하겠습니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (SELECT id FROM _k WHERE kind='b' AND key='a06'), (now() - interval '34255 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('끝 슬래시 때문에 막혔던 적이 있어요. 글자 하나까지 같아야 한다는 말이 정확합니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (SELECT id FROM _k WHERE kind='b' AND key='s10'), (now() - interval '30261 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('Vite 프록시는 개발 중에 정말 편한데, 운영에서는 결국 허용 목록을 제대로 설정해야 하더라고요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (SELECT id FROM _k WHERE kind='b' AND key='s10'), (now() - interval '29456 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('예시를 주면 형식이 안정되는 거 저도 확인했어요. 그리고 마지막 줄처럼 서버 검증은 꼭 필요하더라고요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (SELECT id FROM _k WHERE kind='b' AND key='a08'), (now() - interval '29385 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('예외 상황 예시를 넣으라는 팁이 실용적입니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (SELECT id FROM _k WHERE kind='b' AND key='a08'), (now() - interval '28790 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('규칙은 짧게 유지하라는 말씀 기억하겠습니다. 저는 너무 길게 써서 무시되고 있었나 봐요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (SELECT id FROM _k WHERE kind='b' AND key='a11'), (now() - interval '27982 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('새 라이브러리를 임의로 추가하지 않기 규칙 좋네요!', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (SELECT id FROM _k WHERE kind='b' AND key='a11'), (now() - interval '27366 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('방향이 맞습니다. 먼저 정규화하고, 측정으로 병목이 확인된 곳만 비정규화하세요. 비정규화하면 데이터가 어긋나지 않게 갱신 규칙을 정해 두는 것도 중요합니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (SELECT id FROM _k WHERE kind='b' AND key='s14'), (now() - interval '26357 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('저도 같은 고민이었는데 답변이 도움이 됐어요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (SELECT id FROM _k WHERE kind='b' AND key='s14'), (now() - interval '25762 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('paths 필터 설정은 모노레포에서 꼭 필요하죠. 잘 정리하셨습니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (SELECT id FROM _k WHERE kind='b' AND key='s17'), (now() - interval '22453 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('Secrets 쓰는 방법 덕분에 저도 키를 안전하게 옮겼어요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (SELECT id FROM _k WHERE kind='b' AND key='s17'), (now() - interval '21795 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('재시도에 전체 상한 시간을 따로 둔 점이 좋습니다. 상한이 없으면 사용자는 끝없이 기다리게 되거든요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (SELECT id FROM _k WHERE kind='b' AND key='a04'), (now() - interval '20329 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('실패했을 때 메시지를 구분해 둔 것도 센스 있네요. 사용자가 다음 행동을 정할 수 있으니까요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (SELECT id FROM _k WHERE kind='b' AND key='a04'), (now() - interval '19545 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('@서준시니어 감사합니다! 상한은 90초로 두고 시도당 25초로 나눴어요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (SELECT id FROM _k WHERE kind='b' AND key='a04'), (now() - interval '18929 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('동시 요청 질문을 받으면 뭐라고 답해야 할지 막막했는데, 방향을 알겠어요. 감사합니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (SELECT id FROM _k WHERE kind='b' AND key='s11'), (now() - interval '17680 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('트러블슈팅 기록이 곧 답변이 된다는 말씀 메모했습니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (SELECT id FROM _k WHERE kind='b' AND key='s11'), (now() - interval '17050 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('코드가 외부로 전송되는 범위 확인은 회사 프로젝트에서 필수겠네요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (SELECT id FROM _k WHERE kind='b' AND key='a12'), (now() - interval '16841 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('일주일 정도 비교해 보라는 조언 감사합니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (SELECT id FROM _k WHERE kind='b' AND key='a12'), (now() - interval '16253 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('README에 ''문제 → 원인 → 해결'' 형식으로 적고 있는데 이 방식이 맞는 거였군요!', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (SELECT id FROM _k WHERE kind='b' AND key='s11'), (now() - interval '16154 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('Session pooler 주소를 따로 쓰는 건 몰랐어요. 연결 에러가 났던 이유일 수 있겠네요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (SELECT id FROM _k WHERE kind='b' AND key='s18'), (now() - interval '13776 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('AI 호출을 트랜잭션 밖으로 빼라는 부분은 제 프로젝트에도 해당돼서 수정했어요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (SELECT id FROM _k WHERE kind='b' AND key='s18'), (now() - interval '13048 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('범위를 명확히 정해 주지 않으면 관련 없는 파일까지 손댄다는 점, 정말 공감합니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (SELECT id FROM _k WHERE kind='b' AND key='a13'), (now() - interval '11800 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('계획 문서를 먼저 승인하는 흐름이 안전해 보여요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (SELECT id FROM _k WHERE kind='b' AND key='a13'), (now() - interval '11191 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('검증할 방법이 없는 일은 맡기지 않는다는 원칙 메모했습니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (SELECT id FROM _k WHERE kind='b' AND key='a14'), (now() - interval '7859 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('보안·결제는 직접 한다는 기준에 공감해요.', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (SELECT id FROM _k WHERE kind='b' AND key='a14'), (now() - interval '7278 minutes'));
INSERT INTO comments (content, user_id, board_id, created_at) VALUES ('좋은 기준입니다. 되돌릴 수 없는 작업일수록 사람이 마지막에 확인해야 합니다.', (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (SELECT id FROM _k WHERE kind='b' AND key='a14'), (now() - interval '6417 minutes'));

-- 7. 좋아요와 북마크

INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '89147 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '87856 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '88800 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '88008 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '88871 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '88646 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '87654 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '87761 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '87921 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '87022 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s02'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '79014 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s02'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '78044 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s02'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '78190 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s02'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '78896 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s02'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '77701 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s02'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '79513 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s03'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '68134 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s03'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '66159 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s03'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '66418 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s03'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '67195 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '45377 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '47136 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '45967 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '46113 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '45656 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '45189 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '45778 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '46573 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '47489 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '47176 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '100811 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '100263 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '100522 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '99962 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '99774 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '100372 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '99889 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '100160 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '99247 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '100279 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '98702 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '100001 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '82366 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '84008 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '83016 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '81938 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '83230 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '84214 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '82964 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '83741 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '57906 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '57396 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '58593 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '56931 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '58534 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '57120 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '57643 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '58620 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '59037 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s08'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '36719 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s08'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '37297 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s08'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '36470 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s09'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '73908 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s09'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '74760 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s10'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '30099 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s10'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '30123 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s10'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '29859 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s10'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '28354 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s10'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '28545 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s10'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '28243 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s10'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '29856 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s10'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '28691 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '17061 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '16191 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '17454 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '15476 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '15533 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '17272 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '17112 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '17413 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '17548 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '17566 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '16787 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '14910 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '16217 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s12'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '63739 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s12'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '63799 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s12'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '63454 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s12'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '62970 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s12'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '62541 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s12'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '62852 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '50826 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '49387 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '49994 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '50861 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '51042 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '51186 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '51053 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '49902 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '51081 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '49172 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '49794 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s14'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '26294 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s14'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '24274 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s14'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '24811 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s14'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '26204 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s14'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '25162 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s18'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '13387 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s18'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '11984 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s18'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '11658 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s15'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '54461 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s15'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '55361 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s15'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '55198 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s15'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '55870 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s15'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '53806 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s15'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '54115 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s15'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '55747 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s15'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '54993 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s15'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '54841 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s16'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '40375 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s16'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '39996 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s16'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '40135 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s16'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '38676 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s16'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '38622 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s16'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '38644 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s16'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '39296 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s16'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '38660 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s17'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '21879 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s17'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '20777 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s17'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '21478 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='s17'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '22175 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '84250 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '85525 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '85011 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '84592 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '84282 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '86384 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '85232 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '86018 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '84722 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '86557 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a02'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '70664 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a02'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '70946 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a02'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '70971 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a02'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '70887 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a02'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '70409 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a02'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '69254 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a02'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '68969 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a03'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '52468 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a03'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '52457 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a03'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '53169 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a03'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '51781 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a03'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '53542 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a03'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '53796 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a03'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '52311 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a03'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '52077 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a03'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '53678 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a03'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '54066 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '19726 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '19603 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '18893 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '20084 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '18249 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '19640 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '20137 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '44709 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '44140 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '43224 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '42992 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '44546 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '35182 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '35279 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '33589 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '32968 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '33971 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '35283 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '33935 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '34499 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '34949 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '34639 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '34238 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '76154 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '74565 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '74422 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '76116 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '74742 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '74905 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '75676 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '75044 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '76466 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a08'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '27176 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a08'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '27383 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a08'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '28898 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a08'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '28401 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a08'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '27503 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a08'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '29069 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a09'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '59528 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a09'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '60004 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a09'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '59423 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a09'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '61470 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a09'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '59620 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a09'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '60558 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a09'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '60568 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a10'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '41280 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a10'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '41407 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a10'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '42374 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a10'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '43386 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a10'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '42054 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a10'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '43133 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a10'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '41436 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a10'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '43168 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '25987 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '27057 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '27130 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '27650 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '27776 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '27317 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '27860 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '25806 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a11'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '26644 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a12'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '16244 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a12'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '14332 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a12'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '16126 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a12'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '16194 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a12'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '15236 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a12'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '14901 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '10719 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '10970 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '10363 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '10838 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (now() - interval '9920 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '10737 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '10494 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '9700 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (now() - interval '11166 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a13'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '9901 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a14'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '6512 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a14'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '7060 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a14'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '7354 minutes'));
INSERT INTO board_bookmarks (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a14'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_minseo'), (now() - interval '7482 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a14'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (now() - interval '6099 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a14'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), (now() - interval '5980 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a14'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (now() - interval '6735 minutes'));
INSERT INTO board_likes (board_id, user_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='b' AND key='a14'), (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_dongmin'), (now() - interval '6608 minutes'));

-- 8. 시니어 리뷰: 요청 → 지원 → 매칭 → 답변 → 평점

WITH ins AS (
  INSERT INTO senior_review_requests (title, content, code_content, language, credits, status, junior_id, senior_id, created_at, updated_at)
  VALUES ('Spring Boot 컨트롤러 예외 처리 구조 리뷰 부탁드립니다', '컨트롤러마다 try-catch를 쓰고 있는데 응답 형식이 제각각입니다. 예외 처리를 한 곳에 모으려면 어떤 구조가 좋을지, 그리고 아래 코드에서 위험한 부분이 있는지 알려 주세요.', '@RestController
@RequiredArgsConstructor
public class OrderController {

  private final OrderService orderService;

  @PostMapping("/orders")
  public ResponseEntity<?> create(@RequestBody OrderRequest request) {
    try {
      return ResponseEntity.ok(orderService.create(request));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.status(500).body("서버 오류: " + e.getMessage());
    }
  }
}', 'java', 300, 'PENDING', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), NULL, (now() - interval '4820 minutes'), (now() - interval '4820 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'r', 'r01', id FROM ins;
INSERT INTO senior_review_request_tags (request_id, tag) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r01'), 'BACKEND');
INSERT INTO senior_review_request_tags (request_id, tag) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r01'), 'SPRING');
INSERT INTO senior_review_applications (request_id, senior_id, message, created_at) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), '예외 처리와 응답 형식 설계 경험이 많습니다. 에러 코드 체계까지 같이 봐 드리겠습니다.', (now() - interval '4580 minutes'));
INSERT INTO senior_review_applications (request_id, senior_id, message, created_at) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r01'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), 'DB 오류가 사용자에게 노출되지 않는지 중점적으로 확인해 드릴 수 있습니다.', (now() - interval '4340 minutes'));
WITH ins AS (
  INSERT INTO senior_review_requests (title, content, code_content, language, credits, status, junior_id, senior_id, created_at, updated_at)
  VALUES ('React 상태 관리 리팩터링(Context → Zustand) 방향이 맞는지 봐주세요', 'Provider 값이 바뀔 때마다 하위 컴포넌트가 전부 다시 렌더링됩니다. Zustand로 옮기면 해결될까요? 옮길 때 store를 어떻게 나누는 게 좋은지 궁금합니다.', 'const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('''');
  const [theme, setTheme] = useState(''light'');

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, theme, setTheme }}>
      {children}
    </AuthContext.Provider>
  );
}', 'typescript', 200, 'PENDING', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), NULL, (now() - interval '3380 minutes'), (now() - interval '3380 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'r', 'r02', id FROM ins;
INSERT INTO senior_review_request_tags (request_id, tag) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r02'), 'FRONTEND');
INSERT INTO senior_review_request_tags (request_id, tag) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r02'), 'REACT');
INSERT INTO senior_review_applications (request_id, senior_id, message, created_at) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r02'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), 'Context의 리렌더링 문제와 Zustand 전환 기준을 구체적으로 짚어 드리겠습니다.', (now() - interval '3140 minutes'));
WITH ins AS (
  INSERT INTO senior_review_requests (title, content, code_content, language, credits, status, junior_id, senior_id, created_at, updated_at)
  VALUES ('JPA N+1 해결 방법이 맞는지 확인해 주세요', 'join fetch와 페이징을 같이 썼더니 경고 로그가 나옵니다. 이대로 써도 되는지, 더 안전한 방법이 있는지 봐 주세요.', '@Query("select b from Board b join fetch b.author join fetch b.tags where b.type = :type")
Page<Board> findByType(@Param("type") BoardType type, Pageable pageable);', 'java', 400, 'PENDING', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), NULL, (now() - interval '1940 minutes'), (now() - interval '1940 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'r', 'r03', id FROM ins;
INSERT INTO senior_review_request_tags (request_id, tag) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r03'), 'JPA');
INSERT INTO senior_review_request_tags (request_id, tag) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r03'), 'DB');
WITH ins AS (
  INSERT INTO senior_review_requests (title, content, code_content, language, credits, status, junior_id, senior_id, created_at, updated_at)
  VALUES ('PostgreSQL 인덱스 설계 리뷰', '게시판 종류별 최신순 조회와 작성자별 조회가 가장 많습니다. 인덱스를 어떻게 걸어야 할지, 불필요한 인덱스는 없는지 알려 주세요.', 'CREATE TABLE boards (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  user_id BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- 자주 쓰는 조회
SELECT * FROM boards WHERE type = ''SKILL'' ORDER BY created_at DESC LIMIT 10;
SELECT * FROM boards WHERE user_id = 42 ORDER BY created_at DESC;', 'sql', 500, 'MATCHED', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '16340 minutes'), (now() - interval '14840 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'r', 'r04', id FROM ins;
INSERT INTO senior_review_request_tags (request_id, tag) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r04'), 'DB');
INSERT INTO senior_review_request_tags (request_id, tag) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r04'), 'POSTGRESQL');
INSERT INTO senior_review_applications (request_id, senior_id, message, created_at) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), '실행 계획을 같이 보면서 인덱스 후보를 정리해 드리겠습니다.', (now() - interval '16100 minutes'));
INSERT INTO senior_review_applications (request_id, senior_id, message, created_at) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r04'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), '쿼리 패턴 기준으로 복합 인덱스 순서를 검토해 드릴 수 있습니다.', (now() - interval '15860 minutes'));
WITH ins AS (
  INSERT INTO senior_review_requests (title, content, code_content, language, credits, status, junior_id, senior_id, created_at, updated_at)
  VALUES ('Docker 멀티스테이지 빌드 Dockerfile 리뷰', '이미지가 800MB가 넘습니다. 멀티스테이지로 바꾸는 방법과 빠뜨린 보안 설정이 있는지 알려 주세요.', 'FROM maven:3.9.6-eclipse-temurin-21
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests
EXPOSE 8080
CMD ["java", "-jar", "target/app.jar"]', 'dockerfile', 250, 'MATCHED', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '9140 minutes'), (now() - interval '7640 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'r', 'r05', id FROM ins;
INSERT INTO senior_review_request_tags (request_id, tag) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r05'), 'DEVOPS');
INSERT INTO senior_review_request_tags (request_id, tag) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r05'), 'DOCKER');
INSERT INTO senior_review_applications (request_id, senior_id, message, created_at) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r05'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), '이미지 용량과 보안(.env, 권한) 관점에서 같이 봐 드리겠습니다.', (now() - interval '8900 minutes'));
WITH ins AS (
  INSERT INTO senior_review_requests (title, content, code_content, language, credits, status, junior_id, senior_id, created_at, updated_at)
  VALUES ('JWT 로그인 필터 구현 검토', '로그인 후 토큰으로 인증하는 필터를 만들었는데 보안상 문제가 있을지 걱정됩니다. 개선점을 알려 주세요.', 'public class JwtFilter extends OncePerRequestFilter {
  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    String token = req.getHeader("Authorization").substring(7);
    Claims claims = Jwts.parser().setSigningKey("secret1234").parseClaimsJws(token).getBody();
    SecurityContextHolder.getContext().setAuthentication(
        new UsernamePasswordAuthenticationToken(claims.getSubject(), null, List.of()));
    chain.doFilter(req, res);
  }
}', 'java', 300, 'COMPLETED', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), (now() - interval '58100 minutes'), (now() - interval '53780 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'r', 'r06', id FROM ins;
INSERT INTO senior_review_request_tags (request_id, tag) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r06'), 'BACKEND');
INSERT INTO senior_review_request_tags (request_id, tag) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r06'), 'SPRING');
INSERT INTO senior_review_applications (request_id, senior_id, message, created_at) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), '인증 필터와 토큰 검증 흐름을 꼼꼼히 봐 드리겠습니다.', (now() - interval '57860 minutes'));
INSERT INTO senior_reviews (request_id, senior_id, content, rating, created_at) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r06'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), '코드를 꼼꼼히 봤습니다. 동작은 하지만 운영에 올리기 전에 반드시 고쳐야 할 항목이 있습니다.

[반드시 수정]
1) 비밀키 하드코딩: "secret1234"를 코드에 직접 쓰면 저장소가 공개되는 순간 누구나 토큰을 위조할 수 있습니다. 환경변수로 주입하고, 길이는 256비트(32바이트) 이상으로 하세요.
2) Authorization 헤더가 없을 때 NullPointerException: req.getHeader("Authorization")가 null이면 바로 예외가 납니다. null 확인과 "Bearer " 접두사 확인을 먼저 하세요.
3) 토큰이 잘못되거나 만료됐을 때 예외 처리가 없습니다. try-catch로 잡아서 인증을 설정하지 않고 다음 필터로 넘기면(익명 상태) 이후 보안 설정이 401을 돌려줍니다.
4) 권한 목록이 비어 있습니다(List.of()). 토큰에 role을 넣고 GrantedAuthority로 변환해야 관리자 전용 API를 구분할 수 있습니다.

[권장]
- 파서를 매 요청마다 만들지 말고 한 번 만들어 재사용하세요.
- 로그에 토큰 값을 남기지 마세요.
- 토큰 만료 시간을 짧게(예: 1~2시간) 두는 것을 권합니다.

수정한 코드를 다시 올려 주시면 확인해 드리겠습니다. 인증 구현의 기본 구조는 잘 잡혀 있어요.', 5, (now() - interval '53780 minutes'));
WITH ins AS (
  INSERT INTO senior_review_requests (title, content, code_content, language, credits, status, junior_id, senior_id, created_at, updated_at)
  VALUES ('useEffect 의존성 배열과 무한 렌더링 문제', '화면이 계속 깜빡이고 서버에 요청이 무한히 나갑니다. 원인과 올바른 수정 방법을 알려 주세요.', 'function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const filter = { active: true };

  useEffect(() => {
    fetch(''/api/users?active='' + filter.active)
      .then(res => res.json())
      .then(data => setUsers(data));
  }, [filter]);

  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}', 'typescript', 200, 'COMPLETED', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), (now() - interval '49460 minutes'), (now() - interval '45140 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'r', 'r07', id FROM ins;
INSERT INTO senior_review_request_tags (request_id, tag) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r07'), 'REACT');
INSERT INTO senior_review_request_tags (request_id, tag) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r07'), 'TYPESCRIPT');
INSERT INTO senior_review_applications (request_id, senior_id, message, created_at) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), '렌더링 흐름을 단계별로 설명드릴 수 있습니다.', (now() - interval '49220 minutes'));
INSERT INTO senior_reviews (request_id, senior_id, content, rating, created_at) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r07'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), '원인은 한 줄입니다. 의존성 배열의 filter가 렌더링마다 새로 만들어지는 객체이기 때문에, 이펙트가 매번 ''값이 바뀌었다''고 판단합니다.

흐름: 렌더링 → filter 객체 새로 생성 → 이펙트 실행 → setUsers → 상태 변경으로 다시 렌더링 → filter 새로 생성 → 이펙트 실행 → … (무한 반복)

해결 방법 (아래 중 하나)
1) 원시 값을 의존성으로 쓰기 (가장 단순)
   const active = true;
   useEffect(() => { ... }, [active]);
2) 값이 고정이라면 컴포넌트 밖으로 빼기
   const FILTER = { active: true };  // 컴포넌트 바깥
3) 꼭 객체가 필요하면 useMemo로 고정하기

추가 개선
- fetch 중 컴포넌트가 사라지면 상태 업데이트 경고가 납니다. AbortController로 취소하거나 TanStack Query를 쓰면 로딩·에러·캐시까지 한 번에 해결됩니다.
- res.ok 확인이 없어서 서버 오류도 JSON으로 파싱하려 합니다.

의존성 배열을 비워 두거나 린트 경고를 끄는 방법은 권하지 않습니다. 원인을 이해하셨으니 앞으로 같은 실수는 줄어들 거예요.', 4, (now() - interval '45140 minutes'));
WITH ins AS (
  INSERT INTO senior_review_requests (title, content, code_content, language, credits, status, junior_id, senior_id, created_at, updated_at)
  VALUES ('게시판 목록 조회 쿼리 튜닝', '게시글이 5만 건쯤 되자 목록 조회가 2초 넘게 걸립니다. 어디가 문제이고 어떻게 고쳐야 할까요?', 'SELECT b.*, u.nickname,
       (SELECT COUNT(*) FROM comments c WHERE c.board_id = b.id) AS comment_count
FROM boards b
JOIN users u ON u.id = b.user_id
WHERE lower(b.title) LIKE ''%spring%''
ORDER BY b.created_at DESC
LIMIT 10 OFFSET 2000;', 'sql', 400, 'COMPLETED', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), (now() - interval '36500 minutes'), (now() - interval '32180 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'r', 'r08', id FROM ins;
INSERT INTO senior_review_request_tags (request_id, tag) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r08'), 'DB');
INSERT INTO senior_review_request_tags (request_id, tag) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r08'), 'SQL');
INSERT INTO senior_review_applications (request_id, senior_id, message, created_at) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r08'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), '실행 계획 기준으로 병목을 찾아 드리겠습니다.', (now() - interval '36260 minutes'));
INSERT INTO senior_review_applications (request_id, senior_id, message, created_at) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r08'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), '쿼리 구조 쪽에서 도움드릴 수 있습니다.', (now() - interval '36020 minutes'));
INSERT INTO senior_reviews (request_id, senior_id, content, rating, created_at) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r08'), (SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), '쿼리를 보고 병목 후보를 세 가지로 나눠 정리했습니다. EXPLAIN (ANALYZE, BUFFERS)로 먼저 확인해 보시길 권합니다.

1) OFFSET 2000
   앞의 2,000건을 읽고 버린 뒤 10건을 돌려줍니다. 페이지가 깊어질수록 선형으로 느려집니다.
   → 마지막으로 본 created_at/id를 기준으로 다음 페이지를 가져오는 ''키셋 페이지네이션''을 검토하세요.

2) lower(title) LIKE ''%spring%''
   앞쪽 와일드카드와 함수 때문에 일반 인덱스를 못 탑니다. 전체를 읽어서 비교합니다.
   → pg_trgm 확장 + GIN 인덱스(CREATE INDEX ... USING gin (lower(title) gin_trgm_ops))를 쓰면 부분 일치 검색도 인덱스를 탑니다.

3) 상관 서브쿼리(COUNT)
   행마다 실행돼서 비용이 큽니다.
   → comments를 board_id로 GROUP BY 한 결과와 조인하거나, 댓글 수를 컬럼으로 두고 갱신하는 방법을 비교해 보세요. 읽기가 훨씬 많은 서비스라면 후자가 유리합니다.

보너스: ORDER BY created_at DESC LIMIT는 (created_at DESC) 인덱스가 있으면 정렬 없이 끝납니다. 필터와 같이 쓰는 경우 복합 인덱스 순서를 조건 컬럼 → 정렬 컬럼 순으로 잡으세요.

수정 후 EXPLAIN 결과를 올려 주시면 같이 보겠습니다.', 5, (now() - interval '32180 minutes'));
WITH ins AS (
  INSERT INTO senior_review_requests (title, content, code_content, language, credits, status, junior_id, senior_id, created_at, updated_at)
  VALUES ('TypeScript 타입 에러가 해결이 안 돼요 (급함)', '타입 에러가 나는데 급해서 올렸습니다.', 'const result = items.map(item => ({ ...item, total: item.price * item.qty }));
const first: Item = result[0];  // 에러', 'typescript', 100, 'CANCELED', (SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), NULL, (now() - interval '24980 minutes'), (now() - interval '23540 minutes'))
  RETURNING id) INSERT INTO _k SELECT 'r', 'r09', id FROM ins;
INSERT INTO senior_review_request_tags (request_id, tag) VALUES ((SELECT id FROM _k WHERE kind='r' AND key='r09'), 'TYPESCRIPT');

-- 9. 크레딧 거래 내역 (사용자별 잔액이 시간 순서대로 이어지도록 계산한 값)

INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), 'RECHARGE', 500, 1000, NULL, (now() - interval '155820 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), 'RECHARGE', 1000, 1500, NULL, (now() - interval '144300 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), 'RECHARGE', 500, 1000, NULL, (now() - interval '137100 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), 'RECHARGE', 1000, 1500, NULL, (now() - interval '118380 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_jun_taeho'), 'RECHARGE', 500, 1000, NULL, (now() - interval '101100 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), 'SPEND_SENIOR', -300, 1200, NULL, (now() - interval '58100 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), 'EARN_REVIEW', 270, 770, (SELECT id FROM _k WHERE kind='r' AND key='r06'), (now() - interval '53780 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_sen_seojun'), 'COMMISSION', -30, 770, (SELECT id FROM _k WHERE kind='r' AND key='r06'), (now() - interval '53780 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), 'SPEND_SENIOR', -200, 800, NULL, (now() - interval '49460 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), 'EARN_REVIEW', 180, 680, (SELECT id FROM _k WHERE kind='r' AND key='r07'), (now() - interval '45140 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_sen_hayoon'), 'COMMISSION', -20, 680, (SELECT id FROM _k WHERE kind='r' AND key='r07'), (now() - interval '45140 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), 'RECHARGE', 1000, 2500, NULL, (now() - interval '43500 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), 'SPEND_SENIOR', -400, 2100, NULL, (now() - interval '36500 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), 'EARN_REVIEW', 360, 860, (SELECT id FROM _k WHERE kind='r' AND key='r08'), (now() - interval '32180 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_sen_jaemin'), 'COMMISSION', -40, 860, (SELECT id FROM _k WHERE kind='r' AND key='r08'), (now() - interval '32180 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), 'SPEND_SENIOR', -100, 900, NULL, (now() - interval '24980 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), 'ADMIN_ADJUST', 100, 1000, NULL, (now() - interval '23540 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), 'SPEND_SENIOR', -500, 1600, NULL, (now() - interval '16340 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_jun_jihun'), 'SPEND_SENIOR', -250, 750, NULL, (now() - interval '9140 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_jun_yuna'), 'SPEND_SENIOR', -300, 900, NULL, (now() - interval '4820 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_jun_haneul'), 'SPEND_SENIOR', -200, 600, NULL, (now() - interval '3380 minutes'));
INSERT INTO credit_transactions (user_id, type, amount, balance_after, target_id, created_at) VALUES ((SELECT id FROM _k WHERE kind='u' AND key='demo_jun_sora'), 'SPEND_SENIOR', -400, 1200, NULL, (now() - interval '1940 minutes'));

-- 10. 뱃지: 앱의 지급 규칙(게시글 수 · 댓글 수 · 경험치)과 같은 조건으로 지급합니다. badges 표가 비어 있으면 아무것도 지급되지 않습니다.
INSERT INTO user_badges (user_id, badge_id)
SELECT u.id, b.id FROM users u CROSS JOIN badges b
WHERE u.login_id LIKE 'demo\_%'
  AND CASE b.condition_type
        WHEN 'POST_COUNT' THEN (SELECT count(*) FROM boards x WHERE x.user_id = u.id) >= b.threshold
        WHEN 'COMMENT_COUNT' THEN (SELECT count(*) FROM comments x WHERE x.user_id = u.id) >= b.threshold
        WHEN 'XP' THEN u.experience >= b.threshold
        ELSE false
      END
ON CONFLICT DO NOTHING;

COMMIT;

-- 확인용 건수
SELECT 'users' AS t, count(*) FROM users WHERE login_id LIKE 'demo\_%'
UNION ALL SELECT 'boards', count(*) FROM boards WHERE user_id IN (SELECT id FROM users WHERE login_id LIKE 'demo\_%')
UNION ALL SELECT 'comments', count(*) FROM comments WHERE user_id IN (SELECT id FROM users WHERE login_id LIKE 'demo\_%')
UNION ALL SELECT 'senior_review_requests', count(*) FROM senior_review_requests WHERE junior_id IN (SELECT id FROM users WHERE login_id LIKE 'demo\_%');
