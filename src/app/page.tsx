import { createClient } from '@/lib/supabase/server';
import HomeClient from './HomeClient';
export const dynamic = 'force-dynamic';

export default async function Homepage() {
  const supabase = await createClient();

  // Fetch featured products
  const { data: featuredProducts } = await supabase
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
      brands (name)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(4);

  // Map to format HomeClient expects (brand name flattening)
  const mappedFeaturedProducts = (featuredProducts || []).map((p: any) => ({
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
    brand: p.brands?.name || 'Unknown',
    badge: p.sale_price ? 'sale' : 'bestseller'
  }));

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  const mappedCategories = (categoriesData || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: c.image_url
  }));

  // Fetch blog posts
  const { data: blogPostsData } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(3);

  const mappedBlogPosts = (blogPostsData || []).map((b: any) => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt,
    coverImage: b.cover_image,
    publishedAt: new Date(b.published_at || b.created_at).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }));

  // Fetch Site Settings
  const { data: siteSettings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  return (
    <HomeClient 
      featuredProducts={mappedFeaturedProducts} 
      categories={mappedCategories} 
      blogPosts={mappedBlogPosts}
      siteSettings={siteSettings || {
        hero_title: 'Unveil Your Radiance',
        hero_subtitle: 'The Autumn Collection',
        hero_description: 'Simple. Genuine. Affordable. Experience professional results at home with Mumbai\'s most trusted curated beauty sets.',
        hero_image_url: '/images/hero-beauty.png',
        hero_button_text: 'Shop Collection',
        hero_button_link: '/products'
      }}
    />
  );
}
