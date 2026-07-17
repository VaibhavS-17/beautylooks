-- Migration: 014_persistent_carts.sql
-- Description: Adds a persistent carts table to sync user carts across devices.

CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view and manage their own carts
CREATE POLICY "Users can manage their own carts"
ON public.carts
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger to update 'updated_at'
CREATE OR REPLACE FUNCTION public.update_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_carts_updated_at
    BEFORE UPDATE ON public.carts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_cart_updated_at();

-- Add RPC function for safely merging carts
CREATE OR REPLACE FUNCTION public.merge_cart(p_user_id UUID, p_items JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function allows merging guest carts on login
    -- In a real app, you might want to read existing items and merge quantities.
    -- For simplicity, this overwrites or creates the cart.
    INSERT INTO public.carts (user_id, items)
    VALUES (p_user_id, p_items)
    ON CONFLICT (user_id) DO UPDATE
    SET items = EXCLUDED.items,
        updated_at = timezone('utc'::text, now());
END;
$$;
