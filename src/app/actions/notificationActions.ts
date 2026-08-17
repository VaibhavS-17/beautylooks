'use server';

import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const restockSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  email: z.string().email('Invalid email address').max(254),
});

export async function subscribeRestockNotification({
  productId,
  email,
}: {
  productId: string;
  email: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = restockSchema.safeParse({ productId, email });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input.' };
    }

    const supabase = await createClient();
    const normalizedEmail = parsed.data.email.toLowerCase().trim();

    const rl = await rateLimit('restock:' + normalizedEmail, 5, 60_000);
    if (!rl.success) return { success: false, error: 'Too many requests. Please try again later.' };

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
