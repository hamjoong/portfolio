BEGIN;

CREATE OR REPLACE FUNCTION public.admin_dashboard_stats(p_auth_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    total_orders bigint;
    total_sales numeric(14, 2);
    total_users bigint;
    total_products bigint;
BEGIN
    IF auth.role() IS DISTINCT FROM 'service_role' THEN
        RAISE EXCEPTION 'service role required' USING ERRCODE = '42501';
    END IF;
    IF p_auth_user_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM public.admin_users WHERE auth_user_id = p_auth_user_id
    ) THEN
        RAISE EXCEPTION 'administrator authorization required' USING ERRCODE = '42501';
    END IF;

    SELECT count(*) INTO total_orders FROM public.orders;
    SELECT COALESCE(sum(total_amount), 0)
      INTO total_sales
      FROM public.orders
     WHERE status <> 'CANCELLED';
    SELECT count(*) INTO total_users FROM auth.users;
    SELECT count(*) INTO total_products FROM public.products;

    RETURN jsonb_build_object(
        'totalOrders', total_orders,
        'totalSales', total_sales,
        'totalUsers', total_users,
        'totalProducts', total_products
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_dashboard_stats(uuid)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_stats(uuid)
    TO service_role;

COMMIT;
