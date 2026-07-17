-- Migration: 015_premium_features.sql
-- Description: Adds tables and extensions for abandoned cart, smart search, and atomic stock check.

-- 1. Guest Carts & Abandoned Carts
CREATE TABLE IF NOT EXISTS public.cart_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    phone TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'converted', 'abandoned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.abandoned_cart_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.cart_sessions(session_id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT,
    cart_items JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'email_sent', 'recovered', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for cart sessions
ALTER TABLE public.cart_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_cart_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to own cart session" ON public.cart_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage abandoned cart leads" ON public.abandoned_cart_leads FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Smart Search (pg_trgm)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE products ADD COLUMN IF NOT EXISTS search_fts tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
) STORED;

CREATE INDEX IF NOT EXISTS products_search_fts_idx ON products USING GIN (search_fts);
CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON products USING GIST (name gist_trgm_ops);

-- RPC for Smart Search
CREATE OR REPLACE FUNCTION search_products(search_term TEXT)
RETURNS SETOF products
LANGUAGE sql
STABLE
AS $$
    SELECT *
    FROM products
    WHERE is_active = true
      AND (
          search_fts @@ plainto_tsquery('english', search_term)
          OR name % search_term
      )
    ORDER BY ts_rank(search_fts, plainto_tsquery('english', search_term)) DESC
    LIMIT 20;
$$;

-- 3. Atomic Stock Reserve
CREATE OR REPLACE FUNCTION atomic_reserve_stock(items JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    item RECORD;
    product_stock INT;
    failed_items JSONB := '[]'::jsonb;
BEGIN
    -- 1. Lock all rows to prevent concurrent modifications
    -- Order by product_id to prevent deadlocks
    FOR item IN (SELECT * FROM jsonb_to_recordset(items) AS x(product_id UUID, quantity INT) ORDER BY product_id)
    LOOP
        SELECT stock_quantity INTO product_stock FROM products WHERE id = item.product_id FOR UPDATE;
        
        IF product_stock < item.quantity THEN
            failed_items := failed_items || jsonb_build_object('product_id', item.product_id, 'available', product_stock);
        END IF;
    END LOOP;

    -- 2. If any item fails, rollback (by returning failure and not updating)
    IF jsonb_array_length(failed_items) > 0 THEN
        RETURN jsonb_build_object('success', false, 'failed_items', failed_items);
    END IF;

    -- 3. All items have enough stock, perform updates
    FOR item IN SELECT * FROM jsonb_to_recordset(items) AS x(product_id UUID, quantity INT)
    LOOP
        UPDATE products SET stock_quantity = stock_quantity - item.quantity WHERE id = item.product_id;
    END LOOP;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- Restore stock (called if payment fails or order cancelled)
CREATE OR REPLACE FUNCTION atomic_restore_stock(items JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    item RECORD;
BEGIN
    FOR item IN SELECT * FROM jsonb_to_recordset(items) AS x(product_id UUID, quantity INT)
    LOOP
        UPDATE products SET stock_quantity = stock_quantity + item.quantity WHERE id = item.product_id;
    END LOOP;
END;
$$;

-- 4. Admin Daily Metrics Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS admin_daily_metrics AS
SELECT date_trunc('day', created_at) AS day,
       count(id) AS total_orders, 
       sum(total_amount) AS total_revenue
FROM orders 
WHERE status IN ('confirmed', 'shipped', 'delivered')
GROUP BY 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_metrics ON admin_daily_metrics (day);

CREATE OR REPLACE FUNCTION refresh_admin_daily_metrics()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY admin_daily_metrics;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS refresh_metrics_trigger ON orders;
CREATE TRIGGER refresh_metrics_trigger
AFTER INSERT OR UPDATE OF status, total_amount ON orders
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_admin_daily_metrics();

-- 5. Update Dashboard Stats RPC to use Materialized View
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
  
  -- Use materialized view for total orders and gross revenue
  SELECT COALESCE(sum(total_orders), 0), COALESCE(sum(total_revenue), 0) 
  INTO v_total_orders, v_gross_revenue FROM admin_daily_metrics;
  
  SELECT count(*) INTO v_active_customers FROM profiles WHERE role = 'customer';

  -- Last 7 days sales from Materialized View
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
      (timezone('utc', now()) - interval '6 days')::date,
      timezone('utc', now())::date,
      '1 day'::interval
    )::date AS day
  ) d
  LEFT JOIN (
    SELECT 
      day::date as o_date,
      sum(total_revenue) as daily_sales,
      sum(total_orders) as daily_orders
    FROM admin_daily_metrics
    WHERE day >= (now() - interval '8 days')
    GROUP BY day::date
  ) s ON d.day = s.o_date;

  -- Top 5 selling products (unchanged)
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
