-- Supabase Dashboard > SQL Editor. Run after the lockdown migration.
-- Returns only policy/grant state, never table rows.

SELECT jsonb_pretty(jsonb_build_object(
  'tables', (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'table', c.relname,
      'rls_enabled', c.relrowsecurity,
      'anon_select', has_table_privilege('anon', c.oid, 'SELECT'),
      'anon_insert', has_table_privilege('anon', c.oid, 'INSERT'),
      'anon_update', has_table_privilege('anon', c.oid, 'UPDATE'),
      'anon_delete', has_table_privilege('anon', c.oid, 'DELETE'),
      'authenticated_select', has_table_privilege('authenticated', c.oid, 'SELECT'),
      'authenticated_insert', has_table_privilege('authenticated', c.oid, 'INSERT'),
      'authenticated_update', has_table_privilege('authenticated', c.oid, 'UPDATE'),
      'authenticated_delete', has_table_privilege('authenticated', c.oid, 'DELETE')
    ) ORDER BY c.relname), '[]'::jsonb)
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p')
      AND c.relname IN (
        'addresses', 'categories', 'order_items', 'orders', 'outbox_events',
        'product_options', 'product_qnas', 'products', 'reviews',
        'social_accounts', 'user_profiles', 'users'
      )
  ),
  'policies', (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'table', tablename,
      'name', policyname,
      'command', cmd,
      'roles', roles
    ) ORDER BY tablename, policyname), '[]'::jsonb)
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'addresses', 'categories', 'order_items', 'orders', 'outbox_events',
        'product_options', 'product_qnas', 'products', 'reviews',
        'social_accounts', 'user_profiles', 'users'
      )
  )
)) AS lockdown_verification;
