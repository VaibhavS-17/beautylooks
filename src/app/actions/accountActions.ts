'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createAddress(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const label = formData.get('label') as string || 'Home';
  const fullName = formData.get('fullName') as string;
  const phone = formData.get('phone') as string;
  const line1 = formData.get('line1') as string;
  const line2 = formData.get('line2') as string || null;
  const city = formData.get('city') as string;
  const state = formData.get('state') as string;
  const pincode = formData.get('pincode') as string;
  const isDefault = formData.get('isDefault') === 'true';

  if (!fullName || !phone || !line1 || !city || !state || !pincode) {
    return { error: 'Missing required address fields.' };
  }

  try {
    // Ensure profile exists to prevent foreign key constraint violations
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      phone: user.user_metadata?.phone || null,
      avatar_url: user.user_metadata?.avatar_url || null,
    }, { onConflict: 'id' });

    // If setting as default, unset other defaults first
    if (isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const { data: newAddress, error } = await supabase
      .from('addresses')
      .insert({
        user_id: user.id,
        label,
        full_name: fullName,
        phone,
        line1,
        line2,
        city,
        state,
        pincode,
        is_default: isDefault,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/account');
    return { success: true, data: newAddress };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function deleteAddress(addressId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  try {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', user.id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/account');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}
