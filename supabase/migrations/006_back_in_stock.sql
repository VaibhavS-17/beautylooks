-- ============================================
-- BEAUTY LOOKS MUMBAI — BACK-IN-STOCK NOTIFICATIONS
-- ============================================

-- 1. Create notification status enum
DO $$ BEGIN
  CREATE TYPE notification_status_enum AS ENUM ('pending', 'sent');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create restock_notifications table
CREATE TABLE IF NOT EXISTS restock_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  status notification_status_enum DEFAULT 'pending'::notification_status_enum NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Unique partial index: prevent duplicate *active* subscriptions
-- A user can re-subscribe once a previous notification has been sent.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_subscription
ON restock_notifications (product_id, email)
WHERE status = 'pending';

-- 4. Performance index for the restock trigger query
CREATE INDEX IF NOT EXISTS idx_restock_product_pending
ON restock_notifications (product_id)
WHERE status = 'pending';

-- 5. RLS Policies
ALTER TABLE restock_notifications ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (guests + logged-in users)
CREATE POLICY "Anyone can subscribe for restock notifications"
ON restock_notifications FOR INSERT
WITH CHECK (true);

-- Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions"
ON restock_notifications FOR SELECT
USING (
  email = (SELECT auth.jwt() ->> 'email')
  OR (SELECT auth.jwt() ->> 'role') = 'service_role'
);

-- Only service_role can update (mark as sent)
CREATE POLICY "Service role can update notification status"
ON restock_notifications FOR UPDATE
USING ((SELECT auth.jwt() ->> 'role') = 'service_role');
