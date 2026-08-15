import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://beautylooksmumbai.com';

  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/products',
    '/blog',
    '/faq',
    '/shipping',
    '/returns',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.6,
  }));

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("Supabase credentials missing, returning static routes for sitemap.");
    return staticRoutes;
  }

  const supabase = createAdminClient();

  // Fetch active products
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true);

  const productUrls = (products || []).map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updated_at || new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Fetch active blogs
  const { data: blogs } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('is_published', true);

  const blogUrls = (blogs || []).map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: blog.updated_at || new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug');

  const categoryUrls = (categories || []).map((category) => ({
    url: `${baseUrl}/products?category=${category.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));


  return [...staticRoutes, ...categoryUrls, ...productUrls, ...blogUrls];
}
