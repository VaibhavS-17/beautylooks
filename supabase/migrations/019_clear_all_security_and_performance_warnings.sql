-- Migration: 019_clear_all_security_and_performance_warnings.sql
-- Description: Comprehensive fix for all Supabase Security & Performance Linter Advisories.

-- ============================================================================
-- 1. EXTENSION SCHEMA (extension_in_public)
-- Move pg_trgm to extensions schema
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- ============================================================================
-- 2. MATERIALIZED VIEW IN API (materialized_view_in_api)
-- Prevent public anon/authenticated access to admin_daily_metrics via PostgREST
-- ============================================================================
REVOKE ALL ON TABLE public.admin_daily_metrics FROM anon, authenticated;

-- ============================================================================
-- 3. FUNCTION SEARCH PATH MUTABLE (function_search_path_mutable)
-- Fix search_path on all 12 functions to prevent search path hijacking
-- ============================================================================
ALTER FUNCTION public.search_products(text) SET search_path = public, extensions;
ALTER FUNCTION public.atomic_reserve_stock(jsonb) SET search_path = public, extensions;
ALTER FUNCTION public.atomic_restore_stock(jsonb) SET search_path = public, extensions;
ALTER FUNCTION public.refresh_admin_daily_metrics() SET search_path = public, extensions;
ALTER FUNCTION public.get_admin_dashboard_stats() SET search_path = public, extensions;
ALTER FUNCTION public.increment_helpful_count(uuid) SET search_path = public, extensions;
ALTER FUNCTION public.decrement_stock(uuid, integer) SET search_path = public, extensions;
ALTER FUNCTION public.prevent_role_escalation() SET search_path = public, extensions;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, extensions;
ALTER FUNCTION public.update_cart_updated_at() SET search_path = public, extensions;
ALTER FUNCTION public.merge_cart(uuid, jsonb) SET search_path = public, extensions;
ALTER FUNCTION public.check_rate_limit(text, integer, bigint) SET search_path = public, extensions;

-- ============================================================================
-- 4. FUNCTION EXECUTION RESTRICTIONS
-- (anon/authenticated_security_definer_function_executable)
-- ============================================================================

-- A. Server-only RPCs (callable strictly by service_role)
REVOKE EXECUTE ON FUNCTION public.atomic_reserve_stock(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.atomic_reserve_stock(jsonb) TO service_role;

REVOKE EXECUTE ON FUNCTION public.atomic_restore_stock(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.atomic_restore_stock(jsonb) TO service_role;

REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, integer, bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, bigint) TO service_role;

REVOKE EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) TO service_role;

REVOKE EXECUTE ON FUNCTION public.increment_helpful_count(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_helpful_count(uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.get_admin_dashboard_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO service_role;

REVOKE EXECUTE ON FUNCTION public.merge_cart(uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.merge_cart(uuid, jsonb) TO service_role;

-- B. Trigger functions (should never be called as RPCs)
REVOKE EXECUTE ON FUNCTION public.prevent_role_escalation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_admin_daily_metrics() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_cart_updated_at() FROM PUBLIC, anon, authenticated;

-- Cart merge function logic with search path
CREATE OR REPLACE FUNCTION public.merge_cart(p_user_id UUID, p_items JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    INSERT INTO public.carts (user_id, items)
    VALUES (p_user_id, p_items)
    ON CONFLICT (user_id) DO UPDATE
    SET items = EXCLUDED.items,
        updated_at = timezone('utc'::text, now());
END;
$$;

-- ============================================================================
-- 5. CRITICAL RLS FIXES & PERMISSIVE POLICY CLEANUP
-- (rls_policy_always_true & multiple_permissive_policies & auth_rls_initplan)
-- ============================================================================

-- Table: products
DROP POLICY IF EXISTS "Allow users to update stock" ON public.products;
DROP POLICY IF EXISTS "Allow admin write access to products" ON public.products;
DROP POLICY IF EXISTS "Allow public read access to active products" ON public.products;
DROP POLICY IF EXISTS "Allow admin insert products" ON public.products;
DROP POLICY IF EXISTS "Allow admin update products" ON public.products;
DROP POLICY IF EXISTS "Allow admin delete products" ON public.products;

CREATE POLICY "Allow public read access to active products"
ON public.products FOR SELECT
USING (is_active = true);

CREATE POLICY "Allow admin insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

CREATE POLICY "Allow admin update products"
ON public.products FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

CREATE POLICY "Allow admin delete products"
ON public.products FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- Table: cart_sessions
DROP POLICY IF EXISTS "Allow public access to own cart session" ON public.cart_sessions;
DROP POLICY IF EXISTS "Admins can manage cart sessions" ON public.cart_sessions;

CREATE POLICY "Admins can manage cart sessions"
ON public.cart_sessions FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- Table: discount_codes
DROP POLICY IF EXISTS "Anyone can read active discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Admins can manage discount codes" ON public.discount_codes;

CREATE POLICY "Admins can manage discount codes"
ON public.discount_codes FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- Table: contact_messages
DROP POLICY IF EXISTS "Anyone can insert contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can manage contact_messages" ON public.contact_messages;

CREATE POLICY "Admins can manage contact_messages"
ON public.contact_messages FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- Table: newsletter_subscribers
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Admins can view subscribers"
ON public.newsletter_subscribers FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- Table: restock_notifications
DROP POLICY IF EXISTS "Anyone can subscribe for restock notifications" ON public.restock_notifications;
DROP POLICY IF EXISTS "Users can view their own notification requests" ON public.restock_notifications;
DROP POLICY IF EXISTS "Admins can manage restock notifications" ON public.restock_notifications;
DROP POLICY IF EXISTS "Allow admins and users to view restock notifications" ON public.restock_notifications;
DROP POLICY IF EXISTS "Allow admins to insert restock notifications" ON public.restock_notifications;
DROP POLICY IF EXISTS "Allow admins to update restock notifications" ON public.restock_notifications;
DROP POLICY IF EXISTS "Allow admins to delete restock notifications" ON public.restock_notifications;

CREATE POLICY "Allow admins and users to view restock notifications"
ON public.restock_notifications FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
);

CREATE POLICY "Allow admins to insert restock notifications"
ON public.restock_notifications FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

CREATE POLICY "Allow admins to update restock notifications"
ON public.restock_notifications FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

CREATE POLICY "Allow admins to delete restock notifications"
ON public.restock_notifications FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- Table: orders
DROP POLICY IF EXISTS "Allow admin all access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow users to view own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow users to place own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow users to update own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow users and admins to view orders" ON public.orders;
DROP POLICY IF EXISTS "Allow users and admins to insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow users and admins to update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admins to delete orders" ON public.orders;

CREATE POLICY "Allow users and admins to view orders"
ON public.orders FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid()) 
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
);

CREATE POLICY "Allow users and admins to insert orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid()) 
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
);

CREATE POLICY "Allow users and admins to update orders"
ON public.orders FOR UPDATE
TO authenticated
USING (
  user_id = (SELECT auth.uid()) 
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
)
WITH CHECK (
  user_id = (SELECT auth.uid()) 
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
);

CREATE POLICY "Allow admins to delete orders"
ON public.orders FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- Table: order_items
DROP POLICY IF EXISTS "Allow admin all access to order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow users to view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow users to insert own order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow users and admins to view order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow users and admins to insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow admins to update order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow admins to delete order items" ON public.order_items;

CREATE POLICY "Allow users and admins to view order items"
ON public.order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'))
  )
);

CREATE POLICY "Allow users and admins to insert order items"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'))
  )
);

CREATE POLICY "Allow admins to update order items"
ON public.order_items FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

CREATE POLICY "Allow admins to delete order items"
ON public.order_items FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- Table: addresses
DROP POLICY IF EXISTS "Allow users to view own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Allow users to insert own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Allow users to update own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Allow users to delete own addresses" ON public.addresses;

CREATE POLICY "Allow users to view own addresses"
ON public.addresses FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Allow users to insert own addresses"
ON public.addresses FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Allow users to update own addresses"
ON public.addresses FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Allow users to delete own addresses"
ON public.addresses FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Table: brands
DROP POLICY IF EXISTS "Allow public read access to brands" ON public.brands;
DROP POLICY IF EXISTS "Allow admin write access to brands" ON public.brands;
DROP POLICY IF EXISTS "Allow admin insert brands" ON public.brands;
DROP POLICY IF EXISTS "Allow admin update brands" ON public.brands;
DROP POLICY IF EXISTS "Allow admin delete brands" ON public.brands;

CREATE POLICY "Allow public read access to brands"
ON public.brands FOR SELECT
USING (true);

CREATE POLICY "Allow admin insert brands"
ON public.brands FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

CREATE POLICY "Allow admin update brands"
ON public.brands FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

CREATE POLICY "Allow admin delete brands"
ON public.brands FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- Table: categories
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin all access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin insert categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin update categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin delete categories" ON public.categories;

CREATE POLICY "Allow public read access to categories"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Allow admin insert categories"
ON public.categories FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

CREATE POLICY "Allow admin update categories"
ON public.categories FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

CREATE POLICY "Allow admin delete categories"
ON public.categories FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- Table: blog_posts
DROP POLICY IF EXISTS "Allow public read access to published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow admin all access to blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow admin insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow admin update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow admin delete blog posts" ON public.blog_posts;

CREATE POLICY "Allow public read access to published posts"
ON public.blog_posts FOR SELECT
USING (is_published = true);

CREATE POLICY "Allow admin insert blog posts"
ON public.blog_posts FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

CREATE POLICY "Allow admin update blog posts"
ON public.blog_posts FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

CREATE POLICY "Allow admin delete blog posts"
ON public.blog_posts FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- Table: site_settings
DROP POLICY IF EXISTS "Allow public read access to site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow admin write access to site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow admin insert site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow admin update site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow admin delete site_settings" ON public.site_settings;

CREATE POLICY "Allow public read access to site_settings"
ON public.site_settings FOR SELECT
USING (true);

CREATE POLICY "Allow admin insert site_settings"
ON public.site_settings FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

CREATE POLICY "Allow admin update site_settings"
ON public.site_settings FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

CREATE POLICY "Allow admin delete site_settings"
ON public.site_settings FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- Table: testimonials
DROP POLICY IF EXISTS "Allow public read access to testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin write access to testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin delete testimonials" ON public.testimonials;

CREATE POLICY "Allow public read access to testimonials"
ON public.testimonials FOR SELECT
USING (true);

CREATE POLICY "Allow admin insert testimonials"
ON public.testimonials FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

CREATE POLICY "Allow admin update testimonials"
ON public.testimonials FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

CREATE POLICY "Allow admin delete testimonials"
ON public.testimonials FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- Table: reviews
DROP POLICY IF EXISTS "Allow public read access to reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow authenticated users to insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow users to update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow users to delete own reviews" ON public.reviews;

CREATE POLICY "Allow public read access to reviews"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert reviews"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Allow users to update own reviews"
ON public.reviews FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Allow users to delete own reviews"
ON public.reviews FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Table: wishlist_items
DROP POLICY IF EXISTS "Allow users to view own wishlist" ON public.wishlist_items;
DROP POLICY IF EXISTS "Allow users to manage own wishlist" ON public.wishlist_items;

CREATE POLICY "Allow users to manage own wishlist"
ON public.wishlist_items FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- Table: carts
DROP POLICY IF EXISTS "Users can manage their own carts" ON public.carts;

CREATE POLICY "Users can manage their own carts"
ON public.carts FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- Table: abandoned_cart_leads
DROP POLICY IF EXISTS "Admins can manage abandoned cart leads" ON public.abandoned_cart_leads;

CREATE POLICY "Admins can manage abandoned cart leads"
ON public.abandoned_cart_leads FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- Table: profiles
DROP POLICY IF EXISTS "profiles_manage_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to read profiles" ON public.profiles;

CREATE POLICY "Allow users to read profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Allow users to insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Allow users to update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

-- ============================================================================
-- 6. PUBLIC BUCKET LISTING RESTRICTION (public_bucket_allows_listing)
-- Restrict storage.objects SELECT listing to admin users
-- (Direct object downloads via public URLs continue to work normally)
-- ============================================================================
DROP POLICY IF EXISTS "Allow public read access to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin read access to media" ON storage.objects;

CREATE POLICY "Allow admin read access to media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'media'
  AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'))
);

-- ============================================================================
-- 7. FOREIGN KEY INDEXING (unindexed_foreign_keys)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_abandoned_cart_leads_session_id 
ON public.abandoned_cart_leads (session_id);
