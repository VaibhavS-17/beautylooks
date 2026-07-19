'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface DiscountData {
  code: string;
  discount_percent: number;
  valid_until?: string | null;
  usage_limit?: number | null;
  is_active: boolean;
}

export async function createDiscountCode(data: DiscountData) {
  const supabase = await createClient();

  // Validate admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { error: 'Unauthorized' };

  const { error } = await supabase.from('discount_codes').insert({
    code: data.code.toUpperCase(),
    discount_percent: data.discount_percent,
    valid_until: data.valid_until || null,
    usage_limit: data.usage_limit || null,
    is_active: data.is_active,
  });

  if (error) {
    if (error.code === '23505') {
      return { error: 'A discount code with this name already exists' };
    }
    return { error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/discounts');
  return { success: true };
}

export async function updateDiscountCode(id: string, data: DiscountData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('discount_codes')
    .update({
      code: data.code.toUpperCase(),
      discount_percent: data.discount_percent,
      valid_until: data.valid_until || null,
      usage_limit: data.usage_limit || null,
      is_active: data.is_active,
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') {
      return { error: 'A discount code with this name already exists' };
    }
    return { error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/discounts');
  return { success: true };
}

export async function deleteDiscountCode(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { error: 'Unauthorized' };

  const { error } = await supabase.from('discount_codes').delete().eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin');
  revalidatePath('/admin/discounts');
  return { success: true };
}
