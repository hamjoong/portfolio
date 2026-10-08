-- Supabase Dashboard > SQL Editor, after applying the mapping draft in a
-- disposable development project. Read-only metadata checks; no row data.
-- Run as the project database owner. This does not prove the SECURITY DEFINER
-- RPCs work under service_role JWTs; test start/complete actions separately.

SELECT jsonb_pretty(jsonb_build_object(
  'table', (
    SELECT jsonb_build_object(
      'exists', c.oid IS NOT NULL,
      'rls_enabled', coalesce(c.relrowsecurity, false),
      'force_rls', coalesce(c.relforcerowsecurity, false)
    )
    FROM (SELECT to_regclass('public.auth_user_mappings') AS oid) t
    LEFT JOIN pg_class c ON c.oid = t.oid
  ),
  'table_privileges', (
    SELECT coalesce(jsonb_object_agg(role_name, privileges), '{}'::jsonb)
    FROM (
      SELECT r.rolname AS role_name,
             jsonb_build_object(
               'select', CASE WHEN to_regrole(r.rolname) IS NULL THEN false ELSE has_table_privilege(r.rolname, 'public.auth_user_mappings', 'SELECT') END,
               'insert', CASE WHEN to_regrole(r.rolname) IS NULL THEN false ELSE has_table_privilege(r.rolname, 'public.auth_user_mappings', 'INSERT') END,
               'update', CASE WHEN to_regrole(r.rolname) IS NULL THEN false ELSE has_table_privilege(r.rolname, 'public.auth_user_mappings', 'UPDATE') END,
               'delete', CASE WHEN to_regrole(r.rolname) IS NULL THEN false ELSE has_table_privilege(r.rolname, 'public.auth_user_mappings', 'DELETE') END
             ) AS privileges
      FROM pg_roles r
      WHERE r.rolname IN ('anon', 'authenticated', 'service_role')
    ) p
  ),
  'token_table_privileges', (
    SELECT coalesce(jsonb_object_agg(role_name, privileges), '{}'::jsonb)
    FROM (
      SELECT r.rolname AS role_name,
             jsonb_build_object(
               'select', CASE WHEN to_regrole(r.rolname) IS NULL THEN false ELSE has_table_privilege(r.rolname, 'public.auth_account_link_tokens', 'SELECT') END,
               'insert', CASE WHEN to_regrole(r.rolname) IS NULL THEN false ELSE has_table_privilege(r.rolname, 'public.auth_account_link_tokens', 'INSERT') END,
               'update', CASE WHEN to_regrole(r.rolname) IS NULL THEN false ELSE has_table_privilege(r.rolname, 'public.auth_account_link_tokens', 'UPDATE') END,
               'delete', CASE WHEN to_regrole(r.rolname) IS NULL THEN false ELSE has_table_privilege(r.rolname, 'public.auth_account_link_tokens', 'DELETE') END
             ) AS privileges
      FROM pg_roles r
      WHERE r.rolname IN ('anon', 'authenticated', 'service_role')
    ) p
  ),
  'rate_limit_table_privileges', (
    SELECT coalesce(jsonb_object_agg(role_name, privileges), '{}'::jsonb)
    FROM (
      SELECT r.rolname AS role_name,
             jsonb_build_object(
               'select', has_table_privilege(r.rolname, 'public.auth_account_link_rate_limits', 'SELECT'),
               'insert', has_table_privilege(r.rolname, 'public.auth_account_link_rate_limits', 'INSERT'),
               'update', has_table_privilege(r.rolname, 'public.auth_account_link_rate_limits', 'UPDATE'),
               'delete', has_table_privilege(r.rolname, 'public.auth_account_link_rate_limits', 'DELETE')
             ) AS privileges
      FROM pg_roles r
      WHERE r.rolname IN ('anon', 'authenticated', 'service_role')
    ) p
  ),
  'function_privileges', (
    SELECT coalesce(jsonb_object_agg(role_name, can_execute), '{}'::jsonb)
    FROM (
      SELECT r.rolname AS role_name,
             jsonb_build_object(
               'issue_token', has_function_privilege(r.rolname, 'public.issue_auth_account_link_token(uuid,bytea,timestamptz)', 'EXECUTE'),
               'complete_link', has_function_privilege(r.rolname, 'public.complete_auth_account_link(uuid,bytea)', 'EXECUTE'),
               'rate_limit', has_function_privilege(r.rolname, 'public.consume_auth_account_link_start_attempt(bytea)', 'EXECUTE')
             ) AS can_execute
      FROM pg_roles r
      WHERE r.rolname IN ('anon', 'authenticated', 'service_role')
    ) f
  ),
  'token_table', (
    SELECT jsonb_build_object(
      'exists', c.oid IS NOT NULL,
      'rls_enabled', coalesce(c.relrowsecurity, false),
      'force_rls', coalesce(c.relforcerowsecurity, false)
    )
    FROM (SELECT to_regclass('public.auth_account_link_tokens') AS oid) t
    LEFT JOIN pg_class c ON c.oid = t.oid
  ),
  'policies', (
    SELECT count(*)
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('auth_user_mappings', 'auth_account_link_tokens', 'auth_account_link_rate_limits')
  )
)) AS auth_mapping_security_verification;
