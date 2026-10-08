-- SECURITY CONTAINMENT for the legacy Spring API schema.
-- Run only after confirming Render connects as the database owner (normally
-- `postgres`) or another BYPASSRLS role. Never run with the application's
-- runtime role if it is `anon` or `authenticated`.
--
-- The current web repository clients call the Render API, not the
-- Supabase Data API directly. This intentionally blocks direct anon and
-- authenticated access to legacy tables until reviewed RLS policies and
-- Edge Function APIs are ready. The table owner and service_role retain
-- their existing access; do not add FORCE ROW LEVEL SECURITY here.

BEGIN;

REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public
FROM PUBLIC, anon, authenticated;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'addresses',
    'cart_items',
    'categories',
    'order_items',
    'orders',
    'outbox_events',
    'product_options',
    'product_qnas',
    'products',
    'reviews',
    'social_accounts',
    'user_profiles',
    'users'
  ]
  LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM PUBLIC, anon, authenticated', table_name);
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    END IF;
  END LOOP;
END;
$$;

COMMIT;
