import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/admin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/account');
  }

  // Fetch real statistics
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  const { count: activeCustomers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer');

  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount')
    .not('status', 'eq', 'cancelled');

  const grossRevenue = (revenueData || []).reduce((sum, item) => sum + Number(item.total_amount), 0);

  // Fetch recent orders with customer profile join
  const { data: recentOrdersData } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      status,
      created_at,
      profiles (
        full_name,
        phone
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  const mappedOrders = (recentOrdersData || []).map((ord: any) => ({
    id: ord.id,
    customerName: ord.profiles?.full_name || 'Anonymous Customer',
    customerEmail: ord.profiles?.phone ? `+91 ${ord.profiles.phone}` : 'Registered Customer',
    amount: Number(ord.total_amount),
    status: ord.status,
    date: new Date(ord.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }));

  // Fetch categories & brands for dropdowns
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, description, image_url')
    .order('name');

  const { data: brands } = await supabase
    .from('brands')
    .select('id, name, slug, logo_url')
    .order('name');

  // Fetch all blog posts
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, content, cover_image, is_published, published_at')
    .order('created_at', { ascending: false });

  // Fetch site settings
  const { data: siteSettings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  // Fetch all products for the catalog tab
  const { data: productsData } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      description,
      short_description,
      price,
      sale_price,
      stock_quantity,
      is_active,
      is_featured,
      skin_type,
      images,
      brand_id,
      category_id,
      brands (name),
      categories (name)
    `)
    .order('created_at', { ascending: false });
    
  const mappedAdminProducts = (productsData || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.short_description,
    price: p.price,
    salePrice: p.sale_price,
    stockQuantity: p.stock_quantity,
    isActive: p.is_active,
    isFeatured: p.is_featured,
    skinType: p.skin_type,
    images: p.images,
    brandId: p.brand_id,
    categoryId: p.category_id,
    brand: p.brands?.name || 'Unknown',
    category: p.categories?.name || 'Unknown'
  }));

  const stats = {
    totalProducts: totalProducts || 0,
    totalOrders: totalOrders || 0,
    grossRevenue: grossRevenue || 0,
    activeCustomers: activeCustomers || 0
  };

  return (
    <AdminClient 
      stats={stats} 
      recentOrders={mappedOrders}
      categories={categories || []}
      brands={brands || []}
      products={mappedAdminProducts}
      blogPosts={blogPosts || []}
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
