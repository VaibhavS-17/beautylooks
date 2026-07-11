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

    const { error } = await supabase
      .from('restock_notifications')
      .upsert(
        { product_id: productId, email: email.toLowerCase().trim() },
        { onConflict: 'product_id,email' }
      );

    if (error) {
      console.error('Restock notification subscription error:', error);
      return { success: false, error: 'Failed to subscribe. Please try again.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in subscribeRestockNotification:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
