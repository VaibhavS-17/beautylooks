import { createClient } from '@/lib/supabase/server';
import BlogDetailClient from './BlogDetailClient';
import { notFound } from 'next/navigation';

export default async function BlogPostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: postData, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !postData || !postData.is_published) {
    notFound();
  }

  const mappedPost = {
    id: postData.id,
    title: postData.title,
    slug: postData.slug,
    content: postData.content,
    excerpt: postData.excerpt,
    coverImage: postData.cover_image,
    authorName: postData.author_name,
    isPublished: postData.is_published,
    readTime: postData.read_time,
    publishedAt: new Date(postData.published_at || postData.created_at).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  };

  const { data: relatedPostsData } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .neq('id', mappedPost.id)
    .limit(2);

  const mappedRelatedPosts = (relatedPostsData || []).map((b: any) => ({
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

  return <BlogDetailClient post={mappedPost} relatedPosts={mappedRelatedPosts} />;
}
