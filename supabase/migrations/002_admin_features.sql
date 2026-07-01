-- ============================================
-- BEAUTY LOOKS MUMBAI — ADMIN FEATURES & STORAGE
-- Site Settings Table and Media Storage Bucket Setup
-- ============================================

-- Create Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero_title TEXT NOT NULL DEFAULT 'Unveil Your Radiance',
  hero_subtitle TEXT NOT NULL DEFAULT 'The Autumn Collection',
  hero_description TEXT NOT NULL DEFAULT 'Simple. Genuine. Affordable. Experience professional results at home with Mumbai''s most trusted curated beauty sets.',
  hero_image_url TEXT NOT NULL DEFAULT '/images/hero-beauty.png',
  hero_button_text TEXT NOT NULL DEFAULT 'Shop Collection',
  hero_button_link TEXT NOT NULL DEFAULT '/products',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Default Row
INSERT INTO site_settings (id, hero_title, hero_subtitle, hero_description, hero_image_url, hero_button_text, hero_button_link)
VALUES (
  'default',
  'Unveil Your Radiance',
  'The Autumn Collection',
  'Simple. Genuine. Affordable. Experience professional results at home with Mumbai''s most trusted curated beauty sets.',
  '/images/hero-beauty.png',
  'Shop Collection',
  '/products'
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Site Settings RLS Policies
CREATE POLICY "Allow public read access to site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to site_settings" ON site_settings FOR ALL USING (
  exists (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Storage Buckets Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'media' bucket
CREATE POLICY "Allow public read access to media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Allow admin insert access to media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media'
  AND (
    exists (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Allow admin update access to media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media'
  AND (
    exists (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Allow admin delete access to media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media'
  AND (
    exists (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);
