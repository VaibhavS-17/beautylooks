-- ============================================
-- Phase 2: Admin Dashboard Overhaul Improvements
-- ============================================

-- 1. Add UTR tracking columns to orders table for manual UPI verification
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utr_status TEXT DEFAULT 'pending' CHECK (utr_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utr_verified_at TIMESTAMP WITH TIME ZONE;

-- 2. Combined Admin Dashboard Stats RPC function
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_products BIGINT;
  v_total_orders BIGINT;
  v_active_customers BIGINT;
  v_gross_revenue NUMERIC;
  v_sales_7_days JSONB;
  v_top_products JSONB;
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can view dashboard stats';
  END IF;

  SELECT count(*) INTO v_total_products FROM products;
  SELECT count(*) INTO v_total_orders FROM orders;
  SELECT count(*) INTO v_active_customers FROM profiles WHERE role = 'customer';
  SELECT COALESCE(sum(total_amount), 0) INTO v_gross_revenue 
  FROM orders WHERE status IN ('confirmed', 'shipped', 'delivered');

  -- Last 7 days sales grouped by day in Asia/Kolkata timezone
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'date', to_char(d.day, 'YYYY-MM-DD'),
      'name', to_char(d.day, 'Dy'),
      'sales', COALESCE(s.daily_sales, 0),
      'ordersCount', COALESCE(s.daily_orders, 0)
    ) ORDER BY d.day
  ), '[]'::jsonb) INTO v_sales_7_days
  FROM (
    SELECT generate_series(
      (timezone('Asia/Kolkata', now()) - interval '6 days')::date,
      timezone('Asia/Kolkata', now())::date,
      '1 day'::interval
    )::date AS day
  ) d
  LEFT JOIN (
    SELECT 
      timezone('Asia/Kolkata', created_at)::date as o_date,
      sum(total_amount) as daily_sales,
      count(*) as daily_orders
    FROM orders
    WHERE status IN ('confirmed', 'shipped', 'delivered')
      AND created_at >= (now() - interval '8 days')
    GROUP BY timezone('Asia/Kolkata', created_at)::date
  ) s ON d.day = s.o_date;

  -- Top 5 selling products
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', tp.id,
      'name', tp.name,
      'quantity', tp.total_sold,
      'revenue', tp.total_rev
    )
  ), '[]'::jsonb) INTO v_top_products
  FROM (
    SELECT p.id, p.name, sum(oi.quantity) as total_sold, sum(oi.quantity * oi.unit_price) as total_rev
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    WHERE o.status IN ('confirmed', 'shipped', 'delivered')
    GROUP BY p.id, p.name
    ORDER BY total_sold DESC
    LIMIT 5
  ) tp;

  RETURN jsonb_build_object(
    'totalProducts', v_total_products,
    'totalOrders', v_total_orders,
    'activeCustomers', v_active_customers,
    'grossRevenue', v_gross_revenue,
    'salesData', v_sales_7_days,
    'topProducts', v_top_products
  );
END;
$$;
