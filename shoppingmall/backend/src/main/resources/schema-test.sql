-- [이유] H2 데이터베이스에서 'ORDER'는 예약어이므로 스키마 명칭으로 사용 시 
-- 충돌이 잦습니다. 이를 방지하기 위해 'purchase'로 명칭을 변경합니다.

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS privacy;
CREATE SCHEMA IF NOT EXISTS product;
CREATE SCHEMA IF NOT EXISTS purchase;
