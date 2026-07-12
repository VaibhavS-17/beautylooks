'use server';

import { createClient } from '@/lib/supabase/server';

export async function subscribeRestockNotification({
  productId,
  email,
}: {
  productId: string;
  email: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing active (pending) subscription
    const { data: existing } = await supabase
      .from('restock_notifications')
      .select('id')
      .eq('product_id', productId)
      .eq('email', normalizedEmail)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      // Already subscribed — treat as success (idempotent)
      return { success: true };
    }

    // Insert new subscription
    const { error } = await supabase
      .from('restock_notifications')
      .insert({
        product_id: productId,
        email: normalizedEmail,
        status: 'pending',
      });

    if (error) {
      // Handle unique constraint violation gracefully
      if (error.code === '23505') {
        return { success: true };
      }
      console.error('Restock notification subscription error:', error);
      return { success: false, error: 'Failed to subscribe. Please try again.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in subscribeRestockNotification:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
