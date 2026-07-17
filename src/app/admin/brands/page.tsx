import React from 'react';
import { createClient } from '@/lib/supabase/server';
import BrandsClient from './BrandsClient';

export const dynamic = 'force-dynamic';

export default async function AdminBrandsPage() {
  const supabase = await createClient();

  const { data: brandsData, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching admin brands:', error);
  }

  const mappedBrands = (brandsData || []).map((b: any) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    logo_url: b.logo_url
  }));

  return <BrandsClient initialBrands={mappedBrands} />;
}
