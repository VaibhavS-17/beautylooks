'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CategoriesTab from '../tabs/CategoriesTab';
import { deleteCategory, createCategory, updateCategory } from '@/app/actions/adminActions';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

export default function CategoriesClient({ initialCategories }: { initialCategories: CategoryItem[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleDeleteCategory = async (id: string) => {
    setDeletingCategoryId(id);
    try {
      const res = await deleteCategory(id);
      if (res && res.error) {
        alert(res.error);
      } else {
        setCategories(prev => prev.filter(c => c.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error('Delete category error:', err);
      alert('An error occurred while deleting category.');
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = isEdit ? await updateCategory(formData) : await createCategory(formData);
      if (res && res.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error('Submit category error:', err);
      alert('An error occurred while saving category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CategoriesTab
      categories={categories}
      deletingCategoryId={deletingCategoryId}
      handleDeleteCategory={handleDeleteCategory}
      handleCategorySubmit={handleCategorySubmit}
      loading={loading}
    />
  );
}
