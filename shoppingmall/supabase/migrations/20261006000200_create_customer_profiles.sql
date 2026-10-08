BEGIN;

CREATE TABLE IF NOT EXISTS public.customer_profiles (
    auth_user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    full_name text NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 1 AND 120),
    phone_number text NOT NULL CHECK (phone_number ~ '^[0-9]{10,12}$'),
    address text NOT NULL CHECK (char_length(btrim(address)) BETWEEN 5 AND 300),
    detail_address text NOT NULL CHECK (char_length(btrim(detail_address)) BETWEEN 1 AND 200),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    address_name text NOT NULL CHECK (char_length(btrim(address_name)) BETWEEN 1 AND 80),
    receiver_name text NOT NULL CHECK (char_length(btrim(receiver_name)) BETWEEN 1 AND 120),
    phone_number text NOT NULL CHECK (phone_number ~ '^[0-9]{10,12}$'),
    zip_code text NOT NULL CHECK (char_length(btrim(zip_code)) BETWEEN 1 AND 20),
    base_address text NOT NULL CHECK (char_length(btrim(base_address)) BETWEEN 1 AND 300),
    detail_address text NOT NULL CHECK (char_length(btrim(detail_address)) BETWEEN 1 AND 200),
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customer_addresses_owner_idx
    ON public.customer_addresses (auth_user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS customer_addresses_one_default_per_user_idx
    ON public.customer_addresses (auth_user_id)
    WHERE is_default;

ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.customer_profiles FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.customer_profiles TO authenticated;
REVOKE ALL ON TABLE public.customer_addresses FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.customer_addresses TO authenticated;

DROP POLICY IF EXISTS "Users can manage their own customer profile" ON public.customer_profiles;
CREATE POLICY "Users can manage their own customer profile"
    ON public.customer_profiles
    FOR ALL
    TO authenticated
    USING (auth_user_id = (SELECT auth.uid()))
    WITH CHECK (auth_user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own customer addresses" ON public.customer_addresses;
CREATE POLICY "Users can manage their own customer addresses"
    ON public.customer_addresses
    FOR ALL
    TO authenticated
    USING (auth_user_id = (SELECT auth.uid()))
    WITH CHECK (auth_user_id = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION public.create_customer_address(
    p_address_name text,
    p_receiver_name text,
    p_phone_number text,
    p_zip_code text,
    p_base_address text,
    p_detail_address text,
    p_is_default boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    current_user_id uuid := auth.uid();
BEGIN
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501';
    END IF;

    IF p_is_default THEN
        PERFORM pg_catalog.pg_advisory_xact_lock(
            pg_catalog.hashtextextended(current_user_id::text, 0)
        );
        UPDATE public.customer_addresses
           SET is_default = false, updated_at = now()
         WHERE auth_user_id = current_user_id
           AND is_default;
    END IF;

    INSERT INTO public.customer_addresses (
        auth_user_id, address_name, receiver_name, phone_number,
        zip_code, base_address, detail_address, is_default
    )
    VALUES (
        current_user_id, p_address_name, p_receiver_name, p_phone_number,
        p_zip_code, p_base_address, p_detail_address, p_is_default
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_customer_address(
    p_address_id uuid,
    p_address_name text,
    p_receiver_name text,
    p_phone_number text,
    p_zip_code text,
    p_base_address text,
    p_detail_address text,
    p_is_default boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    current_user_id uuid := auth.uid();
BEGIN
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501';
    END IF;

    IF p_is_default THEN
        PERFORM pg_catalog.pg_advisory_xact_lock(
            pg_catalog.hashtextextended(current_user_id::text, 0)
        );
    END IF;

    PERFORM 1
      FROM public.customer_addresses
     WHERE id = p_address_id
       AND auth_user_id = current_user_id
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'address not found' USING ERRCODE = 'P0002';
    END IF;

    IF p_is_default THEN
        UPDATE public.customer_addresses
           SET is_default = false, updated_at = now()
         WHERE auth_user_id = current_user_id
           AND is_default;
    END IF;

    UPDATE public.customer_addresses
       SET address_name = p_address_name,
           receiver_name = p_receiver_name,
           phone_number = p_phone_number,
           zip_code = p_zip_code,
           base_address = p_base_address,
           detail_address = p_detail_address,
           is_default = p_is_default,
           updated_at = now()
     WHERE id = p_address_id
       AND auth_user_id = current_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_customer_address(text, text, text, text, text, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_customer_address(text, text, text, text, text, text, boolean) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.update_customer_address(uuid, text, text, text, text, text, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_customer_address(uuid, text, text, text, text, text, text, boolean) TO authenticated;

COMMIT;
