-- 로컬 Postgres에서 마이그레이션을 적용하기 위한 최소 Supabase 스텁 (테스트 전용, 운영 DB에는 적용하지 않는다).
-- 실제 Supabase가 제공하는 역할·auth 스키마·extensions 스키마 중 마이그레이션이 참조하는 것만 흉내 낸다.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;

CREATE SCHEMA auth;
CREATE SCHEMA extensions;
GRANT USAGE ON SCHEMA auth, extensions TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

CREATE TABLE auth.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text,
    created_at timestamptz NOT NULL DEFAULT now(),
    last_sign_in_at timestamptz,
    raw_user_meta_data jsonb
);

-- 동시 실행 테스트용 래퍼: 주문 함수의 오류를 잡아 SQLSTATE별로 기록한다(pgbench는 오류가 나면 클라이언트를 중단하므로).
-- 정상 주문은 'OK'로 기록한다. 래퍼는 create_order_atomic을 그대로 호출할 뿐 재고 로직을 바꾸지 않는다.
CREATE TABLE public.test_order_results (sqlstate text NOT NULL, message text);
CREATE FUNCTION public.test_try_order(p_user text, p_items jsonb) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    PERFORM public.create_order_atomic(p_user, '홍길동', '01000000000', '서울', '101호', p_items);
    INSERT INTO public.test_order_results VALUES ('OK', NULL);
EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.test_order_results VALUES (SQLSTATE, SQLERRM);
END;
$$;

-- Supabase의 auth.role()/auth.uid()는 요청 JWT 클레임을 세션 설정에서 읽는다. 같은 방식으로 흉내 낸다.
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
    SELECT nullif(current_setting('request.jwt.claim.role', true), '')
$$;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
    SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
