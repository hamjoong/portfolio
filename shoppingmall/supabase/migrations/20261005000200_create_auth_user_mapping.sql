-- Draft Auth-to-legacy mapping with a two-step, one-time link token.
-- Only a trusted Edge Function using the Supabase server secret can call the
-- RPCs. Draft only: review against the live Supabase/Postgres schema and use
-- a staged, rollback-ready production rollout before enabling account linking.

BEGIN;

CREATE TABLE IF NOT EXISTS public.auth_user_mappings (
    auth_user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    legacy_user_id uuid NOT NULL UNIQUE REFERENCES public.users (id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT auth_user_mappings_distinct_ids CHECK (auth_user_id <> legacy_user_id)
);

CREATE TABLE IF NOT EXISTS public.auth_account_link_tokens (
    token_hash bytea PRIMARY KEY,
    auth_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    legacy_user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    consumed_at timestamptz,
    consumed_by_auth_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.auth_account_link_rate_limits (
    subject_hash bytea PRIMARY KEY,
    window_started_at timestamptz NOT NULL,
    attempts smallint NOT NULL CHECK (attempts BETWEEN 1 AND 6)
);

CREATE INDEX IF NOT EXISTS auth_account_link_tokens_legacy_user_idx
    ON public.auth_account_link_tokens (legacy_user_id);
CREATE INDEX IF NOT EXISTS auth_account_link_tokens_expiry_idx
    ON public.auth_account_link_tokens (expires_at);
CREATE INDEX IF NOT EXISTS auth_account_link_rate_limits_window_idx
    ON public.auth_account_link_rate_limits (window_started_at);

DROP FUNCTION IF EXISTS public.issue_auth_account_link_token(uuid, uuid, bytea, timestamptz);

ALTER TABLE public.auth_user_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_account_link_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_account_link_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.auth_user_mappings FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON TABLE public.auth_account_link_tokens FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON TABLE public.auth_account_link_rate_limits FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.consume_auth_account_link_start_attempt(p_subject_hash bytea)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    attempt_count smallint;
    window_start timestamptz;
BEGIN
    IF p_subject_hash IS NULL OR octet_length(p_subject_hash) <> 32 THEN
        RAISE EXCEPTION 'invalid rate limit key' USING ERRCODE = '22023';
    END IF;

    DELETE FROM public.auth_account_link_rate_limits
     WHERE window_started_at < now() - interval '1 day';

    INSERT INTO public.auth_account_link_rate_limits AS current_limit (subject_hash, window_started_at, attempts)
    VALUES (p_subject_hash, now(), 1)
    ON CONFLICT (subject_hash) DO UPDATE
       SET window_started_at = CASE
               WHEN current_limit.window_started_at < now() - interval '15 minutes'
               THEN now() ELSE current_limit.window_started_at END,
           attempts = CASE
               WHEN current_limit.window_started_at < now() - interval '15 minutes'
               THEN 1 ELSE least(current_limit.attempts + 1, 6) END
    RETURNING attempts, window_started_at INTO attempt_count, window_start;

    RETURN attempt_count <= 5 AND window_start >= now() - interval '15 minutes';
END;
$$;

-- Called only after the Edge Function authenticated the Supabase user.
CREATE OR REPLACE FUNCTION public.issue_auth_account_link_token(
    p_auth_user_id uuid,
    p_token_hash bytea,
    p_expires_at timestamptz
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    auth_email text;
    legacy_id uuid;
    legacy_email text;
    legacy_status text;
    legacy_role text;
BEGIN
    IF p_token_hash IS NULL OR octet_length(p_token_hash) <> 32
       OR p_expires_at <= now() OR p_expires_at > now() + interval '15 minutes' THEN
        RAISE EXCEPTION 'invalid link token parameters' USING ERRCODE = '22023';
    END IF;

    SELECT lower(btrim(u.email))
      INTO auth_email
      FROM auth.users AS u
     WHERE u.id = p_auth_user_id
       AND u.email_confirmed_at IS NOT NULL;

    IF auth_email IS NULL THEN
        RAISE EXCEPTION 'verified Auth email required' USING ERRCODE = '42501';
    END IF;

    SELECT u.id, lower(btrim(u.email)), upper(btrim(u.status)), upper(btrim(u.role))
      INTO STRICT legacy_id, legacy_email, legacy_status, legacy_role
      FROM public.users AS u
     WHERE lower(btrim(u.email)) = auth_email
     FOR UPDATE;

    IF legacy_id IS NULL OR auth_email <> legacy_email THEN
        RAISE EXCEPTION 'verified email has no unique legacy account' USING ERRCODE = '42501';
    END IF;

    IF legacy_status IS DISTINCT FROM 'ACTIVE'
       OR legacy_role IS NULL
       OR legacy_role NOT IN ('USER', 'ROLE_USER') THEN
        RAISE EXCEPTION 'legacy account is not eligible for self-service linking' USING ERRCODE = '42501';
    END IF;

    PERFORM pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(legacy_id::text, 0)
    );

    IF EXISTS (
        SELECT 1 FROM public.auth_user_mappings AS m
         WHERE m.auth_user_id = p_auth_user_id OR m.legacy_user_id = legacy_id
    ) THEN
        RAISE EXCEPTION 'account is already linked' USING ERRCODE = '23505';
    END IF;

    -- A newly issued token invalidates previous outstanding tokens for this account.
    DELETE FROM public.auth_account_link_tokens
     WHERE expires_at <= now() OR consumed_at < now() - interval '1 day';

    DELETE FROM public.auth_account_link_tokens
     WHERE legacy_user_id = legacy_id;

    INSERT INTO public.auth_account_link_tokens (token_hash, auth_user_id, legacy_user_id, expires_at)
    VALUES (p_token_hash, p_auth_user_id, legacy_id, p_expires_at);
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_auth_account_link(
    p_auth_user_id uuid,
    p_token_hash bytea
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    auth_email text;
    legacy_email text;
    legacy_status text;
    legacy_role text;
    legacy_id uuid;
    token_consumed_at timestamptz;
    token_consumer uuid;
BEGIN
    IF p_auth_user_id IS NULL OR p_token_hash IS NULL OR octet_length(p_token_hash) <> 32 THEN
        RAISE EXCEPTION 'invalid link token' USING ERRCODE = '22023';
    END IF;

    SELECT lower(btrim(u.email))
      INTO auth_email
      FROM auth.users AS u
     WHERE u.id = p_auth_user_id
       AND u.email_confirmed_at IS NOT NULL;

    IF auth_email IS NULL THEN
        RAISE EXCEPTION 'verified Auth email required' USING ERRCODE = '42501';
    END IF;

    SELECT t.legacy_user_id, t.consumed_at, t.consumed_by_auth_user_id
      INTO legacy_id, token_consumed_at, token_consumer
      FROM public.auth_account_link_tokens AS t
     WHERE t.token_hash = p_token_hash
       AND t.auth_user_id = p_auth_user_id
       AND t.expires_at > now()
     FOR UPDATE;

    IF legacy_id IS NULL THEN
        RAISE EXCEPTION 'invalid, expired, or consumed link token' USING ERRCODE = 'P0002';
    END IF;

    PERFORM pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(legacy_id::text, 0)
    );

    -- Re-read after acquiring the account lock. A concurrent start may have
    -- replaced this token while this request waited.
    SELECT t.legacy_user_id, t.consumed_at, t.consumed_by_auth_user_id
      INTO legacy_id, token_consumed_at, token_consumer
      FROM public.auth_account_link_tokens AS t
     WHERE t.token_hash = p_token_hash
       AND t.auth_user_id = p_auth_user_id
       AND t.expires_at > now()
     FOR UPDATE;

    IF legacy_id IS NULL THEN
        RAISE EXCEPTION 'invalid, expired, or consumed link token' USING ERRCODE = 'P0002';
    END IF;

    IF token_consumed_at IS NOT NULL THEN
        IF token_consumer = p_auth_user_id AND EXISTS (
            SELECT 1 FROM public.auth_user_mappings AS m
             WHERE m.auth_user_id = p_auth_user_id AND m.legacy_user_id = legacy_id
        ) THEN
            RETURN legacy_id;
        END IF;
        RAISE EXCEPTION 'link token already consumed' USING ERRCODE = 'P0002';
    END IF;

    SELECT lower(btrim(u.email)), upper(btrim(u.status)), upper(btrim(u.role))
      INTO legacy_email, legacy_status, legacy_role
      FROM public.users AS u
     WHERE u.id = legacy_id;

    IF auth_email <> legacy_email THEN
        RAISE EXCEPTION 'verified Auth email does not match legacy account' USING ERRCODE = '42501';
    END IF;

    IF legacy_status IS DISTINCT FROM 'ACTIVE'
       OR legacy_role IS NULL
       OR legacy_role NOT IN ('USER', 'ROLE_USER') THEN
        RAISE EXCEPTION 'legacy account is not eligible for self-service linking' USING ERRCODE = '42501';
    END IF;

    INSERT INTO public.auth_user_mappings (auth_user_id, legacy_user_id)
    VALUES (p_auth_user_id, legacy_id)
    ON CONFLICT (auth_user_id) DO NOTHING;

    IF NOT EXISTS (
        SELECT 1
          FROM public.auth_user_mappings AS m
         WHERE m.auth_user_id = p_auth_user_id
           AND m.legacy_user_id = legacy_id
    ) THEN
        RAISE EXCEPTION 'Auth identity is already linked to another legacy account' USING ERRCODE = '23505';
    END IF;

    UPDATE public.auth_account_link_tokens
       SET consumed_at = now(), consumed_by_auth_user_id = p_auth_user_id
     WHERE token_hash = p_token_hash
       AND consumed_at IS NULL;

    RETURN legacy_id;
END;
$$;

REVOKE ALL ON FUNCTION public.issue_auth_account_link_token(uuid, bytea, timestamptz)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_auth_account_link(uuid, bytea)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_auth_account_link_start_attempt(bytea)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.issue_auth_account_link_token(uuid, bytea, timestamptz)
    TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_auth_account_link(uuid, bytea)
    TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_auth_account_link_start_attempt(bytea)
    TO service_role;

COMMENT ON TABLE public.auth_user_mappings IS
    'Server-only mapping between Supabase Auth UUIDs and preserved legacy public.users UUIDs.';
COMMENT ON TABLE public.auth_account_link_tokens IS
    'Short-lived SHA-256 token hashes for verified legacy account linking; raw tokens are never stored.';
COMMENT ON TABLE public.auth_account_link_rate_limits IS
    'Rate limit counters keyed only by a server-HMACed Auth subject, never by email or raw user ID.';
COMMENT ON FUNCTION public.issue_auth_account_link_token(uuid, bytea, timestamptz) IS
    'Internal service-role RPC. Match a verified Supabase Auth email to one active legacy user; never accept a client-supplied legacy ID.';
COMMENT ON FUNCTION public.complete_auth_account_link(uuid, bytea) IS
    'Internal service-role RPC. Call only after auth.getUser validates the caller Supabase JWT.';

COMMIT;
