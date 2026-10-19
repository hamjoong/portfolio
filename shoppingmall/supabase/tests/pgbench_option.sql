SET request.jwt.claim.role = 'service_role';
SELECT public.test_try_order('load-option', '[{"product_id":"00000000-0000-0000-0000-0000000000b1","option_id":"00000000-0000-0000-0000-0000000001b1","quantity":1}]'::jsonb);
