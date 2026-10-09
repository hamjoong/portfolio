-- 데모 데이터만 삭제합니다 (seed_demo.sql 로 넣은 login_id 'demo_%' 사용자와 그 활동).
BEGIN;
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
COMMIT;
