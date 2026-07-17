import React from 'react';
import { createClient } from '@/lib/supabase/server';
import CategoriesClient from './CategoriesClient';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: categoriesData, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching admin categories:', error);
  }

  const mappedCategories = (categoriesData || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image_url: c.image_url
  }));

  return <CategoriesClient initialCategories={mappedCategories} />;
}
