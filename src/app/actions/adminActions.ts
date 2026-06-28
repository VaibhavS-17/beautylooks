'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  
  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized. Admin access required.' };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const shortDescription = formData.get('shortDescription') as string;
  const price = parseFloat(formData.get('price') as string);
  const salePriceVal = formData.get('salePrice') as string;
  const salePrice = salePriceVal ? parseFloat(salePriceVal) : null;
  const categoryId = formData.get('categoryId') as string || null;
  const brandId = formData.get('brandId') as string || null;
  const skinType = formData.get('skinType') as any || 'all';
  const stockQuantity = parseInt(formData.get('stockQuantity') as string || '0');
  const isFeatured = formData.get('isFeatured') === 'true';
  const isActive = formData.get('isActive') === 'true';
  const imageInput = formData.get('image') as string || '/images/products/facial-kit-1.png';

  if (!name || !description || isNaN(price)) {
    return { error: 'Name, Description, and Price are required.' };
  }

  // Generate slug
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  try {
    const { error } = await supabase
      .from('products')
      .insert({
        name,
        slug,
        description,
        short_description: shortDescription,
        price,
        sale_price: salePrice,
        category_id: categoryId,
        brand_id: brandId,
        skin_type: skinType,
        stock_quantity: stockQuantity,
        is_featured: isFeatured,
        is_active: isActive,
        images: [imageInput],
      });

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return { error: `A product with slug "${slug}" already exists. Please choose a different name.` };
      }
      return { error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/products');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function updateOrderStatusAdmin(orderId: string, status: string) {
  const supabase = await createClient();
  
  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized. Admin access required.' };
  }

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) return { error: error.message };

    revalidatePath('/admin');
    revalidatePath('/account');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to update order status.' };
  }
}

// Seed helper to populate categories/brands if empty
export async function syncMockData() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized.' };
  }

  try {
    // Seed Categories
    const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
    if (catCount === 0) {
      await supabase.from('categories').insert([
        { name: 'Facial Kits', slug: 'facial-kits', description: 'Complete facial kits for salon-like results at home.', image_url: '/images/categories/facial-kits.png' },
        { name: 'Serums & Oils', slug: 'serums-oils', description: 'Potent serums and nourishing oils for targeted skincare treatments.', image_url: '/images/categories/serums.png' },
        { name: 'Cleansers', slug: 'cleansers', description: 'Gentle yet effective cleansers to purify and refresh your skin daily.', image_url: '/images/categories/cleansers.png' },
        { name: 'Face Masks', slug: 'face-masks', description: 'Luxurious face masks for deep cleansing, hydration, and radiant glow.', image_url: '/images/categories/masks.png' }
      ]);
    }

    // Seed Brands
    const { count: brandCount } = await supabase.from('brands').select('*', { count: 'exact', head: true });
    if (brandCount === 0) {
      await supabase.from('brands').insert([
        { name: 'O3+', slug: 'o3-plus', logo_url: '/images/brands/o3.png' },
        { name: 'VLCC', slug: 'vlcc', logo_url: '/images/brands/vlcc.png' },
        { name: 'Lotus Herbals', slug: 'lotus-herbals', logo_url: '/images/brands/lotus.png' },
        { name: 'Mamaearth', slug: 'mamaearth', logo_url: '/images/brands/mamaearth.png' },
        { name: 'Biotique', slug: 'biotique', logo_url: '/images/brands/biotique.png' },
        { name: 'Plum', slug: 'plum', logo_url: '/images/brands/plum.png' }
      ]);
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Seeding failed.' };
  }
}
