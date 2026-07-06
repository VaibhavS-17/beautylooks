'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'You must be logged in to leave a review.' };
  }

  // Validate rating
  if (data.rating < 1 || data.rating > 5) {
    return { error: 'Rating must be between 1 and 5.' };
  }

  if (!data.comment || data.comment.trim().length < 3) {
    return { error: 'Please write a review comment (minimum 3 characters).' };
  }

  try {
    // Check if the user has already reviewed this product
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', data.productId)
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
      .eq('product_id', data.productId)
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
        product_id: data.productId,
        rating: data.rating,
        comment: data.comment.trim(),
      });

    if (error) {
      if (error.code === '23505') {
        return { error: 'You have already reviewed this product.' };
      }
      return { error: error.message };
    }

    revalidatePath(`/products`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

/**
 * Delete the current user's review for a given product.
 */
export async function deleteReview(reviewId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id);

    if (error) return { error: error.message };

    revalidatePath(`/products`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete review.' };
  }
}
