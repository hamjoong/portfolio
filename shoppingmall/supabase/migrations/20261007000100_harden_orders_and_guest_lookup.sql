-- 주문 RPC 보강, 비회원 주문 조회, 탈퇴 전 진행 중 주문 차단.
-- 적용된 이전 마이그레이션은 수정하지 않고 이 파일에서 함수를 교체한다.
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. 비회원 조회용 컬럼: 이메일과 조회 비밀번호(bcrypt 해시). 둘은 함께 있거나 함께 없어야 한다.
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS guest_email text,
    ADD COLUMN IF NOT EXISTS guest_lookup_hash text;
ALTER TABLE public.orders
    DROP CONSTRAINT IF EXISTS orders_guest_lookup_complete;
ALTER TABLE public.orders
    ADD CONSTRAINT orders_guest_lookup_complete
    CHECK ((guest_email IS NULL) = (guest_lookup_hash IS NULL));

-- 2. 조회 실패 기록 (무차별 대입 방지). 클라이언트에는 노출하지 않는다.
CREATE TABLE IF NOT EXISTS public.guest_order_lookup_attempts (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_no text NOT NULL,
    client_key text NOT NULL,
    attempted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_guest_lookup_attempts_order
    ON public.guest_order_lookup_attempts (order_no, attempted_at);
CREATE INDEX IF NOT EXISTS idx_guest_lookup_attempts_client
    ON public.guest_order_lookup_attempts (client_key, attempted_at);
ALTER TABLE public.guest_order_lookup_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.guest_order_lookup_attempts FROM PUBLIC, anon, authenticated;

-- 3. 주문 생성: 한 트랜잭션에서 재고 잠금·차감, 가격 계산, 주문 저장.
--    판매 중(FOR_SALE)이 아닌 상품은 거절하고, 가격과 합계는 항상 DB 값으로 계산한다.
DROP FUNCTION IF EXISTS public.create_order_atomic(text, text, text, text, text, jsonb);
CREATE FUNCTION public.create_order_atomic(
    p_user_id text,
    p_receiver_name text,
    p_phone text,
    p_address text,
    p_detail_address text,
    p_items jsonb,
    p_guest_email text DEFAULT NULL,
    p_guest_lookup_password text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_order_id uuid := gen_random_uuid();
    v_order_no text;
    v_total numeric(12, 2) := 0;
    v_item jsonb;
    v_product_id uuid;
    v_option_text text;
    v_option_ids text[];
    v_option_part text;
    v_primary_option uuid;
    v_quantity integer;
    v_unit_price numeric(12, 2);
    v_option_price numeric(12, 2);
    v_stock integer;
    v_status text;
    v_is_guest boolean := p_user_id LIKE 'guest-%';
BEGIN
    IF auth.role() IS DISTINCT FROM 'service_role' THEN
        RAISE EXCEPTION 'service role required' USING ERRCODE = '42501';
    END IF;

    IF p_user_id IS NULL OR length(p_user_id) = 0
       OR p_items IS NULL OR jsonb_typeof(p_items) <> 'array'
       OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 50 THEN
        RAISE EXCEPTION 'invalid order request' USING ERRCODE = '22023';
    END IF;

    IF v_is_guest AND (
        p_guest_email IS NULL OR p_guest_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
        OR p_guest_lookup_password IS NULL OR length(p_guest_lookup_password) < 6
    ) THEN
        RAISE EXCEPTION 'guest email and lookup password required' USING ERRCODE = '22023';
    END IF;

    v_order_no := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' ||
        upper(substring(gen_random_uuid()::text FROM 1 FOR 8));

    -- 합계는 항목을 처리하며 채운다. 항목에서 예외가 나면 트랜잭션 전체가 롤백된다.
    INSERT INTO public.orders (
        id, order_no, user_id, total_amount, status,
        receiver_name, phone, address, detail_address,
        guest_email, guest_lookup_hash, created_at, updated_at
    )
    VALUES (
        v_order_id, v_order_no, p_user_id, 0, 'PAID',
        p_receiver_name, p_phone, p_address, coalesce(p_detail_address, ''),
        CASE WHEN v_is_guest THEN lower(p_guest_email) END,
        CASE WHEN v_is_guest THEN extensions.crypt(p_guest_lookup_password, extensions.gen_salt('bf')) END,
        now(), now()
    );

    FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::uuid;
        v_quantity := (v_item->>'quantity')::integer;
        v_option_text := NULLIF(v_item->>'option_id', '');

        IF v_quantity IS NULL OR v_quantity NOT BETWEEN 1 AND 99 THEN
            RAISE EXCEPTION 'invalid item quantity' USING ERRCODE = '22023';
        END IF;

        SELECT price, stock_quantity, status
          INTO v_unit_price, v_stock, v_status
          FROM public.products
         WHERE id = v_product_id
         FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'product not found' USING ERRCODE = 'P0002';
        END IF;
        IF v_status <> 'FOR_SALE' THEN
            RAISE EXCEPTION 'product not for sale' USING ERRCODE = 'P0001';
        END IF;

        v_primary_option := NULL;

        IF v_option_text IS NULL THEN
            IF v_stock < v_quantity THEN
                RAISE EXCEPTION 'insufficient product stock' USING ERRCODE = 'P0001';
            END IF;
            UPDATE public.products
               SET stock_quantity = stock_quantity - v_quantity, updated_at = now()
             WHERE id = v_product_id;
        ELSE
            v_option_ids := string_to_array(v_option_text, ',');
            v_primary_option := v_option_ids[1]::uuid;
            IF cardinality(v_option_ids) <> (SELECT count(DISTINCT o) FROM unnest(v_option_ids) AS t(o)) THEN
                RAISE EXCEPTION 'duplicate product options' USING ERRCODE = '22023';
            END IF;

            FOREACH v_option_part IN ARRAY v_option_ids
            LOOP
                SELECT additional_price, stock_quantity
                  INTO v_option_price, v_stock
                  FROM public.product_options
                 WHERE id = v_option_part::uuid AND product_id = v_product_id
                 FOR UPDATE;

                IF NOT FOUND THEN
                    RAISE EXCEPTION 'product option not found' USING ERRCODE = 'P0002';
                END IF;
                IF v_stock < v_quantity THEN
                    RAISE EXCEPTION 'insufficient option stock' USING ERRCODE = 'P0001';
                END IF;

                UPDATE public.product_options
                   SET stock_quantity = stock_quantity - v_quantity, updated_at = now()
                 WHERE id = v_option_part::uuid;
                v_unit_price := v_unit_price + v_option_price;
            END LOOP;
        END IF;

        INSERT INTO public.order_items (
            id, order_id, product_id, option_id, quantity, price, created_at, updated_at
        )
        VALUES (
            gen_random_uuid(), v_order_id, v_product_id,
            v_primary_option::text, v_quantity, v_unit_price, now(), now()
        );

        v_total := v_total + v_unit_price * v_quantity;

        DELETE FROM public.cart_items
         WHERE user_id = p_user_id
           AND product_id = v_product_id
           AND coalesce(option_id, '') = coalesce(v_option_text, '');
    END LOOP;

    UPDATE public.orders SET total_amount = v_total WHERE id = v_order_id;

    RETURN jsonb_build_object('order_id', v_order_id, 'order_no', v_order_no);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_order_atomic(text, text, text, text, text, jsonb, text, text)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_atomic(text, text, text, text, text, jsonb, text, text)
    TO service_role;

-- 4. 비회원 주문 조회. 주문번호 + 이메일 + 조회 비밀번호가 모두 맞아야 한다.
--    실패 사유(없음/이메일 불일치/비밀번호 불일치)는 구분하지 않고 NULL을 돌려준다.
CREATE OR REPLACE FUNCTION public.lookup_guest_order(
    p_order_no text,
    p_email text,
    p_password text,
    p_client_key text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_order public.orders%ROWTYPE;
    v_result jsonb;
BEGIN
    IF auth.role() IS DISTINCT FROM 'service_role' THEN
        RAISE EXCEPTION 'service role required' USING ERRCODE = '42501';
    END IF;

    DELETE FROM public.guest_order_lookup_attempts WHERE attempted_at < now() - interval '1 day';

    -- 15분 안에 같은 주문번호는 10회, 같은 접속원은 20회까지만 실패할 수 있다. (오타를 고려해 5회보다 넉넉하게 잡음)
    IF (SELECT count(*) FROM public.guest_order_lookup_attempts
         WHERE order_no = p_order_no AND attempted_at > now() - interval '15 minutes') >= 10
       OR (SELECT count(*) FROM public.guest_order_lookup_attempts
            WHERE client_key = p_client_key AND attempted_at > now() - interval '15 minutes') >= 20 THEN
        RAISE EXCEPTION 'too many attempts' USING ERRCODE = 'P0003';
    END IF;

    SELECT * INTO v_order
      FROM public.orders
     WHERE order_no = p_order_no
       AND guest_email = lower(p_email)
       AND guest_lookup_hash IS NOT NULL
       AND guest_lookup_hash = extensions.crypt(p_password, guest_lookup_hash);

    IF NOT FOUND THEN
        INSERT INTO public.guest_order_lookup_attempts (order_no, client_key)
        VALUES (p_order_no, p_client_key);
        RETURN NULL;
    END IF;

    SELECT jsonb_build_object(
        'id', v_order.id,
        'orderNo', v_order.order_no,
        'status', v_order.status,
        'totalAmount', v_order.total_amount,
        'receiverName', v_order.receiver_name,
        'phone', v_order.phone,
        'address', v_order.address,
        'detailAddress', v_order.detail_address,
        'createdAt', v_order.created_at,
        'items', coalesce(jsonb_agg(jsonb_build_object(
            'productId', oi.product_id,
            'productName', p.name,
            'imageUrl', p.main_image_url,
            'quantity', oi.quantity,
            'price', oi.price
        )), '[]'::jsonb)
    )
      INTO v_result
      FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
     WHERE oi.order_id = v_order.id;

    RETURN v_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.lookup_guest_order(text, text, text, text)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_guest_order(text, text, text, text) TO service_role;

-- 5. 비회원 주문 개인정보 파기: 주문 후 N일이 지난 비회원 주문의 수령 정보와 조회 정보를 지운다.
--    자동 실행은 설정하지 않았다. Supabase 대시보드의 Scheduled Jobs(pg_cron) 또는 수동으로 호출한다.
CREATE OR REPLACE FUNCTION public.anonymize_expired_guest_orders(p_days integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_count integer;
BEGIN
    -- Edge Function은 service_role 클레임으로, pg_cron·SQL Editor는 DB 관리자 세션으로 호출한다.
    -- 관리자 세션에는 JWT 클레임이 없어 auth.role()이 비어 있으므로 session_user로 따로 허용한다.
    -- (anon·authenticated는 EXECUTE 권한이 없고, API 요청의 session_user는 authenticator라 여기서 허용되지 않는다.)
    IF auth.role() IS DISTINCT FROM 'service_role'
       AND session_user NOT IN ('postgres', 'supabase_admin') THEN
        RAISE EXCEPTION 'service role required' USING ERRCODE = '42501';
    END IF;

    UPDATE public.orders
       SET receiver_name = '비회원 주문(익명화)',
           phone = '',
           postal_code = NULL,
           address = '삭제됨',
           detail_address = '',
           memo = NULL,
           guest_email = NULL,
           guest_lookup_hash = NULL,
           updated_at = now()
     WHERE guest_lookup_hash IS NOT NULL
       AND created_at < now() - make_interval(days => p_days);
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.anonymize_expired_guest_orders(integer)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.anonymize_expired_guest_orders(integer) TO service_role;

-- 6. 탈퇴: 결제 완료·배송 중 주문이 남아 있으면 거절한다. (P0001 → Edge에서 409)
CREATE OR REPLACE FUNCTION public.anonymize_customer_account(p_auth_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF auth.role() IS DISTINCT FROM 'service_role' THEN
        RAISE EXCEPTION 'service role required' USING ERRCODE = '42501';
    END IF;

    IF p_auth_user_id IS NULL THEN
        RAISE EXCEPTION 'authenticated user is required' USING ERRCODE = '22023';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.orders
         WHERE user_id = p_auth_user_id::text AND status IN ('PENDING', 'PAID', 'SHIPPED')
    ) THEN
        RAISE EXCEPTION 'active orders exist' USING ERRCODE = 'P0001';
    END IF;

    DELETE FROM public.cart_items WHERE user_id = p_auth_user_id::text;

    UPDATE public.orders
       SET user_id = 'withdrawn:' || gen_random_uuid()::text,
           receiver_name = '탈퇴한 사용자',
           phone = '',
           postal_code = NULL,
           address = '삭제됨',
           detail_address = '',
           memo = NULL,
           updated_at = now()
     WHERE user_id = p_auth_user_id::text;

    UPDATE public.reviews
       SET user_id = 'withdrawn:' || gen_random_uuid()::text, updated_at = now()
     WHERE user_id = p_auth_user_id::text;

    UPDATE public.product_qnas
       SET user_id = 'withdrawn:' || gen_random_uuid()::text, updated_at = now()
     WHERE user_id = p_auth_user_id::text;
END;
$$;

COMMIT;
