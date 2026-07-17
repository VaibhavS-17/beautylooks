import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ProductsClient from './ProductsClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const supabase = await createClient();

  // Fetch all products (both active and draft)
  const { data: productsData, error: productsError } = await supabase
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

  if (productsError) {
    console.error('Error fetching admin products:', productsError);
  }

  const mappedProducts = (productsData || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    shortDescription: p.short_description,
    price: Number(p.price) || 0,
    salePrice: p.sale_price ? Number(p.sale_price) : null,
    stockQuantity: Number(p.stock_quantity) || 0,
    isActive: p.is_active || false,
    isFeatured: p.is_featured || false,
    skinType: p.skin_type || 'all',
    images: Array.isArray(p.images) ? p.images : [],
    brandId: p.brand_id,
    categoryId: p.category_id,
    brand: p.brands?.name || 'No Brand',
    category: p.categories?.name || 'No Category',
    faqs: Array.isArray(p.faqs) ? p.faqs : [],
  }));

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  // Fetch brands
  const { data: brandsData } = await supabase
    .from('brands')
    .select('id, name')
    .order('name');

  return (
    <ProductsClient
      initialProducts={mappedProducts}
      initialCategories={categoriesData || []}
      initialBrands={brandsData || []}
    />
  );
}
