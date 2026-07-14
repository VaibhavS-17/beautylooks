-- ============================================
-- 007: PAYMENT FAILURE STATE MANAGEMENT
-- Add 'failed' status and failed_at timestamp
-- ============================================

-- Add 'failed' value to order_status_enum
ALTER TYPE order_status_enum ADD VALUE IF NOT EXISTS 'failed';

-- Add failed_at timestamp column to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS failed_at TIMESTAMP WITH TIME ZONE;
