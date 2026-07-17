-- Add hero_mobile_image_url to site_settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_mobile_image_url TEXT;
