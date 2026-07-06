-- ============================================
-- SECURITY FIX: Add WITH CHECK clauses to
-- UPDATE policies and add missing INSERT policy
-- for profiles table.
-- ============================================

-- Fix: addresses UPDATE policy needs WITH CHECK
DROP POLICY IF EXISTS "Allow users to update own addresses" ON addresses;
CREATE POLICY "Allow users to update own addresses" ON addresses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix: reviews UPDATE policy needs WITH CHECK
DROP POLICY IF EXISTS "Allow users to update own reviews" ON reviews;
CREATE POLICY "Allow users to update own reviews" ON reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix: profiles UPDATE policy needs WITH CHECK
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
CREATE POLICY "Allow users to update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Fix: Add INSERT policy for profiles (users need to create their own profile)
CREATE POLICY "Allow users to insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Fix: Update storage policy for media bucket to enforce mime types and size limit.
-- Only allow images (max 10MB) and videos (max 50MB) to be uploaded by admins.
-- Supabase Storage RLS does not natively expose file size or precise mime type in the `metadata` easily in all versions,
-- but we can use `storage.extension()` or simply rely on the frontend limits + admin trust for now.
-- Let's replace the permissive insert policy with one that checks extensions.
DROP POLICY IF EXISTS "Allow admin insert access to media" ON storage.objects;
CREATE POLICY "Allow admin insert access to media" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND (
      exists (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
    AND (
      lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm')
    )
  );

-- Fix: Add upi_utr column to orders if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'upi_utr'
  ) THEN
    ALTER TABLE orders ADD COLUMN upi_utr TEXT;
  END IF;

  -- Also add payment_verifying to the order_status_enum if not already present
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'payment_verifying'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status_enum')
  ) THEN
    ALTER TYPE order_status_enum ADD VALUE 'payment_verifying';
  END IF;
END
$$;
