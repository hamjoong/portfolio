-- 주문 생성 시 상품 행 잠금 순서를 product_id 오름차순으로 통일한다.
--
-- 문제: create_order_atomic은 주문 항목 순서대로 상품 행을 FOR UPDATE로 잠갔다. 두 주문이 같은 상품을
--       서로 반대 순서(A,B / B,A)로 담으면 서로 상대가 가진 잠금을 기다려 데드락(40P01)이 났다.
-- 해결: 본 루프에 들어가기 전에 주문에 포함된 모든 상품 행을 product_id 순으로 먼저 잠근다.
--       모든 주문이 같은 순서로 잠그므로 순환 대기가 생기지 않는다. 같은 상품의 옵션 행은 상품 행을
--       잠근 뒤에만 건드리므로 옵션 잠금 순서로 인한 데드락도 함께 막힌다.
-- 그 밖의 동작(가격 계산, 재고 확인·차감, 오류 코드, 권한)은 20261007000100과 같다.

DROP FUNCTION IF EXISTS public.create_order_atomic(text, text, text, text, text, jsonb, text, text);
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
    v_lock_id uuid;
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

    -- 항목 순서와 무관하게 모든 주문이 같은 순서(product_id 오름차순)로 상품 행을 잠근다.
    -- 존재하지 않는 상품은 여기서 걸러지지 않고 아래 본 루프에서 기존과 같이 거절된다.
    FOR v_lock_id IN
        SELECT DISTINCT (value->>'product_id')::uuid AS id
          FROM jsonb_array_elements(p_items)
         ORDER BY id
    LOOP
        PERFORM 1 FROM public.products WHERE id = v_lock_id FOR UPDATE;
    END LOOP;

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
