BEGIN;

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

    DELETE FROM public.cart_items
     WHERE user_id = p_auth_user_id::text;

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
       SET user_id = 'withdrawn:' || gen_random_uuid()::text,
           updated_at = now()
     WHERE user_id = p_auth_user_id::text;

    UPDATE public.product_qnas
       SET user_id = 'withdrawn:' || gen_random_uuid()::text,
           updated_at = now()
     WHERE user_id = p_auth_user_id::text;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.anonymize_customer_account(uuid)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.anonymize_customer_account(uuid)
    TO service_role;

COMMIT;
