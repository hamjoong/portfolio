-- Run once in the new project's SQL Editor as the database owner, before
-- enabling AUTH_UID_ONLY. Replace the UUID with the verified first admin's
-- auth.users.id; never use user-editable app_metadata/user_metadata for this.
DO $bootstrap$
DECLARE
    target_admin_id uuid := '1c38901e-65af-4bb3-8686-d4bbbdcb6cc9';
BEGIN
    IF target_admin_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
        RAISE EXCEPTION 'replace target_admin_id with the verified Auth user UUID';
    END IF;

    PERFORM pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended('shoppingmall:first-admin-bootstrap', 0)
    );

    IF NOT EXISTS (
        SELECT 1
          FROM auth.users
         WHERE id = target_admin_id
           AND (banned_until IS NULL OR banned_until <= now())
    ) THEN
        RAISE EXCEPTION 'target Auth user does not exist or is currently banned';
    END IF;

    IF EXISTS (SELECT 1 FROM public.admin_users) THEN
        RAISE EXCEPTION 'admin_users is not empty; first-admin bootstrap is one-time only';
    END IF;

    INSERT INTO public.admin_users (auth_user_id)
    VALUES (target_admin_id);
END;
$bootstrap$;
