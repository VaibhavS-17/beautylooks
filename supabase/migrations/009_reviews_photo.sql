ALTER TABLE reviews
ADD COLUMN image_urls TEXT[] DEFAULT '{}',
ADD COLUMN is_verified_purchase BOOLEAN DEFAULT false;
