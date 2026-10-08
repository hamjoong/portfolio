-- Post-baseline migration: requires the application's existing catalog,
-- cart, order, and review/Q&A tables. This file is not a standalone schema bootstrap.
BEGIN;
DROP POLICY IF EXISTS "Users can manage their own cart items" ON public.cart_items;


ALTER TABLE public.cart_items
    DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey,
    DROP CONSTRAINT IF EXISTS cart_items_option_id_fkey;
ALTER TABLE public.cart_items
    ALTER COLUMN user_id TYPE text USING user_id::text,
    ALTER COLUMN option_id TYPE text USING option_id::text;

ALTER TABLE public.orders
    DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE public.orders
    ALTER COLUMN user_id TYPE text USING user_id::text;

ALTER TABLE public.order_items
    DROP CONSTRAINT IF EXISTS order_items_option_id_fkey;
ALTER TABLE public.order_items
    ALTER COLUMN option_id TYPE text USING option_id::text;

DROP POLICY IF EXISTS "Users can manage their own cart items" ON public.cart_items;
DO $$
BEGIN
    IF to_regclass('public.auth_user_mappings') IS NOT NULL THEN
        EXECUTE $policy$
            CREATE POLICY "Users can manage their own cart items"
            ON public.cart_items
            FOR ALL
            TO authenticated
            USING (
                user_id = (SELECT auth.uid())::text
                OR user_id IN (
                    SELECT legacy_user_id::text
                    FROM public.auth_user_mappings
                    WHERE auth_user_id = (SELECT auth.uid())
                )
            )
            WITH CHECK (
                user_id = (SELECT auth.uid())::text
                OR user_id IN (
                    SELECT legacy_user_id::text
                    FROM public.auth_user_mappings
                    WHERE auth_user_id = (SELECT auth.uid())
                )
            )
        $policy$;
    ELSE
        EXECUTE $policy$
            CREATE POLICY "Users can manage their own cart items"
            ON public.cart_items
            FOR ALL
            TO authenticated
            USING (user_id = (SELECT auth.uid())::text)
            WITH CHECK (user_id = (SELECT auth.uid())::text)
        $policy$;
    END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.admin_users (
    auth_user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.admin_users FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.admin_users TO service_role;
COMMENT ON TABLE public.admin_users IS
    'Server-managed administrator allowlist. Bootstrap only through a trusted database owner or service-role operation.';

DROP FUNCTION IF EXISTS public.get_or_sync_cart(text);
DROP FUNCTION IF EXISTS public.create_order_atomic(text, jsonb, jsonb);
DROP FUNCTION IF EXISTS public.create_order_atomic(uuid, text, text, text, text, jsonb);
DROP FUNCTION IF EXISTS public.create_order_atomic(text, text, text, text, text, jsonb);
CREATE FUNCTION public.create_order_atomic(
    p_user_id text,
    p_receiver_name text,
    p_phone text,
    p_address text,
    p_detail_address text,
    p_items jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_order_id uuid := gen_random_uuid();
    v_order_no text;
    v_total_amount numeric(12, 2) := 0;
    v_item jsonb;
    v_product_id uuid;
    v_option_id_text text;
    v_option_ids text[];
    v_option_id_part text;
    v_primary_option_id uuid;
    v_quantity integer;
    v_base_price numeric(12, 2);
    v_option_price numeric(12, 2);
    v_unit_price numeric(12, 2);
    v_stock integer;
BEGIN
    IF auth.role() IS DISTINCT FROM 'service_role' THEN
        RAISE EXCEPTION 'service role required' USING ERRCODE = '42501';
    END IF;

    IF p_user_id IS NULL OR length(p_user_id) = 0
       OR p_items IS NULL OR jsonb_typeof(p_items) <> 'array'
       OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'invalid order request' USING ERRCODE = '22023';
    END IF;

    FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::uuid;
        v_quantity := (v_item->>'quantity')::integer;
        v_option_id_text := NULLIF(v_item->>'option_id', '');
        v_unit_price := 0;

        IF v_quantity IS NULL OR v_quantity <= 0 THEN
            RAISE EXCEPTION 'invalid item quantity' USING ERRCODE = '22023';
        END IF;

        SELECT price, stock_quantity
          INTO v_base_price, v_stock
          FROM public.products
         WHERE id = v_product_id
         FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'product not found: %', v_product_id USING ERRCODE = 'P0002';
        END IF;

        v_unit_price := v_base_price;
        v_primary_option_id := NULL;

        IF v_option_id_text IS NULL THEN
            IF v_stock < v_quantity THEN
                RAISE EXCEPTION 'insufficient product stock: %', v_product_id USING ERRCODE = 'P0001';
            END IF;
            UPDATE public.products
               SET stock_quantity = stock_quantity - v_quantity,
                   updated_at = now()
             WHERE id = v_product_id;
        ELSE
            v_option_ids := string_to_array(v_option_id_text, ',');
            v_primary_option_id := v_option_ids[1]::uuid;
            IF cardinality(v_option_ids) <> (
                SELECT count(DISTINCT option_id)
                  FROM unnest(v_option_ids) AS options(option_id)
            ) THEN
                RAISE EXCEPTION 'duplicate product options are not allowed' USING ERRCODE = '22023';
            END IF;

            FOREACH v_option_id_part IN ARRAY v_option_ids
            LOOP
                SELECT additional_price, stock_quantity
                  INTO v_option_price, v_stock
                  FROM public.product_options
                 WHERE id = v_option_id_part::uuid
                   AND product_id = v_product_id
                 FOR UPDATE;

                IF NOT FOUND THEN
                    RAISE EXCEPTION 'product option not found: %', v_option_id_part USING ERRCODE = 'P0002';
                END IF;
                IF v_stock < v_quantity THEN
                    RAISE EXCEPTION 'insufficient option stock: %', v_option_id_part USING ERRCODE = 'P0001';
                END IF;

                UPDATE public.product_options
                   SET stock_quantity = stock_quantity - v_quantity,
                       updated_at = now()
                 WHERE id = v_option_id_part::uuid;
                v_unit_price := v_unit_price + v_option_price;
            END LOOP;
        END IF;

        v_total_amount := v_total_amount + (v_unit_price * v_quantity);
    END LOOP;

    v_order_no := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' ||
        upper(substring(gen_random_uuid()::text FROM 1 FOR 6));

    INSERT INTO public.orders (
        id, order_no, user_id, total_amount, status,
        receiver_name, phone, address, detail_address, created_at, updated_at
    )
    VALUES (
        v_order_id, v_order_no, p_user_id, v_total_amount, 'PAID',
        p_receiver_name, p_phone, p_address, p_detail_address, now(), now()
    );

    FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::uuid;
        v_quantity := (v_item->>'quantity')::integer;
        v_option_id_text := NULLIF(v_item->>'option_id', '');
        v_unit_price := 0;
        v_primary_option_id := NULL;

        SELECT price
          INTO v_base_price
          FROM public.products
         WHERE id = v_product_id;
        v_unit_price := v_base_price;

        IF v_option_id_text IS NOT NULL THEN
            v_option_ids := string_to_array(v_option_id_text, ',');
            v_primary_option_id := v_option_ids[1]::uuid;

            FOREACH v_option_id_part IN ARRAY v_option_ids
            LOOP
                SELECT additional_price
                  INTO v_option_price
                  FROM public.product_options
                 WHERE id = v_option_id_part::uuid
                   AND product_id = v_product_id;
                v_unit_price := v_unit_price + v_option_price;
            END LOOP;
        END IF;

        INSERT INTO public.order_items (
            id, order_id, product_id, option_id, quantity, price, created_at, updated_at
        )
        VALUES (
            gen_random_uuid(), v_order_id, v_product_id,
            v_primary_option_id::text, v_quantity, v_unit_price, now(), now()
        );
    END LOOP;

    DELETE FROM public.cart_items cart
     WHERE cart.user_id = p_user_id
       AND EXISTS (
           SELECT 1
             FROM jsonb_array_elements(p_items) item
            WHERE (item->>'product_id')::uuid = cart.product_id
              AND (
                  (NULLIF(item->>'option_id', '') IS NULL AND
                   (cart.option_id IS NULL OR cart.option_id = ''))
                  OR NULLIF(item->>'option_id', '') = cart.option_id
              )
       );

    RETURN v_order_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_order_atomic(text, text, text, text, text, jsonb)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_atomic(text, text, text, text, text, jsonb)
    TO service_role;

COMMIT;
