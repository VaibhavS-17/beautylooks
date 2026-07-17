import React from 'react';
import { createClient } from '@/lib/supabase/server';
import BlogsClient from './BlogsClient';

export const dynamic = 'force-dynamic';

export default async function AdminBlogsPage() {
  const supabase = await createClient();

  const { data: blogsData, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching admin blogs:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
  }

  const mappedBlogs = (blogsData || []).map((b: any) => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt,
    content: b.content,
    cover_image: b.cover_image,
    is_published: b.is_published,
    published_at: b.published_at
  }));

  return <BlogsClient initialBlogs={mappedBlogs} />;
}
