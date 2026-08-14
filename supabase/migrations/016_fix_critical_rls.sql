-- Migration: 016_fix_critical_rls.sql
-- Description: Fixes critical RLS vulnerabilities allowing order tampering, cart session leaks, and discount code enumeration.

-- 1. Orders and Order Items (Prevent anon tampering)
-- Remove the `auth.role() IN ('anon', 'service_role')` bypass for public users.
-- Note: service_role automatically bypasses RLS, so it does not need to be explicitly allowed in the policy.
DROP POLICY IF EXISTS "Allow users to place own orders" ON orders;
CREATE POLICY "Allow users to place own orders" ON orders FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

DROP POLICY IF EXISTS "Allow users to insert own order items" ON order_items;
CREATE POLICY "Allow users to insert own order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Allow users to update own orders" ON orders;
CREATE POLICY "Allow users to update own orders" ON orders FOR UPDATE USING (
  auth.uid() = user_id
);

DROP POLICY IF EXISTS "Allow users to view own order items" ON order_items;
CREATE POLICY "Allow users to view own order items" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- 2. Guest Cart PII Leak
-- Prevent unauthenticated users from scanning all cart sessions.
DROP POLICY IF EXISTS "Allow public access to own cart session" ON public.cart_sessions;
CREATE POLICY "Admins can manage cart sessions" ON public.cart_sessions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Discount Code Enumeration
-- Prevent unauthenticated users from reading all discount codes.
-- Validation is done securely on the server via `createAdminClient()`.
DROP POLICY IF EXISTS "Anyone can read active discount codes" ON public.discount_codes;
