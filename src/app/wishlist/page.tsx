import { createClient } from '@/lib/supabase/server';
import WishlistClient from './WishlistClient';

export default async function WishlistPage() {
  const supabase = await createClient();

  const { data: productsData } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      price,
      sale_price,
      stock_quantity,
      images,
      brands (name)
    `)
    .eq('is_active', true);

  const mappedProducts = (productsData || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    salePrice: p.sale_price,
    stockQuantity: p.stock_quantity,
    images: p.images || [],
    brand: (p as any).brands?.name || 'Unknown',
  }));

  return <WishlistClient products={mappedProducts} />;
}
