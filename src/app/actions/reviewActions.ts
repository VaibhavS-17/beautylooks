'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const reviewSchema = z.object({
  productId: z.string().uuid('Invalid product ID.'),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5.').max(5, 'Rating must be between 1 and 5.'),
  comment: z.string().min(3, 'Please write a review comment (minimum 3 characters).').max(2000),
});

const uuidSchema = z.string().uuid('Invalid ID format.');

/**
 * Create a product review.
 * Only allows reviews from users who have a paid order (confirmed/shipped/delivered)
 * containing the target product, and who haven't already reviewed it.
 */
export async function createReview(data: {
  productId: string;
  rating: number;
  comment: string;
}) {
  const parsed = reviewSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid review data.' };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'You must be logged in to leave a review.' };
  }

  try {
    // Check if the user has already reviewed this product
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', parsed.data.productId)
      .single();

    if (existingReview) {
      return { error: 'You have already reviewed this product.' };
    }

    // Verify user has purchased this product (order with confirmed/shipped/delivered status)
    const { data: eligibleOrders } = await supabase
      .from('order_items')
      .select(`
        id,
        orders!inner (
          user_id,
          status
        )
      `)
      .eq('product_id', parsed.data.productId)
      .eq('orders.user_id', user.id)
      .in('orders.status', ['confirmed', 'shipped', 'delivered']);

    if (!eligibleOrders || eligibleOrders.length === 0) {
      return { error: 'You can only review products you have purchased.' };
    }

    // Insert review
    const { error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        product_id: parsed.data.productId,
        rating: parsed.data.rating,
        comment: parsed.data.comment.trim(),
      });

    if (error) {
      if (error.code === '23505') {
        return { error: 'You have already reviewed this product.' };
      }
      console.error('Create review error:', error);
      return { error: 'Failed to submit review. Please try again.' };
    }

    revalidatePath(`/products`);
    return { success: true };
  } catch (err: any) {
    console.error('Create review exception:', err);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

/**
 * Delete the current user's review for a given product.
 */
export async function deleteReview(reviewId: string) {
  const parsed = uuidSchema.safeParse(reviewId);
  if (!parsed.success) {
    return { error: 'Invalid review ID.' };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', parsed.data)
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete review error:', error);
      return { error: 'Failed to delete review. Please try again.' };
    }

    revalidatePath(`/products`);
    return { success: true };
  } catch (err: any) {
    console.error('Delete review exception:', err);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
