SET request.jwt.claim.role = 'service_role';
SELECT public.test_try_order('load-ab', '[{"product_id":"00000000-0000-0000-0000-0000000000e1","quantity":1},{"product_id":"00000000-0000-0000-0000-0000000000e2","quantity":1}]'::jsonb);
