-- Read-only checks for a fresh project after applying all ordered migrations
-- through 20261006000700. Run before adding the first admin.
DO $$
DECLARE
    table_name text;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'users',
        'auth_user_mappings',
        'categories',
        'products',
        'product_options',
        'cart_items',
        'orders',
        'order_items',
        'reviews',
        'product_qnas',
        'customer_profiles',
        'customer_addresses',
        'admin_users'
    ]
    LOOP
        IF to_regclass(format('public.%I', table_name)) IS NULL THEN
            RAISE EXCEPTION 'required table is missing: public.%', table_name;
        END IF;
    END LOOP;

    FOREACH table_name IN ARRAY ARRAY[
        'products',
        'categories',
        'product_options',
        'cart_items',
        'orders',
        'order_items',
        'reviews',
        'product_qnas',
        'users',
        'auth_user_mappings',
        'customer_profiles',
        'customer_addresses',
        'admin_users'
    ]
    LOOP
        IF NOT (
            SELECT relrowsecurity
              FROM pg_class
             WHERE oid = format('public.%I', table_name)::regclass
        ) THEN
            RAISE EXCEPTION 'row-level security is not enabled: public.%', table_name;
        END IF;
    END LOOP;

    IF to_regprocedure('public.create_order_atomic(text,text,text,text,text,jsonb)') IS NULL THEN
        RAISE EXCEPTION 'Auth UID order RPC is missing';
    END IF;
    IF to_regprocedure('public.admin_save_product(uuid,uuid,jsonb)') IS NULL THEN
        RAISE EXCEPTION 'administrator product RPC is missing';
    END IF;
    IF to_regprocedure('public.admin_dashboard_stats(uuid)') IS NULL THEN
        RAISE EXCEPTION 'administrator stats RPC is missing';
    END IF;
    IF to_regprocedure('public.admin_update_order_status(uuid,uuid,text)') IS NULL THEN
        RAISE EXCEPTION 'administrator order status RPC is missing';
    END IF;
    IF to_regprocedure('public.anonymize_customer_account(uuid)') IS NULL THEN
        RAISE EXCEPTION 'customer account anonymization RPC is missing';
    END IF;
    IF has_function_privilege('anon', 'public.create_order_atomic(text,text,text,text,text,jsonb)', 'EXECUTE')
       OR has_function_privilege('authenticated', 'public.create_order_atomic(text,text,text,text,text,jsonb)', 'EXECUTE')
       OR NOT has_function_privilege('service_role', 'public.create_order_atomic(text,text,text,text,text,jsonb)', 'EXECUTE') THEN
        RAISE EXCEPTION 'Auth UID order RPC execution grants are too broad or incomplete';
    END IF;
    IF to_regprocedure('public.get_or_sync_cart(text)') IS NOT NULL
       OR to_regprocedure('public.create_order_atomic(text,jsonb,jsonb)') IS NOT NULL THEN
        RAISE EXCEPTION 'legacy cart/order RPC remains executable';
    END IF;
    IF has_table_privilege('anon', 'public.cart_items', 'SELECT')
       OR has_table_privilege('authenticated', 'public.cart_items', 'SELECT')
       OR has_table_privilege('anon', 'public.orders', 'SELECT')
       OR has_table_privilege('authenticated', 'public.orders', 'SELECT')
       OR has_table_privilege('anon', 'public.users', 'SELECT')
       OR has_table_privilege('authenticated', 'public.users', 'SELECT')
       OR has_table_privilege('anon', 'public.auth_user_mappings', 'SELECT')
       OR has_table_privilege('authenticated', 'public.auth_user_mappings', 'SELECT') THEN
        RAISE EXCEPTION 'private table grants are too broad';
    END IF;
    IF NOT has_table_privilege('service_role', 'public.cart_items', 'SELECT')
       OR NOT has_table_privilege('service_role', 'public.orders', 'SELECT')
       OR NOT has_table_privilege('anon', 'public.products', 'SELECT')
       OR NOT has_table_privilege('anon', 'public.categories', 'SELECT')
       OR NOT has_table_privilege('anon', 'public.product_options', 'SELECT') THEN
        RAISE EXCEPTION 'public catalog or service-role table grants are incorrect';
    END IF;
    IF has_function_privilege('anon', 'public.admin_save_product(uuid,uuid,jsonb)', 'EXECUTE')
       OR has_function_privilege('authenticated', 'public.admin_save_product(uuid,uuid,jsonb)', 'EXECUTE')
       OR NOT has_function_privilege('service_role', 'public.admin_save_product(uuid,uuid,jsonb)', 'EXECUTE') THEN
        RAISE EXCEPTION 'administrator product RPC execution grants are too broad or incomplete';
    END IF;
    IF has_function_privilege('anon', 'public.admin_dashboard_stats(uuid)', 'EXECUTE')
       OR has_function_privilege('authenticated', 'public.admin_dashboard_stats(uuid)', 'EXECUTE')
       OR NOT has_function_privilege('service_role', 'public.admin_dashboard_stats(uuid)', 'EXECUTE') THEN
        RAISE EXCEPTION 'administrator stats RPC execution grants are too broad or incomplete';
    END IF;
    IF has_function_privilege('anon', 'public.admin_update_order_status(uuid,uuid,text)', 'EXECUTE')
       OR has_function_privilege('authenticated', 'public.admin_update_order_status(uuid,uuid,text)', 'EXECUTE')
       OR NOT has_function_privilege('service_role', 'public.admin_update_order_status(uuid,uuid,text)', 'EXECUTE') THEN
        RAISE EXCEPTION 'administrator order status RPC execution grants are too broad or incomplete';
    END IF;
    IF has_function_privilege('anon', 'public.anonymize_customer_account(uuid)', 'EXECUTE')
       OR has_function_privilege('authenticated', 'public.anonymize_customer_account(uuid)', 'EXECUTE')
       OR NOT has_function_privilege('service_role', 'public.anonymize_customer_account(uuid)', 'EXECUTE') THEN
        RAISE EXCEPTION 'customer account anonymization RPC execution grants are too broad or incomplete';
    END IF;
    IF EXISTS (SELECT 1 FROM public.users)
       OR EXISTS (SELECT 1 FROM public.auth_user_mappings) THEN
        RAISE EXCEPTION 'legacy users or mappings were unexpectedly provisioned';
    END IF;
    IF EXISTS (SELECT 1 FROM public.admin_users) THEN
        RAISE EXCEPTION 'run baseline verification before bootstrapping the first administrator';
    END IF;
END;
$$;

SELECT 'Auth UID schema baseline checks passed' AS result;
