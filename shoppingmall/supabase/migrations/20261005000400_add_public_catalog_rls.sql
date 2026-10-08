-- Add public SELECT policies for catalog and content tables (products, categories, product_options, reviews, product_qnas)
BEGIN;

GRANT SELECT ON TABLE
  public.products,
  public.categories,
  public.product_options,
  public.reviews,
  public.product_qnas
TO anon, authenticated;

-- Products
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);

-- Categories
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);

-- Product Options
DROP POLICY IF EXISTS "Allow public read product_options" ON public.product_options;
CREATE POLICY "Allow public read product_options" ON public.product_options FOR SELECT TO anon, authenticated USING (true);

-- Reviews
DROP POLICY IF EXISTS "Allow public read reviews" ON public.reviews;
CREATE POLICY "Allow public read reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);

-- Product QNAs
DROP POLICY IF EXISTS "Allow public read product_qnas" ON public.product_qnas;
CREATE POLICY "Allow public read product_qnas" ON public.product_qnas FOR SELECT TO anon, authenticated USING (true);

COMMIT;
