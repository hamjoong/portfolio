-- 결제 보안 강화(2026-10-08): 결제 ID 중복 방지 + 구독 실결제 금액 보관
-- 운영 DB는 ddl-auto: none 이므로 배포 전에 한 번 수동으로 적용한다. (local 프로필은 ddl-auto: update 라 자동 반영)

ALTER TABLE credit_transactions
    ADD COLUMN IF NOT EXISTS payment_id VARCHAR(100);

-- 같은 결제 ID로 두 번 지급되지 않도록 유니크. NULL(결제와 무관한 거래)은 여러 건 허용된다.
CREATE UNIQUE INDEX IF NOT EXISTS uk_credit_transactions_payment_id
    ON credit_transactions (payment_id);

ALTER TABLE user_subscriptions
    ADD COLUMN IF NOT EXISTS paid_amount INTEGER NOT NULL DEFAULT 0;

-- 거래 유형 enum에 SUBSCRIBE, REFUND 가 추가되었다.
-- Hibernate가 만든 CHECK 제약이 있으면 새 값이 거부되므로 있는 경우에만 제거한다.
ALTER TABLE credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_type_check;
