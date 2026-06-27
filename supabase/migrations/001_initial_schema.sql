-- ============================================
-- BEAUTY LOOKS MUMBAI — INITIAL SCHEMA
-- PostgreSQL & Supabase RLS Policies
-- ============================================

-- Create Enum Types
CREATE TYPE skin_type_enum AS ENUM ('all', 'oily', 'dry', 'combination', 'sensitive');
CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE user_role_enum AS ENUM ('customer', 'admin');

-- 1. Categories Table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Brands Table
CREATE TABLE brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Products Table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  skin_type skin_type_enum DEFAULT 'all'::skin_type_enum NOT NULL,
  stock_quantity INTEGER DEFAULT 0 NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  images TEXT[] DEFAULT '{}'::text[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. User Profiles Table (Linked to Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role_enum DEFAULT 'customer'::user_role_enum NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Addresses Table
CREATE TABLE addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  label TEXT DEFAULT 'Home'::text NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Orders Table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status order_status_enum DEFAULT 'pending'::order_status_enum NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Order Items Table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL
);

-- 8. Reviews Table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_product_review UNIQUE (user_id, product_id)
);

-- 9. Wishlist Items Table
CREATE TABLE wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_product_wishlist UNIQUE (user_id, product_id)
);

-- 10. Blog Posts Table
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Categories & Brands RLS Policies
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to categories" ON categories FOR ALL USING (
  exists (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Allow public read access to brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to brands" ON brands FOR ALL USING (
  exists (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Products RLS Policies
CREATE POLICY "Allow public read access to active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Allow admin write access to products" ON products FOR ALL USING (
  exists (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Profiles RLS Policies
CREATE POLICY "Allow public read access to profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow admin all access to profiles" ON profiles FOR ALL USING (
  exists (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Addresses RLS Policies
CREATE POLICY "Allow users to view own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert own addresses" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update own addresses" ON addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete own addresses" ON addresses FOR DELETE USING (auth.uid() = user_id);

-- Orders RLS Policies
CREATE POLICY "Allow users to view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to place own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow admin all access to orders" ON orders FOR ALL USING (
  exists (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Order Items RLS Policies
CREATE POLICY "Allow users to view own order items" ON order_items FOR SELECT USING (
  exists (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
);
CREATE POLICY "Allow users to insert own order items" ON order_items FOR INSERT WITH CHECK (
  exists (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
);
CREATE POLICY "Allow admin all access to order items" ON order_items FOR ALL USING (
  exists (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Reviews RLS Policies
CREATE POLICY "Allow public read access to reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Wishlist RLS Policies
CREATE POLICY "Allow users to view own wishlist" ON wishlist_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to manage own wishlist" ON wishlist_items FOR ALL USING (auth.uid() = user_id);

-- Blog Posts RLS Policies
CREATE POLICY "Allow public read access to published posts" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Allow admin all access to blog posts" ON blog_posts FOR ALL USING (
  exists (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
