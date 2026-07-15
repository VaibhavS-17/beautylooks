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
    .in('status', ['confirmed', 'shipped', 'delivered']);

  const grossRevenue = (revenueData || []).reduce((sum, item) => sum + Number(item.total_amount), 0);

  // Fetch recent orders with customer profile join
  const { data: recentOrdersData } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      status,
      created_at,
      failed_at,
      shipping_address,
      razorpay_order_id,
      razorpay_payment_id,
      profiles (
        full_name,
        phone
      ),
      order_items (
        id,
        quantity,
        unit_price,
        products (
          name,
          images
        )
      )
    `)
    .order('created_at', { ascending: false });

  const mappedOrders = (recentOrdersData || []).map((ord: any) => ({
    id: ord.id,
    customerName: ord.profiles?.full_name || 'Anonymous Customer',
    customerEmail: ord.profiles?.phone ? `+91 ${ord.profiles.phone}` : 'Registered Customer',
    amount: Number(ord.total_amount),
    status: ord.status,
    date: new Date(ord.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    failedAt: ord.failed_at ? new Date(ord.failed_at).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null,
    shippingAddress: ord.shipping_address || null,
    razorpayOrderId: ord.razorpay_order_id || null,
    razorpayPaymentId: ord.razorpay_payment_id || null,
    items: (ord.order_items || []).map((item: any) => ({
      name: item.products?.name || 'Unknown Product',
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      image: item.products?.images?.[0] || undefined
    }))
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
      faqs,
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
    category: p.categories?.name || 'Unknown',
    faqs: p.faqs || []
  }));

  const stats = {
    totalProducts: totalProducts || 0,
    totalOrders: totalOrders || 0,
    grossRevenue: grossRevenue || 0,
    activeCustomers: activeCustomers || 0
  };

  // Fetch all reviews for the reviews tab
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      profiles (full_name, phone),
      products (id, name, slug, images)
    `)
    .order('created_at', { ascending: false });

  const mappedReviews = (reviewsData || []).map((r: any) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment || '',
    createdAt: new Date(r.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    customerName: r.profiles?.full_name || 'Anonymous Customer',
    customerPhone: r.profiles?.phone ? `+91 ${r.profiles.phone}` : null,
    productId: r.products?.id || null,
    productName: r.products?.name || 'Unknown Product',
    productSlug: r.products?.slug || null,
    productImage: r.products?.images?.[0] || null
  }));

  const { data: discountCodesData } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <AdminClient 
      stats={stats} 
      recentOrders={mappedOrders}
      categories={categories || []}
      brands={brands || []}
      products={mappedAdminProducts}
      blogPosts={blogPosts || []}
      reviews={mappedReviews}
      discountCodes={discountCodesData || []}
      siteSettings={siteSettings || {
        hero_title: 'Unveil Your Radiance',
        hero_subtitle: 'The Autumn Collection',
        hero_description: 'Simple. Genuine. Affordable. Experience professional results at home with Mumbai\'s most trusted curated beauty sets.',
        hero_image_url: '/images/hero-beauty.png',
        hero_button_text: 'Shop Collection',
        hero_button_link: '/products',
        common_faqs: []
      }}
    />
  );
}
