import { createClient } from '@/lib/supabase/server';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

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
    badge: productData.sale_price ? 'sale' : productData.is_featured ? 'bestseller' : 'new'
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
      category_id,
      brands (name),
      categories (name)
    `)
    .eq('category_id', mappedProduct.categoryId)
    .neq('id', mappedProduct.id)
    .limit(4);

  const mappedRelatedProducts = (relatedProductsData || []).map((p: any) => ({
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
    category: p.categories?.name || 'Unknown',
    categoryId: p.category_id,
    badge: p.sale_price ? 'sale' : p.is_featured ? 'bestseller' : 'new'
  }));

  return (
    <ProductDetailClient 
      product={mappedProduct} 
      relatedProducts={mappedRelatedProducts} 
    />
  );
}
