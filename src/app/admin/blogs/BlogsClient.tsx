'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BlogsTab from '../tabs/BlogsTab';
import { deleteBlog, createBlog, updateBlog } from '@/app/actions/adminActions';

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  is_published: boolean;
  published_at: string | null;
}

export default function BlogsClient({ initialBlogs }: { initialBlogs: BlogItem[] }) {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogItem[]>(initialBlogs);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setBlogs(initialBlogs);
  }, [initialBlogs]);

  const handleDeleteBlog = async (id: string) => {
    setDeletingBlogId(id);
    try {
      const res = await deleteBlog(id);
      if (res && res.error) {
        alert(res.error);
      } else {
        setBlogs(prev => prev.filter(b => b.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error('Delete blog error:', err);
      alert('An error occurred while deleting blog post.');
    } finally {
      setDeletingBlogId(null);
    }
  };

  const handleBlogSubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = isEdit ? await updateBlog(formData) : await createBlog(formData);
      if (res && res.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error('Submit blog error:', err);
      alert('An error occurred while saving blog post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div suppressHydrationWarning>
      <BlogsTab
        blogPosts={blogs}
        deletingBlogId={deletingBlogId}
        handleDeleteBlog={handleDeleteBlog}
        handleBlogSubmit={handleBlogSubmit}
        loading={loading}
      />
    </div>
  );
}
