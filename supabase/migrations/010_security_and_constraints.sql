-- ============================================
-- Phase 0: Security & Data-Integrity Fixes
-- ============================================

-- 1. Rate Limiting Table
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on rate_limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny all access from client to rate_limits" ON rate_limits;
CREATE POLICY "Deny all access from client to rate_limits" ON rate_limits FOR ALL USING (false);

-- 2. Trigger to prevent non-admins from self-escalating role
CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Unauthorized: You cannot change your role.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_prevent_role_escalation ON profiles;
CREATE TRIGGER tr_prevent_role_escalation
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION prevent_role_escalation();

-- 3. UTR Uniqueness Constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS unique_upi_utr;
ALTER TABLE orders ADD CONSTRAINT unique_upi_utr UNIQUE (upi_utr);

-- 4. Check Constraints
ALTER TABLE products DROP CONSTRAINT IF EXISTS stock_non_negative;
ALTER TABLE products ADD CONSTRAINT stock_non_negative CHECK (stock_quantity >= 0);

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS valid_rating;
ALTER TABLE reviews ADD CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discount_codes') THEN
    ALTER TABLE discount_codes DROP CONSTRAINT IF EXISTS valid_discount;
    ALTER TABLE discount_codes ADD CONSTRAINT valid_discount CHECK (discount_percent > 0 AND discount_percent <= 100);
  END IF;
END
$$;
