import { createClient } from '@/lib/supabase/server';
import ProductsClient from './ProductsClient';
export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const supabase = await createClient();

  // Fetch all products
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
      images,
      is_featured,
      is_active,
      stock_quantity,
      category_id,
      skin_type,
      brands (name),
      categories (name)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const mappedProducts = (productsData || []).map((p: any) => ({
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
    brand: (p as any).brands?.name || 'Unknown',
    category: (p as any).categories?.name || 'Unknown',
    categoryId: p.category_id,
    skinType: p.skin_type || 'all',
    badge: p.sale_price ? 'sale' : p.is_featured ? 'bestseller' : 'new'
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

  // Fetch brands
  const { data: brandsData } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  const mappedBrands = (brandsData || []).map((b: any) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    logoUrl: b.logo_url
  }));

  return (
    <ProductsClient 
      products={mappedProducts} 
      allCategories={mappedCategories} 
      allBrands={mappedBrands} 
    />
  );
}
