-- 소셜 액세스 토큰 저장 중단(2026-10-08): 평문 저장 위험만 있고 쓰는 기능이 없어 값을 지우고 컬럼을 제거한다.
-- 테이블 이름은 User 엔티티의 @Table 기준(users). 배포 전에 한 번 수동 적용한다.
UPDATE users SET social_access_token = NULL WHERE social_access_token IS NOT NULL;
ALTER TABLE users DROP COLUMN IF EXISTS social_access_token;
