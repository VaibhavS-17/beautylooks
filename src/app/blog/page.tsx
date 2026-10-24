import { createPublicClient } from '@/lib/supabase/public';
import BlogClient from './BlogClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Blog | Beauty Looks Mumbai",
  description: "Read the latest beauty tips and news from Beauty Looks Mumbai.",
};

export const revalidate = 3600;

export default async function BlogPage() {
  const supabase = createPublicClient();

  const { data: blogPostsData } = await supabase
    .from('blog_posts')
    .select('id, title, slug, content, excerpt, cover_image, author_name, is_published, read_time, published_at, created_at')
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
