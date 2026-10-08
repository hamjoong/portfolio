-- 1. 장바구니 조회 및 관리 함수 (text와 uuid 타입 불일치 방지 캐스팅 적용)
CREATE OR REPLACE FUNCTION public.get_or_sync_cart(p_user_id TEXT)
RETURNS SETOF public.cart_items
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.cart_items
  WHERE user_id = p_user_id;
END;
$$;

-- 2. 원자적 주문 생성 및 재고 차감 RPC
CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_user_id TEXT,
  p_items JSONB, -- [{ productId, optionId, quantity, price }]
  p_shipping_info JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_product_id UUID;
  v_option_id UUID;
  v_quantity INT;
  v_price NUMERIC;
  v_stock INT;
BEGIN
  -- 주문 헤더 생성
  INSERT INTO public.orders (id, user_id, status, total_price, recipient_name, recipient_phone, postal_code, address, detail_address, memo, created_at)
  VALUES (
    gen_random_uuid(),
    p_user_id,
    'PENDING',
    0,
    p_shipping_info->>'recipientName',
    p_shipping_info->>'recipientPhone',
    p_shipping_info->>'postalCode',
    p_shipping_info->>'address',
    p_shipping_info->>'detailAddress',
    p_shipping_info->>'memo',
    NOW()
  )
  RETURNING id INTO v_order_id;

  -- 주문 항목 순회 및 재고 차감 (uuid형 변환 명시)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'productId')::UUID;
    v_option_id := CASE WHEN v_item->>'optionId' IS NOT NULL AND v_item->>'optionId' <> '' THEN (v_item->>'optionId')::UUID ELSE NULL END;
    v_quantity := (v_item->>'quantity')::INT;
    v_price := (v_item->>'price')::NUMERIC;

    -- 재고 확인 및 차감 (옵션이 있는 경우 옵션 재고, 없는 경우 상품 재고)
    IF v_option_id IS NOT NULL THEN
      SELECT stock INTO v_stock FROM public.product_options WHERE id = v_option_id FOR UPDATE;
      IF v_stock < v_quantity THEN
        RAISE EXCEPTION '재고가 부족합니다. (상품 ID: %, 옵션 ID: %)', v_product_id, v_option_id;
      END IF;
      UPDATE public.product_options SET stock = stock - v_quantity WHERE id = v_option_id;
    ELSE
      SELECT stock INTO v_stock FROM public.products WHERE id = v_product_id FOR UPDATE;
      IF v_stock < v_quantity THEN
        RAISE EXCEPTION '재고가 부족합니다. (상품 ID: %)', v_product_id;
      END IF;
      UPDATE public.products SET stock = stock - v_quantity WHERE id = v_product_id;
    END IF;

    -- 주문 항목(OrderItem) 등록
    INSERT INTO public.order_items (id, order_id, product_id, option_id, quantity, price, created_at)
    VALUES (gen_random_uuid(), v_order_id, v_product_id, v_option_id, v_quantity, v_price, NOW());
  END LOOP;

  -- 장바구니 비우기 (text 비교 캐스팅)
  DELETE FROM public.cart_items WHERE user_id = p_user_id;

  RETURN v_order_id;
END;
$$;
