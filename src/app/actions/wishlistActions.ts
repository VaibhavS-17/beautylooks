'use server';

import { createClient } from '@/lib/supabase/server';

export async function syncWishlistWithDB(localProductIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  try {
    // 1. Fetch current DB wishlist
    const { data: dbItems, error: fetchError } = await supabase
      .from('wishlist_items')
      .select('product_id')
      .eq('user_id', user.id);

    if (fetchError) throw fetchError;

    const dbProductIds = new Set(dbItems?.map(item => item.product_id) || []);
    
    // 2. Find which local items need to be added to DB
    const itemsToAdd = localProductIds.filter(id => !dbProductIds.has(id));

    if (itemsToAdd.length > 0) {
      const inserts = itemsToAdd.map(id => ({
        user_id: user.id,
        product_id: id
      }));
      const { error: insertError } = await supabase.from('wishlist_items').insert(inserts);
      if (insertError) throw insertError;
    }

    // 3. Return the unified list of IDs
    const allIds = Array.from(new Set([...Array.from(dbProductIds), ...localProductIds]));
    return { success: true, items: allIds };
  } catch (error: any) {
    console.error('Failed to sync wishlist:', error);
    return { success: false, error: error.message };
  }
}

export async function addWishlistItemToDB(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase.from('wishlist_items').insert({
    user_id: user.id,
    product_id: productId
  });

  return { success: !error };
}

export async function removeWishlistItemFromDB(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase.from('wishlist_items')
    .delete()
    .match({ user_id: user.id, product_id: productId });

  return { success: !error };
}
