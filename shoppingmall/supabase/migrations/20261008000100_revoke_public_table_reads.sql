-- 공개 키(anon/authenticated)로 테이블을 직접 읽는 경로를 닫는다.
-- Why: 모든 읽기는 Edge Function(service_role)을 거치며 작성자 ID(user_id)·order_id·숨김 상품은
--      함수가 걸러서 내보낸다. 공개 SELECT가 열려 있으면 REST 직접 조회로 이 필터를 우회할 수 있다.
--      프런트엔드는 supabase-js로 테이블을 직접 읽지 않으므로 앱 동작에는 영향이 없다.
-- 이미 적용된 20261005000400은 수정하지 않고 이 파일에서 되돌린다.
BEGIN;

DROP POLICY IF EXISTS "Allow public read products" ON public.products;
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public read product_options" ON public.product_options;
DROP POLICY IF EXISTS "Allow public read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public read product_qnas" ON public.product_qnas;

REVOKE SELECT ON TABLE
  public.products,
  public.categories,
  public.product_options,
  public.reviews,
  public.product_qnas
FROM anon, authenticated;

COMMIT;
