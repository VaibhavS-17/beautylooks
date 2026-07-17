'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductsTab from '../tabs/ProductsTab';
import { deleteProductAdmin, createProduct, updateProduct } from '@/app/actions/adminActions';

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  skinType: 'all' | 'oily' | 'dry' | 'combination' | 'sensitive';
  images: string[];
  brandId: string | null;
  categoryId: string | null;
  brand: string;
  category: string;
  faqs: Array<{ question: string; answer: string }>;
}

interface CategoryItem {
  id: string;
  name: string;
}

interface BrandItem {
  id: string;
  name: string;
}

export default function ProductsClient({
  initialProducts,
  initialCategories,
  initialBrands
}: {
  initialProducts: AdminProduct[];
  initialCategories: CategoryItem[];
  initialBrands: BrandItem[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [categories] = useState<CategoryItem[]>(initialCategories);
  const [brands] = useState<BrandItem[]>(initialBrands);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync with server props if refreshed
  React.useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const handleDeleteProduct = async (id: string) => {
    setDeletingProductId(id);
    try {
      const res = await deleteProductAdmin(id);
      if (res.error) {
        alert(res.error);
      } else {
        setProducts(prev => prev.filter(p => p.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error('Delete product error:', err);
      alert('An error occurred while deleting product.');
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = isEdit ? await updateProduct(formData) : await createProduct(formData);
      if (res.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error('Submit product error:', err);
      alert('An error occurred while saving product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductsTab
      products={products}
      categories={categories}
      brands={brands}
      deletingProductId={deletingProductId}
      handleDeleteProduct={handleDeleteProduct}
      handleProductSubmit={handleProductSubmit}
      loading={loading}
    />
  );
}
