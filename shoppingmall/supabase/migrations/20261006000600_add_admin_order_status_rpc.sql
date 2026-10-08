BEGIN;

CREATE OR REPLACE FUNCTION public.admin_update_order_status(
    p_auth_user_id uuid,
    p_order_id uuid,
    p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    current_order_status text;
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

    SELECT status
      INTO current_order_status
      FROM public.orders
     WHERE id = p_order_id
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'order not found' USING ERRCODE = 'P0002';
    END IF;

    IF current_order_status = 'CANCELLED' THEN
        RAISE EXCEPTION 'cancelled orders cannot be reopened' USING ERRCODE = '22023';
    END IF;

    IF p_status IS NULL
       OR p_status NOT IN ('PENDING', 'PAID', 'SHIPPED', 'COMPLETED') THEN
        RAISE EXCEPTION 'invalid order status; cancellation requires the refund and inventory-restoration flow'
            USING ERRCODE = '22023';
    END IF;

    UPDATE public.orders
       SET status = p_status,
           updated_at = now()
     WHERE id = p_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'order not found' USING ERRCODE = 'P0002';
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_update_order_status(uuid, uuid, text)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_order_status(uuid, uuid, text)
    TO service_role;

COMMIT;
