-- Allow guest checkouts and fallback admin clients to create and update orders without RLS errors
DROP POLICY IF EXISTS "Allow users to place own orders" ON orders;
CREATE POLICY "Allow users to place own orders" ON orders FOR INSERT WITH CHECK (
  user_id IS NULL OR auth.uid() = user_id OR auth.role() IN ('anon', 'service_role')
);

DROP POLICY IF EXISTS "Allow users to insert own order items" ON order_items;
CREATE POLICY "Allow users to insert own order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id IS NULL OR orders.user_id = auth.uid() OR auth.role() IN ('anon', 'service_role'))
  )
);

DROP POLICY IF EXISTS "Allow users to update own orders" ON orders;
CREATE POLICY "Allow users to update own orders" ON orders FOR UPDATE USING (
  auth.uid() = user_id OR auth.role() IN ('anon', 'service_role')
);

DROP POLICY IF EXISTS "Allow users to view own order items" ON order_items;
CREATE POLICY "Allow users to view own order items" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id IS NULL OR orders.user_id = auth.uid() OR auth.role() IN ('anon', 'service_role'))
  )
);
