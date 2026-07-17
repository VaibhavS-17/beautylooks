import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';
export const revalidate = 3600;

// ── Dynamic SEO & Open Graph ──
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('name, short_description, images, price, sale_price')
    .eq('slug', slug)
    .single();

  if (!data) return { title: 'Product Not Found' };

  const price = data.sale_price || data.price;
  const title = `${data.name} — ₹${price} | Beauty Looks Mumbai`;
  const description = data.short_description || `Shop ${data.name} at Beauty Looks Mumbai. Premium beauty & skincare.`;
  const image = data.images?.[0] || '/images/hero-beauty.png';

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image }], type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: productData, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      description,
      short_description,
      price,
      sale_price,
      images,
      is_featured,
      is_active,
      stock_quantity,
      skin_type,
      category_id,
      faqs,
      brands (name),
      categories (name)
    `)
    .eq('slug', slug)
    .single();

  if (error || !productData) {
    notFound();
  }

  const mappedProduct = {
    id: productData.id,
    name: productData.name,
    slug: productData.slug,
    description: productData.description,
    shortDescription: productData.short_description,
    price: productData.price,
    salePrice: productData.sale_price,
    images: productData.images || [],
    isFeatured: productData.is_featured,
    isActive: productData.is_active,
    stockQuantity: productData.stock_quantity,
    skinType: (productData as any).skin_type,
    brand: (productData as any).brands?.name || 'Unknown',
    category: (productData as any).categories?.name || 'Unknown',
    categoryId: productData.category_id,
    badge: productData.sale_price ? 'sale' : productData.is_featured ? 'bestseller' : 'new',
    faqs: (productData as any).faqs || []
  };

  // Fetch related products
  const { data: relatedProductsData } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      description,
      short_description,
      price,
      sale_price,
      images,
      is_featured,
      is_active,
      stock_quantity,
      category_id,
      brands (name),
      categories (name),
      reviews (rating)
    `)
    .eq('category_id', mappedProduct.categoryId)
    .neq('id', mappedProduct.id)
    .limit(4);

  const mappedRelatedProducts = (relatedProductsData || []).map((p: any) => {
    const pReviews = p.reviews || [];
    const pCount = pReviews.length;
    const pAvg = pCount > 0
      ? pReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / pCount
      : 0;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDescription: p.short_description,
      price: p.price,
      salePrice: p.sale_price,
      images: p.images || [],
      isFeatured: p.is_featured,
      isActive: p.is_active,
      stockQuantity: p.stock_quantity,
      brand: p.brands?.name || 'Unknown',
      category: p.categories?.name || 'Unknown',
      categoryId: p.category_id,
      badge: p.sale_price ? 'sale' : p.is_featured ? 'bestseller' : 'new',
      rating: Math.round(pAvg * 10) / 10,
      reviewCount: pCount
    };
  });

  // ── Fetch Reviews ──
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      helpful_count,
      profiles (full_name, avatar_url)
    `)
    .eq('product_id', mappedProduct.id)
    .order('created_at', { ascending: false });

  const reviews = (reviewsData || []).map((r: any) => ({
    id: r.id,
    userName: r.profiles?.full_name || 'Anonymous',
    rating: r.rating as number,
    comment: r.comment as string,
    createdAt: r.created_at as string,
    avatarUrl: (r.profiles?.avatar_url as string) || null,
    helpfulCount: (r.helpful_count as number) || 0,
  }));

  // Compute aggregate stats
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewCount
      : 0;

  // ── Check user eligibility ──
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasReviewed = false;
  let canReview = false;
  const currentUserId = user?.id ?? null;

  if (user) {
    // Has the user already reviewed this product?
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', mappedProduct.id)
      .single();

    hasReviewed = !!existingReview;

    // Has the user purchased this product with a qualifying order?
    const { data: eligibleOrders } = await supabase
      .from('order_items')
      .select(`
        id,
        orders!inner (
          user_id,
          status
        )
      `)
      .eq('product_id', mappedProduct.id)
      .eq('orders.user_id', user.id)
      .eq('orders.status', 'delivered');

    canReview = (eligibleOrders && eligibleOrders.length > 0) || false;
  }

  // Fetch admin-editable common FAQs from site_settings
  const { data: siteSettingsData } = await supabase
    .from('site_settings')
    .select('common_faqs')
    .eq('id', 'default')
    .single();

  const commonFaqs = siteSettingsData?.common_faqs || [];

  return (
    <ProductDetailClient
      product={mappedProduct as any}
      relatedProducts={mappedRelatedProducts as any}
      reviews={reviews as any}
      averageRating={Math.round(averageRating * 10) / 10}
      reviewCount={reviewCount}
      canReview={canReview}
      hasReviewed={hasReviewed}
      currentUserId={currentUserId}
      commonFaqs={commonFaqs}
    />
  );
}
