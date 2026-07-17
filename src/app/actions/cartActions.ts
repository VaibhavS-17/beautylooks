'use server';

import { createClient } from '@/lib/supabase/server';
import { CartItem } from '@/lib/types';

export async function syncCartWithDB(localItems: CartItem[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  try {
    // 1. Fetch current DB cart
    const { data: dbCart, error: fetchError } = await supabase
      .from('carts')
      .select('items')
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is not found
      throw fetchError;
    }

    let mergedItems = [...localItems];

    if (dbCart?.items) {
      const dbItems = dbCart.items as CartItem[];
      
      // Merge: if item exists in both, keep local or sum quantities? 
      // For simplicity, we'll keep local state as source of truth for duplicates, 
      // but add dbItems that aren't in local.
      const localProductIds = new Set(localItems.map(item => item.product.id));
      
      const missingFromLocal = dbItems.filter(item => !localProductIds.has(item.product.id));
      mergedItems = [...localItems, ...missingFromLocal];
    }

    // 2. Save merged back to DB
    const { error: upsertError } = await supabase
      .from('carts')
      .upsert({
        user_id: user.id,
        items: mergedItems
      }, { onConflict: 'user_id' });

    if (upsertError) throw upsertError;

    return { success: true, items: mergedItems };
  } catch (error: any) {
    console.error('Failed to sync cart:', error);
    return { success: false, error: error.message };
  }
}

export async function updateCartInDB(items: CartItem[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase
    .from('carts')
    .upsert({
      user_id: user.id,
      items
    }, { onConflict: 'user_id' });

  return { success: !error };
}
