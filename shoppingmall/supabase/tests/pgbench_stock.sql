SET request.jwt.claim.role = 'service_role';
SELECT public.test_try_order('load-stock', '[{"product_id":"00000000-0000-0000-0000-0000000000a1","quantity":1}]'::jsonb);
