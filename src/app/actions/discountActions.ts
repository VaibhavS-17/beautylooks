'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const validateDiscountSchema = z.object({
  code: z.string().min(1, 'Discount code is required'),
});

export async function validateDiscountCode(code: string) {
  const parsed = validateDiscountSchema.safeParse({ code });
  if (!parsed.success) {
    return { error: 'Invalid discount code' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', parsed.data.code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return { error: 'Invalid or expired discount code' };
  }

  // Check usage limit if applicable
  if (data.usage_limit && data.usage_count >= data.usage_limit) {
    return { error: 'This discount code has reached its usage limit' };
  }

  // Check valid_until if applicable
  if (data.valid_until && new Date(data.valid_until) < new Date()) {
    return { error: 'This discount code has expired' };
  }

  return { success: true, discount: data };
}
