'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { processRestockNotifications } from '@/lib/emailService';

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

const uuidSchema = z.string().uuid('Invalid ID format.');

// ---------------------------------------------------------------------------
// PRODUCTS ACTIONS
// ---------------------------------------------------------------------------

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  salePrice: z.coerce.number().min(0).optional().nullable(),
  categoryId: z.string().nullable().optional(),
  brandId: z.string().nullable().optional(),
  skinType: z.string().default('all'),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  imagesInput: z.string().optional(),
  image: z.string().optional(),
  faqsInput: z.string().optional(),
});

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const raw = {
    name: formData.get('name'),
    description: formData.get('description'),
    shortDescription: formData.get('shortDescription') || '',
    price: formData.get('price'),
    salePrice: formData.get('salePrice') || null,
    categoryId: formData.get('categoryId') || null,
    brandId: formData.get('brandId') || null,
    skinType: formData.get('skinType') || 'all',
    stockQuantity: formData.get('stockQuantity') || '0',
    isFeatured: formData.get('isFeatured') === 'true',
    isActive: formData.get('isActive') === 'true',
    imagesInput: formData.get('images'),
    image: formData.get('image'),
    faqsInput: formData.get('faqs') || '',
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid product data' };
  }
  const data = parsed.data;

  let images: string[] = ['/images/products/facial-kit-1.png'];
  const inputToParse = data.imagesInput || data.image;
  if (inputToParse) {
    try {
      images = JSON.parse(inputToParse);
      if (!Array.isArray(images) || images.length === 0) {
        images = [inputToParse];
      }
    } catch {
      images = [inputToParse];
    }
  }

  const slug = data.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  // Parse FAQs
  let faqs: Array<{ question: string; answer: string }> = [];
  if (data.faqsInput) {
    try {
      const parsedFaqs = JSON.parse(data.faqsInput);
      if (Array.isArray(parsedFaqs)) {
        faqs = parsedFaqs.filter((f: any) => f.question && f.answer);
      }
    } catch {
      // Ignore invalid JSON, default to empty array
    }
  }

  try {
    const { error } = await supabase.from('products').insert({
      name: data.name,
      slug,
      description: data.description,
      short_description: data.shortDescription,
      price: data.price,
      sale_price: data.salePrice,
      category_id: data.categoryId,
      brand_id: data.brandId,
      skin_type: data.skinType,
      stock_quantity: data.stockQuantity,
      is_featured: data.isFeatured,
      is_active: data.isActive,
      images,
      faqs,
    });

    if (error) {
      if (error.code === '23505') return { error: `A product with slug "${slug}" already exists.` };
      console.error('Create product error:', error);
      return { error: 'An unexpected error occurred. Please try again.' };
    }

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath(`/products/${slug}`);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Create product exception:', err);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function updateProduct(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const id = formData.get('id') as string;
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) return { error: 'Invalid product ID' };

  const raw = {
    name: formData.get('name'),
    description: formData.get('description'),
    shortDescription: formData.get('shortDescription') || '',
    price: formData.get('price'),
    salePrice: formData.get('salePrice') || null,
    categoryId: formData.get('categoryId') || null,
    brandId: formData.get('brandId') || null,
    skinType: formData.get('skinType') || 'all',
    stockQuantity: formData.get('stockQuantity') || '0',
    isFeatured: formData.get('isFeatured') === 'true',
    isActive: formData.get('isActive') === 'true',
    imagesInput: formData.get('images'),
    faqsInput: formData.get('faqs') || '',
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid product data' };
  }
  const data = parsed.data;

  const slug = data.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  try {
    // ── Fetch old stock to detect restock transition (0 → N) ──
    const { data: oldProduct } = await supabase
      .from('products')
      .select('stock_quantity, images')
      .eq('id', idParsed.data)
      .single();

    const updateData: any = {
      name: data.name,
      slug,
      description: data.description,
      short_description: data.shortDescription,
      price: data.price,
      sale_price: data.salePrice,
      category_id: data.categoryId,
      brand_id: data.brandId,
      skin_type: data.skinType,
      stock_quantity: data.stockQuantity,
      is_featured: data.isFeatured,
      is_active: data.isActive,
      updated_at: new Date().toISOString(),
    };

    if (data.imagesInput) {
      try {
        const pImgs = JSON.parse(data.imagesInput);
        updateData.images = Array.isArray(pImgs) ? pImgs : [data.imagesInput];
      } catch {
        updateData.images = [data.imagesInput];
      }
    }

    // Parse FAQs
    if (data.faqsInput) {
      try {
        const parsedFaqs = JSON.parse(data.faqsInput);
        if (Array.isArray(parsedFaqs)) {
          updateData.faqs = parsedFaqs.filter((f: any) => f.question && f.answer);
        }
      } catch {
        // Ignore invalid JSON
      }
    } else {
      updateData.faqs = [];
    }

    const { error } = await supabase.from('products').update(updateData).eq('id', idParsed.data);

    if (error) {
      if (error.code === '23505') return { error: `A product with slug "${slug}" already exists.` };
      console.error('Update product error:', error);
      return { error: 'An unexpected error occurred. Please try again.' };
    }

    // ── Restock Trigger: fire email notifications asynchronously ──
    if (
      oldProduct &&
      oldProduct.stock_quantity === 0 &&
      data.stockQuantity > 0
    ) {
      const productImages = updateData.images || oldProduct.images || [];
      await processRestockNotifications(idParsed.data, {
        name: data.name,
        slug,
        price: data.price,
        salePrice: data.salePrice ?? null,
        images: productImages,
      }).catch((err) =>
        console.error('[Restock] Failed to process notifications:', err)
      );
    }

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath(`/products/${slug}`);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Update product exception:', err);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function deleteProductAdmin(productId: string) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const parsed = uuidSchema.safeParse(productId);
  if (!parsed.success) return { error: 'Invalid product ID' };

  try {
    const { error } = await supabase.from('products').delete().eq('id', parsed.data);
    if (error) {
      console.error('Delete product error:', error);
      return { error: 'An unexpected error occurred. Please try again.' };
    }

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Delete product exception:', err);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

// ---------------------------------------------------------------------------
// BRANDS ACTIONS
// ---------------------------------------------------------------------------

const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  logoUrl: z.string().nullable().optional(),
});

export async function createBrand(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const raw = {
    name: formData.get('name'),
    logoUrl: formData.get('logoUrl') || null,
  };
  const parsed = brandSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { name, logoUrl } = parsed.data;

  const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  try {
    const { error } = await supabase.from('brands').insert({ name, slug, logo_url: logoUrl });
    if (error) {
      console.error('Create brand error:', error);
      return { error: 'An unexpected error occurred.' };
    }

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Create brand exception:', err);
    return { error: 'An unexpected error occurred.' };
  }
}

export async function updateBrand(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const id = formData.get('id') as string;
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) return { error: 'Invalid ID' };

  const raw = {
    name: formData.get('name'),
    logoUrl: formData.get('logoUrl'),
  };
  const parsed = brandSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { name, logoUrl } = parsed.data;

  const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  try {
    const updateData: any = { name, slug };
    if (logoUrl !== undefined) updateData.logo_url = logoUrl || null;

    const { error } = await supabase.from('brands').update(updateData).eq('id', idParsed.data);
    if (error) {
      console.error('Update brand error:', error);
      return { error: 'An unexpected error occurred.' };
    }

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Update brand exception:', err);
    return { error: 'An unexpected error occurred.' };
  }
}

export async function deleteBrand(brandId: string) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const idParsed = uuidSchema.safeParse(brandId);
  if (!idParsed.success) return { error: 'Invalid ID' };

  try {
    await supabase.from('products').update({ brand_id: null }).eq('brand_id', idParsed.data);
    const { error } = await supabase.from('brands').delete().eq('id', idParsed.data);

    if (error) {
      console.error('Delete brand error:', error);
      return { error: 'An unexpected error occurred.' };
    }

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    console.error('Delete brand exception:', err);
    return { error: 'An unexpected error occurred.' };
  }
}

// ---------------------------------------------------------------------------
// CATEGORIES ACTIONS
// ---------------------------------------------------------------------------

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const raw = {
    name: formData.get('name'),
    description: formData.get('description') || null,
    imageUrl: formData.get('imageUrl') || null,
  };
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { name, description, imageUrl } = parsed.data;

  const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  try {
    const { error } = await supabase.from('categories').insert({ name, slug, description, image_url: imageUrl });
    if (error) {
      console.error('Create category error:', error);
      return { error: 'An unexpected error occurred.' };
    }

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    console.error('Create category exception:', err);
    return { error: 'An unexpected error occurred.' };
  }
}

export async function updateCategory(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const id = formData.get('id') as string;
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) return { error: 'Invalid ID' };

  const raw = {
    name: formData.get('name'),
    description: formData.get('description') || null,
    imageUrl: formData.get('imageUrl'),
  };
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { name, description, imageUrl } = parsed.data;

  const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  try {
    const updateData: any = { name, slug, description };
    if (imageUrl !== undefined) updateData.image_url = imageUrl || null;

    const { error } = await supabase.from('categories').update(updateData).eq('id', idParsed.data);
    if (error) {
      console.error('Update category error:', error);
      return { error: 'An unexpected error occurred.' };
    }

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    console.error('Update category exception:', err);
    return { error: 'An unexpected error occurred.' };
  }
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const idParsed = uuidSchema.safeParse(categoryId);
  if (!idParsed.success) return { error: 'Invalid ID' };

  try {
    await supabase.from('products').update({ category_id: null }).eq('category_id', idParsed.data);
    const { error } = await supabase.from('categories').delete().eq('id', idParsed.data);

    if (error) {
      console.error('Delete category error:', error);
      return { error: 'An unexpected error occurred.' };
    }

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    console.error('Delete category exception:', err);
    return { error: 'An unexpected error occurred.' };
  }
}

// ---------------------------------------------------------------------------
// BLOGS ACTIONS
// ---------------------------------------------------------------------------

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  isPublished: z.boolean().default(false),
});

export async function createBlog(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const raw = {
    title: formData.get('title'),
    content: formData.get('content'),
    excerpt: formData.get('excerpt') || null,
    coverImage: formData.get('coverImage') || null,
    isPublished: formData.get('isPublished') === 'true',
  };
  const parsed = blogSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  const slug = data.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  try {
    const { error } = await supabase.from('blog_posts').insert({
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt,
      cover_image: data.coverImage,
      author_id: authCheck.userId,
      is_published: data.isPublished,
      published_at: data.isPublished ? new Date().toISOString() : null,
    });

    if (error) {
      console.error('Create blog error:', error);
      return { error: 'An unexpected error occurred.' };
    }

    revalidatePath('/admin');
    revalidatePath('/blog');
    return { success: true };
  } catch (err: any) {
    console.error('Create blog exception:', err);
    return { error: 'An unexpected error occurred.' };
  }
}

export async function updateBlog(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const id = formData.get('id') as string;
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) return { error: 'Invalid ID' };

  const raw = {
    title: formData.get('title'),
    content: formData.get('content'),
    excerpt: formData.get('excerpt') || null,
    coverImage: formData.get('coverImage'),
    isPublished: formData.get('isPublished') === 'true',
  };
  const parsed = blogSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  const slug = data.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  try {
    const updateData: any = {
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt,
      is_published: data.isPublished,
      published_at: data.isPublished ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    if (data.coverImage !== undefined) updateData.cover_image = data.coverImage || null;

    const { error } = await supabase.from('blog_posts').update(updateData).eq('id', idParsed.data);
    if (error) {
      console.error('Update blog error:', error);
      return { error: 'An unexpected error occurred.' };
    }

    revalidatePath('/admin');
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    return { success: true };
  } catch (err: any) {
    console.error('Update blog exception:', err);
    return { error: 'An unexpected error occurred.' };
  }
}

export async function deleteBlog(blogId: string) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const idParsed = uuidSchema.safeParse(blogId);
  if (!idParsed.success) return { error: 'Invalid ID' };

  try {
    const { error } = await supabase.from('blog_posts').delete().eq('id', idParsed.data);
    if (error) {
      console.error('Delete blog error:', error);
      return { error: 'An unexpected error occurred.' };
    }

    revalidatePath('/admin');
    revalidatePath('/blog');
    return { success: true };
  } catch (err: any) {
    console.error('Delete blog exception:', err);
    return { error: 'An unexpected error occurred.' };
  }
}

// ---------------------------------------------------------------------------
// SITE SETTINGS ACTIONS
// ---------------------------------------------------------------------------

const siteSettingsSchema = z.object({
  heroTitle: z.string().min(1, 'Hero Title is required'),
  heroSubtitle: z.string().min(1, 'Hero Subtitle is required'),
  heroDescription: z.string().min(1, 'Hero Description is required'),
  heroImageUrl: z.string().optional(),
  heroButtonText: z.string().optional(),
  heroButtonLink: z.string().optional(),
  commonFaqs: z.string().optional(),
});

export async function updateSiteSettings(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const raw = {
    heroTitle: formData.get('heroTitle'),
    heroSubtitle: formData.get('heroSubtitle'),
    heroDescription: formData.get('heroDescription'),
    heroImageUrl: formData.get('heroImageUrl') || '',
    heroButtonText: formData.get('heroButtonText') || '',
    heroButtonLink: formData.get('heroButtonLink') || '',
    commonFaqs: formData.get('commonFaqs') || '',
  };
  const parsed = siteSettingsSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  let commonFaqsParsed: any[] | undefined = undefined;
  if (data.commonFaqs) {
    try {
      commonFaqsParsed = JSON.parse(data.commonFaqs);
    } catch (e) {
      console.error('Invalid commonFaqs JSON');
    }
  }

  try {
    const updatePayload: any = {
      hero_title: data.heroTitle,
      hero_subtitle: data.heroSubtitle,
      hero_description: data.heroDescription,
      hero_image_url: data.heroImageUrl,
      hero_button_text: data.heroButtonText,
      hero_button_link: data.heroButtonLink,
      updated_at: new Date().toISOString(),
    };

    if (commonFaqsParsed !== undefined) {
      updatePayload.common_faqs = commonFaqsParsed;
    }

    const { error } = await supabase.from('site_settings').update(updatePayload).eq('id', 'default');

    if (error) {
      console.error('Update settings error:', error);
      return { error: 'An unexpected error occurred.' };
    }

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    console.error('Update settings exception:', err);
    return { error: 'An unexpected error occurred.' };
  }
}

// ---------------------------------------------------------------------------
// ORDERS & OTHER ACTIONS
// ---------------------------------------------------------------------------

const statusSchema = z.enum(['pending', 'payment_verifying', 'confirmed', 'shipped', 'delivered', 'cancelled']);

export async function updateOrderStatusAdmin(orderId: string, status: string) {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  const idParsed = uuidSchema.safeParse(orderId);
  const statusParsed = statusSchema.safeParse(status);
  
  if (!idParsed.success) return { error: 'Invalid Order ID' };
  if (!statusParsed.success) return { error: 'Invalid Status' };

  try {
    const { error } = await supabase.from('orders').update({ 
      status: statusParsed.data, 
      updated_at: new Date().toISOString() 
    }).eq('id', idParsed.data);

    if (error) {
      console.error('Update order status error:', error);
      return { error: 'An unexpected error occurred.' };
    }

    revalidatePath('/admin');
    revalidatePath('/account');
    return { success: true };
  } catch (err: any) {
    console.error('Update order status exception:', err);
    return { error: 'An unexpected error occurred.' };
  }
}

export async function syncMockData() {
  const supabase = await createClient();
  const authCheck = await verifyAdmin(supabase);
  if (!authCheck.verified) return { error: authCheck.error };

  try {
    // Seed Categories
    const { count: catCount, error: catError } = await supabase.from('categories').select('*', { count: 'exact', head: true });
    if (catError) console.error(catError);
    if (catCount === 0) {
      await supabase.from('categories').insert([
        { name: 'Facial Kits', slug: 'facial-kits', description: 'Complete facial kits for salon-like results at home.', image_url: '/images/categories/facial-kits.png' },
        { name: 'Serums & Oils', slug: 'serums-oils', description: 'Potent serums and nourishing oils for targeted skincare treatments.', image_url: '/images/categories/serums.png' },
        { name: 'Cleansers', slug: 'cleansers', description: 'Gentle yet effective cleansers to purify and refresh your skin daily.', image_url: '/images/categories/cleansers.png' },
        { name: 'Face Masks', slug: 'face-masks', description: 'Luxurious face masks for deep cleansing, hydration, and radiant glow.', image_url: '/images/categories/masks.png' }
      ]);
    }

    // Seed Brands
    const { count: brandCount, error: brandError } = await supabase.from('brands').select('*', { count: 'exact', head: true });
    if (brandError) console.error(brandError);
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
    console.error('Seed exception:', err);
    return { error: 'Seeding failed.' };
  }
}
