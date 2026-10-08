BEGIN;

CREATE OR REPLACE FUNCTION public.admin_save_product(
    p_auth_user_id uuid,
    p_product_id uuid,
    p_product jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    saved_product_id uuid := COALESCE(p_product_id, gen_random_uuid());
    option_data jsonb;
    saved_option_id uuid;
BEGIN
    IF auth.role() IS DISTINCT FROM 'service_role' THEN
        RAISE EXCEPTION 'service role required' USING ERRCODE = '42501';
    END IF;

    IF p_auth_user_id IS NULL OR NOT EXISTS (
        SELECT 1
          FROM public.admin_users
         WHERE auth_user_id = p_auth_user_id
    ) THEN
        RAISE EXCEPTION 'administrator authorization required' USING ERRCODE = '42501';
    END IF;

    IF jsonb_typeof(p_product) <> 'object'
       OR jsonb_typeof(COALESCE(p_product->'options', '[]'::jsonb)) <> 'array'
       OR NULLIF(btrim(p_product->>'name'), '') IS NULL
       OR length(btrim(p_product->>'name')) > 200
       OR COALESCE(p_product->>'price' !~ '^[0-9]+([.][0-9]{1,2})?$', true)
       OR COALESCE(p_product->>'stockQuantity' !~ '^[0-9]+$', true)
       OR COALESCE((p_product->>'price')::numeric < 0, true)
       OR COALESCE((p_product->>'stockQuantity')::integer < 0, true) THEN
        RAISE EXCEPTION 'invalid product data' USING ERRCODE = '22023';
    END IF;

    IF NULLIF(p_product->>'categoryId', '') IS NOT NULL
       AND p_product->>'categoryId' !~ '^[0-9]+$' THEN
        RAISE EXCEPTION 'invalid category ID' USING ERRCODE = '22023';
    END IF;

    IF NULLIF(p_product->>'categoryId', '') IS NOT NULL AND NOT EXISTS (
        SELECT 1
          FROM public.categories
         WHERE id = (p_product->>'categoryId')::bigint
    ) THEN
        RAISE EXCEPTION 'category not found' USING ERRCODE = 'P0002';
    END IF;

    IF p_product_id IS NULL THEN
        INSERT INTO public.products (
            id, category_id, name, description, price, stock_quantity,
            main_image_url, status, created_at, updated_at
        )
        VALUES (
            saved_product_id,
            NULLIF(p_product->>'categoryId', '')::bigint,
            btrim(p_product->>'name'),
            NULLIF(p_product->>'description', ''),
            (p_product->>'price')::numeric,
            (p_product->>'stockQuantity')::integer,
            NULLIF(p_product->>'imageUrl', ''),
            'FOR_SALE',
            now(),
            now()
        );
    ELSE
        UPDATE public.products
           SET category_id = CASE
                   WHEN p_product ? 'categoryId'
                   THEN NULLIF(p_product->>'categoryId', '')::bigint
                   ELSE category_id
               END,
               name = btrim(p_product->>'name'),
               description = NULLIF(p_product->>'description', ''),
               price = (p_product->>'price')::numeric,
               stock_quantity = (p_product->>'stockQuantity')::integer,
               main_image_url = NULLIF(p_product->>'imageUrl', ''),
               updated_at = now()
         WHERE id = p_product_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'product not found' USING ERRCODE = 'P0002';
        END IF;
    END IF;

    FOR option_data IN
        SELECT value FROM jsonb_array_elements(COALESCE(p_product->'options', '[]'::jsonb))
    LOOP
        IF jsonb_typeof(option_data) <> 'object'
           OR NULLIF(btrim(option_data->>'optionType'), '') IS NULL
           OR length(btrim(option_data->>'optionType')) > 100
           OR NULLIF(btrim(option_data->>'optionName'), '') IS NULL
           OR length(btrim(option_data->>'optionName')) > 100
           OR COALESCE(option_data->>'additionalPrice' !~ '^[0-9]+([.][0-9]{1,2})?$', true)
           OR COALESCE(option_data->>'stockQuantity' !~ '^[0-9]+$', true)
           OR COALESCE((option_data->>'additionalPrice')::numeric < 0, true)
           OR COALESCE((option_data->>'stockQuantity')::integer < 0, true) THEN
            RAISE EXCEPTION 'invalid product option data' USING ERRCODE = '22023';
        END IF;

        SELECT id
          INTO saved_option_id
          FROM public.product_options
         WHERE product_id = saved_product_id
           AND option_type = btrim(option_data->>'optionType')
           AND option_name = btrim(option_data->>'optionName')
         FOR UPDATE;

        IF FOUND THEN
            UPDATE public.product_options
               SET additional_price = (option_data->>'additionalPrice')::numeric,
                   stock_quantity = (option_data->>'stockQuantity')::integer,
                   updated_at = now()
             WHERE id = saved_option_id;
        ELSE
            INSERT INTO public.product_options (
                id, product_id, option_type, option_name, additional_price,
                stock_quantity, created_at, updated_at
            )
            VALUES (
                gen_random_uuid(),
                saved_product_id,
                btrim(option_data->>'optionType'),
                btrim(option_data->>'optionName'),
                (option_data->>'additionalPrice')::numeric,
                (option_data->>'stockQuantity')::integer,
                now(),
                now()
            );
        END IF;
    END LOOP;

    DELETE FROM public.product_options existing
     WHERE existing.product_id = saved_product_id
       AND NOT EXISTS (
           SELECT 1
             FROM jsonb_array_elements(COALESCE(p_product->'options', '[]'::jsonb)) option_item
            WHERE btrim(option_item->>'optionType') = existing.option_type
              AND btrim(option_item->>'optionName') = existing.option_name
       );

    RETURN saved_product_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_save_product(uuid, uuid, jsonb)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_product(uuid, uuid, jsonb)
    TO service_role;

COMMIT;
