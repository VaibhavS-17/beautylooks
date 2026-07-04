'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper to verify admin role
async function verifyAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated', verified: false };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized. Admin access required.', verified: false };
  }

  return { verified: true, userId: user.id };
}

// ---------------------------------------------------------------------------
// PRODUCTS ACTIONS
// ---------------------------------------------------------------------------

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

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
  const imagesInput = formData.get('images') as string || formData.get('image') as string;
  let images: string[] = ['/images/products/facial-kit-1.png'];
  if (imagesInput) {
    try {
      images = JSON.parse(imagesInput);
      if (!Array.isArray(images) || images.length === 0) {
        images = [imagesInput];
      }
    } catch {
      images = [imagesInput];
    }
  }

  if (!name || !description || isNaN(price)) {
    return { error: 'Name, Description, and Price are required.' };
  }

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
        images: images,
      });

    if (error) {
      if (error.code === '23505') {
        return { error: `A product with slug "${slug}" already exists. Please choose a different name.` };
      }
      return { error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath(`/products/${slug}`);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function updateProduct(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const id = formData.get('id') as string;
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
  const imagesInput = formData.get('images') as string;

  if (!id || !name || !description || isNaN(price)) {
    return { error: 'ID, Name, Description, and Price are required.' };
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  try {
    const updateData: any = {
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
      updated_at: new Date().toISOString(),
    };

    if (imagesInput) {
      try {
        const parsed = JSON.parse(imagesInput);
        updateData.images = Array.isArray(parsed) ? parsed : [imagesInput];
      } catch {
        updateData.images = [imagesInput];
      }
    }

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id);

    if (error) {
      if (error.code === '23505') {
        return { error: `A product with slug "${slug}" already exists. Please choose a different name.` };
      }
      return { error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath(`/products/${slug}`);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function deleteProductAdmin(productId: string) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) return { error: error.message };

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete product.' };
  }
}

// ---------------------------------------------------------------------------
// BRANDS ACTIONS
// ---------------------------------------------------------------------------

export async function createBrand(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const name = formData.get('name') as string;
  const logoUrl = formData.get('logoUrl') as string || null;

  if (!name) return { error: 'Brand name is required.' };

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  try {
    const { error } = await supabase
      .from('brands')
      .insert({ name, slug, logo_url: logoUrl });

    if (error) return { error: error.message };

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function updateBrand(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const logoUrl = formData.get('logoUrl') as string;

  if (!id || !name) return { error: 'ID and Brand name are required.' };

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  try {
    const updateData: any = { name, slug };
    if (logoUrl !== undefined) {
      updateData.logo_url = logoUrl || null;
    }

    const { error } = await supabase
      .from('brands')
      .update(updateData)
      .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function deleteBrand(brandId: string) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  try {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', brandId);

    if (error) return { error: error.message };

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete brand.' };
  }
}

// ---------------------------------------------------------------------------
// CATEGORIES ACTIONS
// ---------------------------------------------------------------------------

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const name = formData.get('name') as string;
  const description = formData.get('description') as string || null;
  const imageUrl = formData.get('imageUrl') as string || null;

  if (!name) return { error: 'Category name is required.' };

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  try {
    const { error } = await supabase
      .from('categories')
      .insert({ name, slug, description, image_url: imageUrl });

    if (error) return { error: error.message };

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function updateCategory(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string || null;
  const imageUrl = formData.get('imageUrl') as string;

  if (!id || !name) return { error: 'ID and Category name are required.' };

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  try {
    const updateData: any = { name, slug, description };
    if (imageUrl !== undefined) {
      updateData.image_url = imageUrl || null;
    }

    const { error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) return { error: error.message };

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete category.' };
  }
}

// ---------------------------------------------------------------------------
// BLOGS ACTIONS
// ---------------------------------------------------------------------------

export async function createBlog(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const excerpt = formData.get('excerpt') as string || null;
  const coverImage = formData.get('coverImage') as string || null;
  const isPublished = formData.get('isPublished') === 'true';

  if (!title || !content) return { error: 'Title and Content are required.' };

  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  try {
    const { error } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug,
        content,
        excerpt,
        cover_image: coverImage,
        author_id: authCheck.userId,
        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null,
      });

    if (error) return { error: error.message };

    revalidatePath('/admin');
    revalidatePath('/blog');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function updateBlog(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const excerpt = formData.get('excerpt') as string || null;
  const coverImage = formData.get('coverImage') as string;
  const isPublished = formData.get('isPublished') === 'true';

  if (!id || !title || !content) return { error: 'ID, Title, and Content are required.' };

  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  try {
    const updateData: any = {
      title,
      slug,
      content,
      excerpt,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (coverImage !== undefined) {
      updateData.cover_image = coverImage || null;
    }

    const { error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/admin');
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function deleteBlog(blogId: string) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', blogId);

    if (error) return { error: error.message };

    revalidatePath('/admin');
    revalidatePath('/blog');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete blog.' };
  }
}

// ---------------------------------------------------------------------------
// SITE SETTINGS ACTIONS
// ---------------------------------------------------------------------------

export async function updateSiteSettings(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const heroTitle = formData.get('heroTitle') as string;
  const heroSubtitle = formData.get('heroSubtitle') as string;
  const heroDescription = formData.get('heroDescription') as string;
  const heroImageUrl = formData.get('heroImageUrl') as string;
  const heroButtonText = formData.get('heroButtonText') as string;
  const heroButtonLink = formData.get('heroButtonLink') as string;

  if (!heroTitle || !heroSubtitle || !heroDescription) {
    return { error: 'Hero Title, Subtitle, and Description are required.' };
  }

  try {
    const { error } = await supabase
      .from('site_settings')
      .update({
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_description: heroDescription,
        hero_image_url: heroImageUrl,
        hero_button_text: heroButtonText,
        hero_button_link: heroButtonLink,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'default');

    if (error) return { error: error.message };

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

// ---------------------------------------------------------------------------
// ORDERS & OTHER ACTIONS
// ---------------------------------------------------------------------------

export async function updateOrderStatusAdmin(orderId: string, status: string) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

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

export async function syncMockData() {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

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
