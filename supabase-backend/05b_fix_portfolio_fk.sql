-- =====================================================
-- FIX: Portfolio Items FK Constraint
-- 
-- The portfolio_items table has a FK on vendor_id that points
-- to auth.users(id), but vendor_id is actually the profile ID
-- from user_profiles(id). This migration corrects that.
--
-- Run this in the Supabase SQL Editor.
-- =====================================================

-- Step 1: Drop the incorrect FK constraint
ALTER TABLE public.portfolio_items
    DROP CONSTRAINT IF EXISTS portfolio_items_vendor_id_fkey;

-- Step 2: Add the correct FK pointing to user_profiles(id)
ALTER TABLE public.portfolio_items
    ADD CONSTRAINT portfolio_items_vendor_id_fkey
    FOREIGN KEY (vendor_id)
    REFERENCES public.user_profiles(id)
    ON DELETE CASCADE;
