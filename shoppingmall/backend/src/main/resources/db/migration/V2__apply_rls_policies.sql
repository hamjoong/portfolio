-- [이유] Supabase RLS(Row Level Security) 정책을 수립하여 
-- 익명(anon) 사용자의 무분별한 데이터 접근을 차단하고 보안을 강화합니다.

-- 1. Product 스키마 정책
-- 상품 정보는 누구나 조회 가능 (SELECT)
DROP POLICY IF EXISTS "Allow public read-only access" ON product.products;
CREATE POLICY "Allow public read-only access" ON product.products 
FOR SELECT USING (true);

-- 카테고리 정보는 누구나 조회 가능 (SELECT)
DROP POLICY IF EXISTS "Allow public read-only access" ON product.categories;
CREATE POLICY "Allow public read-only access" ON product.categories 
FOR SELECT USING (true);

-- 상품 문의는 작성자만 조회 가능 (본인 글 비밀 보장 정책에 따라 다를 수 있음)
DROP POLICY IF EXISTS "Owner can see their own QNA" ON product.product_qnas;
CREATE POLICY "Owner can see their own QNA" ON product.product_qnas 
FOR SELECT USING (auth.uid() = user_id);

-- 2. Order 스키마 정책
-- 주문 내역은 본인 것만 조회 가능
DROP POLICY IF EXISTS "Orders are owner-access only" ON "order".orders;
CREATE POLICY "Orders are owner-access only" ON "order".orders 
FOR SELECT USING (auth.uid() = user_id);

-- 3. Privacy 스키마 정책
-- 프로필 정보는 본인만 접근 가능 (KMS 암호화와 병행하여 보안 강화)
DROP POLICY IF EXISTS "Profiles are owner-access only" ON privacy.user_profiles;
CREATE POLICY "Profiles are owner-access only" ON privacy.user_profiles 
FOR ALL USING (auth.uid() = user_id);

-- 4. Auth 스키마 정책
-- 계정 정보 접근 제어
DROP POLICY IF EXISTS "Users can manage their own account" ON auth.users;
CREATE POLICY "Users can manage their own account" ON auth.users 
FOR SELECT USING (auth.uid() = id);

-- 5. Public 스키마 (기타 테이블)
-- 리뷰는 누구나 조회 가능
DROP POLICY IF EXISTS "Reviews are public read" ON public.reviews;
CREATE POLICY "Reviews are public read" ON public.reviews 
FOR SELECT USING (true);

-- 배송지 관리는 본인만 가능
DROP POLICY IF EXISTS "Addresses are owner-access only" ON public.addresses;
CREATE POLICY "Addresses are owner-access only" ON public.addresses 
FOR ALL USING (auth.uid() = user_id);
