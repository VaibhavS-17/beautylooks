import { createClient } from '@/lib/supabase/server';
import BlogClient from './BlogClient';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Blog | Beauty Looks Mumbai",
  description: "Read the latest beauty tips and news from Beauty Looks Mumbai.",
};

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: blogPostsData } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  const mappedBlogPosts = (blogPostsData || []).map((b: any) => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    content: b.content,
    excerpt: b.excerpt,
    coverImage: b.cover_image,
    authorName: b.author_name,
    isPublished: b.is_published,
    readTime: b.read_time,
    publishedAt: new Date(b.published_at || b.created_at).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }));

  return <BlogClient blogPosts={mappedBlogPosts} />;
}
