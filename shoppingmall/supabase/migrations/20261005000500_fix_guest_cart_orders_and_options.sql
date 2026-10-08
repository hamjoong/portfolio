-- Supabase Migration: Fix Guest Cart, Guest Orders, Multi-Options (Comma-separated), 400 Payment Error, and Product Options
-- Created: 2026-10-05

-- 1. Drop dependent RLS policy on cart_items before altering column type
DROP POLICY IF EXISTS "Users can manage their own cart items" ON public.cart_items;

-- Drop foreign key constraint on cart_items.user_id FIRST before changing type
ALTER TABLE public.cart_items 
    DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;

-- Alter cart_items user_id and option_id to TEXT to support guest IDs and multi-option strings
ALTER TABLE public.cart_items 
    ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT,
    ALTER COLUMN option_id TYPE TEXT USING option_id::TEXT;

-- Drop foreign key constraint on cart_items.option_id if exists
ALTER TABLE public.cart_items 
    DROP CONSTRAINT IF EXISTS cart_items_option_id_fkey;

-- Re-create RLS policy for cart_items to support both authenticated and guest users
CREATE POLICY "Users can manage their own cart items" ON public.cart_items
    FOR ALL
    USING (
        user_id IN (
            SELECT legacy_user_id::text FROM public.auth_user_mappings 
            WHERE auth_user_id = auth.uid()
        )
        OR user_id LIKE 'guest-%'
    )
    WITH CHECK (
        user_id IN (
            SELECT legacy_user_id::text FROM public.auth_user_mappings 
            WHERE auth_user_id = auth.uid()
        )
        OR user_id LIKE 'guest-%'
    );

-- 2. Drop foreign key constraint on orders.user_id and order_items.option_id FIRST before changing type
ALTER TABLE public.orders 
    DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

ALTER TABLE public.orders 
    ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

ALTER TABLE public.order_items 
    ALTER COLUMN option_id TYPE TEXT USING option_id::TEXT;

ALTER TABLE public.order_items 
    DROP CONSTRAINT IF EXISTS order_items_option_id_fkey;

-- 3. Drop existing create_order_atomic function overloads to avoid ambiguity
DROP FUNCTION IF EXISTS public.create_order_atomic(UUID, TEXT, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.create_order_atomic(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB);

-- Update create_order_atomic RPC function to accept TEXT p_user_id, support guest orders and multi-options
CREATE OR REPLACE FUNCTION public.create_order_atomic(
    p_user_id TEXT,
    p_receiver_name TEXT,
    p_phone TEXT,
    p_address TEXT,
    p_detail_address TEXT,
    p_items JSONB -- Array of { product_id, option_id, quantity }
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_order_id UUID;
    v_order_no TEXT;
    v_total_amount DECIMAL(12, 2) := 0;
    v_item JSONB;
    v_product_id UUID;
    v_option_id_str TEXT;
    v_single_opt_id UUID;
    v_primary_option_id UUID;
    v_quantity INT;
    v_base_price DECIMAL(12, 2);
    v_opt_price DECIMAL(12, 2);
    v_item_unit_price DECIMAL(12, 2);
    v_current_stock INT;
    v_item_subtotal DECIMAL(12, 2);
    v_opt_id_arr TEXT[];
BEGIN
    IF auth.role() <> 'service_role' THEN
        IF p_user_id NOT LIKE 'guest-%' AND NOT EXISTS (
            SELECT 1 FROM public.auth_user_mappings 
            WHERE auth_user_id = auth.uid() AND legacy_user_id::text = p_user_id
        ) THEN
            RAISE EXCEPTION 'Unauthorized order creation for user %', p_user_id;
        END IF;
    END IF;

    v_order_no := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(gen_random_uuid()::text from 1 for 6));

    -- First pass: calculate total amount and validate stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_option_id_str := v_item->>'option_id';
        v_quantity := (v_item->>'quantity')::INT;

        IF v_quantity <= 0 THEN
            RAISE EXCEPTION 'Invalid quantity for product %', v_product_id;
        END IF;

        -- Get base product price and stock
        SELECT price, stock_quantity INTO v_base_price, v_current_stock
        FROM public.products
        WHERE id = v_product_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product not found: %', v_product_id;
        END IF;

        v_item_unit_price := v_base_price;
        v_primary_option_id := NULL;

        IF v_option_id_str IS NOT NULL AND v_option_id_str <> '' THEN
            v_opt_id_arr := string_to_array(v_option_id_str, ',');
            v_primary_option_id := v_opt_id_arr[1]::UUID;

            FOR v_single_opt_id IN SELECT unnest(v_opt_id_arr)::UUID
            LOOP
                SELECT price, stock_quantity INTO v_opt_price, v_current_stock
                FROM public.product_options
                WHERE id = v_single_opt_id AND product_id = v_product_id;

                IF NOT FOUND THEN
                    RAISE EXCEPTION 'Product option not found: % / %', v_product_id, v_single_opt_id;
                END IF;

                IF v_current_stock < v_quantity THEN
                    RAISE EXCEPTION 'Insufficient stock for option % (requested: %, available: %)', v_single_opt_id, v_quantity, v_current_stock;
                END IF;

                v_item_unit_price := v_item_unit_price + v_opt_price;
            END LOOP;
        ELSE
            IF v_current_stock < v_quantity THEN
                RAISE EXCEPTION 'Insufficient stock for product % (requested: %, available: %)', v_product_id, v_quantity, v_current_stock;
            END IF;
        END IF;

        v_total_amount := v_total_amount + (v_item_unit_price * v_quantity);
    END LOOP;

    -- Insert Order
    INSERT INTO public.orders (
        id, order_no, user_id, total_amount, status, 
        receiver_name, phone, address, detail_address, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), v_order_no, p_user_id, v_total_amount, 'PAID',
        p_receiver_name, p_phone, p_address, p_detail_address, now(), now()
    )
    RETURNING id INTO v_order_id;

    -- Second pass: insert order items and decrement stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_option_id_str := v_item->>'option_id';
        v_quantity := (v_item->>'quantity')::INT;

        SELECT price INTO v_base_price FROM public.products WHERE id = v_product_id;
        v_item_unit_price := v_base_price;
        v_primary_option_id := NULL;

        IF v_option_id_str IS NOT NULL AND v_option_id_str <> '' THEN
            v_opt_id_arr := string_to_array(v_option_id_str, ',');
            v_primary_option_id := v_opt_id_arr[1]::UUID;

            FOR v_single_opt_id IN SELECT unnest(v_opt_id_arr)::UUID
            LOOP
                SELECT price INTO v_opt_price FROM public.product_options WHERE id = v_single_opt_id;
                v_item_unit_price := v_item_unit_price + v_opt_price;

                UPDATE public.product_options
                SET stock_quantity = stock_quantity - v_quantity, updated_at = now()
                WHERE id = v_single_opt_id;
            END LOOP;
        ELSE
            UPDATE public.products
            SET stock_quantity = stock_quantity - v_quantity, updated_at = now()
            WHERE id = v_product_id;
        END IF;

        INSERT INTO public.order_items (
            id, order_id, product_id, option_id, quantity, price, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_order_id, v_product_id, v_primary_option_id::text, v_quantity, v_item_unit_price, now(), now()
        );
    END LOOP;

    -- Clear user cart items that were ordered
    DELETE FROM public.cart_items ci
    WHERE ci.user_id = p_user_id
      AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(p_items) item
          WHERE (item->>'product_id')::UUID = ci.product_id
            AND (
                (item->>'option_id' IS NULL AND (ci.option_id IS NULL OR ci.option_id = ''))
                OR (item->>'option_id' = ci.option_id)
            )
      );

    RETURN v_order_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_order_atomic(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_atomic(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;

-- 4. Seed and Ensure Precise Product-Specific Options (Laptop vs Smartphone vs Furniture vs Apparel)
DO $$
DECLARE
    r RECORD;
    cat_name TEXT;
    prod_name TEXT;
BEGIN
    FOR r IN 
        SELECT p.id, p.name as product_name, c.name as category_name 
        FROM public.products p 
        LEFT JOIN public.categories c ON p.category_id = c.id
    LOOP
        cat_name := COALESCE(r.category_name, '');
        prod_name := COALESCE(r.product_name, '');
        
        -- Reset options for this product to ensure proper mapping
        DELETE FROM public.product_options WHERE product_id = r.id;

        -- 1. Laptops / PCs / High-end Electronics: CPU, RAM, GPU, 용량, 색상
        IF prod_name LIKE '%노트북%' OR prod_name LIKE '%맥북%' OR prod_name LIKE '%PC%' OR cat_name LIKE '%컴퓨터%' THEN
            INSERT INTO public.product_options (id, product_id, option_type, option_name, additional_price, stock_quantity, created_at, updated_at)
            VALUES 
                (gen_random_uuid(), r.id, 'CPU', 'Intel Core i5', 0, 50, now(), now()),
                (gen_random_uuid(), r.id, 'CPU', 'Intel Core i7', 150000, 30, now(), now()),
                (gen_random_uuid(), r.id, 'RAM', '16GB', 0, 50, now(), now()),
                (gen_random_uuid(), r.id, 'RAM', '32GB', 100000, 20, now(), now()),
                (gen_random_uuid(), r.id, 'GPU', 'RTX 4060', 0, 40, now(), now()),
                (gen_random_uuid(), r.id, 'GPU', 'RTX 4070', 250000, 15, now(), now()),
                (gen_random_uuid(), r.id, '용량', '512GB SSD', 0, 60, now(), now()),
                (gen_random_uuid(), r.id, '용량', '1TB SSD', 120000, 30, now(), now()),
                (gen_random_uuid(), r.id, '색상', 'Space Gray', 0, 50, now(), now()),
                (gen_random_uuid(), r.id, '색상', 'Silver', 0, 40, now(), now());

        -- 2. Smartphones / Tablets: 용량, 색상
        ELSIF prod_name LIKE '%스마트폰%' OR prod_name LIKE '%태블릿%' OR prod_name LIKE '%갤럭시%' OR prod_name LIKE '%아이폰%' OR cat_name LIKE '%모바일%' THEN
            INSERT INTO public.product_options (id, product_id, option_type, option_name, additional_price, stock_quantity, created_at, updated_at)
            VALUES 
                (gen_random_uuid(), r.id, '용량', '128GB', 0, 50, now(), now()),
                (gen_random_uuid(), r.id, '용량', '256GB', 150000, 30, now(), now()),
                (gen_random_uuid(), r.id, '색상', 'Phantom Black', 0, 40, now(), now()),
                (gen_random_uuid(), r.id, '색상', 'Cream', 0, 40, now(), now());

        -- 3. Apparel / Clothing: 색상, 의류사이즈
        ELSIF cat_name LIKE '%의류%' OR cat_name LIKE '%패션%' OR cat_name LIKE '%의잡%' OR cat_name LIKE '%남성%' OR cat_name LIKE '%여성%' OR prod_name LIKE '%티셔츠%' OR prod_name LIKE '%셔츠%' OR prod_name LIKE '%바지%' OR prod_name LIKE '%팬츠%' OR prod_name LIKE '%후드%' OR prod_name LIKE '%자켓%' OR prod_name LIKE '%코트%' THEN
            INSERT INTO public.product_options (id, product_id, option_type, option_name, additional_price, stock_quantity, created_at, updated_at)
            VALUES 
                (gen_random_uuid(), r.id, '색상', 'Black', 0, 100, now(), now()),
                (gen_random_uuid(), r.id, '색상', 'White', 0, 100, now(), now()),
                (gen_random_uuid(), r.id, '색상', 'Navy', 0, 80, now(), now()),
                (gen_random_uuid(), r.id, '색상', 'Gray', 0, 80, now(), now()),
                (gen_random_uuid(), r.id, '의류사이즈', 'S (90)', 0, 50, now(), now()),
                (gen_random_uuid(), r.id, '의류사이즈', 'M (95)', 0, 80, now(), now()),
                (gen_random_uuid(), r.id, '의류사이즈', 'L (100)', 0, 100, now(), now()),
                (gen_random_uuid(), r.id, '의류사이즈', 'XL (105)', 0, 60, now(), now());

        -- 4. Furniture / Bedding (가구/침구): 색상, 소재, 사이즈
        ELSIF cat_name LIKE '%리빙%' OR cat_name LIKE '%인테리어%' OR cat_name LIKE '%가구%' OR cat_name LIKE '%침구%' OR prod_name LIKE '%침대%' OR prod_name LIKE '%매트리스%' OR prod_name LIKE '%소파%' OR prod_name LIKE '%식탁%' OR prod_name LIKE '%협탁%' OR prod_name LIKE '%거실장%' THEN
            INSERT INTO public.product_options (id, product_id, option_type, option_name, additional_price, stock_quantity, created_at, updated_at)
            VALUES 
                (gen_random_uuid(), r.id, '색상', '내추럴우드', 0, 30, now(), now()),
                (gen_random_uuid(), r.id, '색상', '웜그레이', 0, 30, now(), now()),
                (gen_random_uuid(), r.id, '소재', '패브릭', 0, 25, now(), now()),
                (gen_random_uuid(), r.id, '소재', '천연가죽', 150000, 15, now(), now()),
                (gen_random_uuid(), r.id, '사이즈', 'Standard (Q)', 0, 20, now(), now()),
                (gen_random_uuid(), r.id, '사이즈', 'Large (K)', 100000, 10, now(), now());

        -- 5. Default / Others
        ELSE
            INSERT INTO public.product_options (id, product_id, option_type, option_name, additional_price, stock_quantity, created_at, updated_at)
            VALUES 
                (gen_random_uuid(), r.id, '색상', '기본', 0, 100, now(), now()),
                (gen_random_uuid(), r.id, '사이즈', 'Standard', 0, 100, now(), now());
        END IF;
    END LOOP;
END;
$$;
