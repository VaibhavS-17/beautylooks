import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ReviewsClient from './ReviewsClient';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const supabase = await createClient();

  const { data: reviewsData, error } = await supabase
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

  if (error) {
    console.error('Error fetching admin reviews:', error);
  }

  const mappedReviews = (reviewsData || []).map((r: any) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment || '',
    createdAt: new Date(r.created_at).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    customerName: r.profiles?.full_name || 'Anonymous Customer',
    customerPhone: r.profiles?.phone ? `+91 ${r.profiles.phone}` : null,
    productId: r.products?.id || null,
    productName: r.products?.name || 'Deleted Product',
    productSlug: r.products?.slug || null,
    productImage: Array.isArray(r.products?.images) && r.products.images.length > 0
      ? r.products.images[0]
      : null,
  }));

  return <ReviewsClient initialReviews={mappedReviews} />;
}
