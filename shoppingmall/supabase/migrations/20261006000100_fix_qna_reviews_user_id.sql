-- Supabase Migration: Fix Q&A and Review user_id handling and constraints
BEGIN;

-- Drop foreign key constraints on product_qnas.user_id and reviews.user_id if they exist
ALTER TABLE public.product_qnas 
    DROP CONSTRAINT IF EXISTS product_qnas_user_id_fkey;

ALTER TABLE public.reviews 
    DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Alter user_id column type to TEXT to support both legacy user IDs and Supabase Auth UUIDs
ALTER TABLE public.product_qnas 
    ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

ALTER TABLE public.reviews 
    ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

COMMIT;
