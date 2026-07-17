'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BrandsTab from '../tabs/BrandsTab';
import { deleteBrand, createBrand, updateBrand } from '@/app/actions/adminActions';

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export default function BrandsClient({ initialBrands }: { initialBrands: BrandItem[] }) {
  const router = useRouter();
  const [brands, setBrands] = useState<BrandItem[]>(initialBrands);
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setBrands(initialBrands);
  }, [initialBrands]);

  const handleDeleteBrand = async (id: string) => {
    setDeletingBrandId(id);
    try {
      const res = await deleteBrand(id);
      if (res && res.error) {
        alert(res.error);
      } else {
        setBrands(prev => prev.filter(b => b.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error('Delete brand error:', err);
      alert('An error occurred while deleting brand.');
    } finally {
      setDeletingBrandId(null);
    }
  };

  const handleBrandSubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = isEdit ? await updateBrand(formData) : await createBrand(formData);
      if (res && res.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error('Submit brand error:', err);
      alert('An error occurred while saving brand.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrandsTab
      brands={brands}
      deletingBrandId={deletingBrandId}
      handleDeleteBrand={handleDeleteBrand}
      handleBrandSubmit={handleBrandSubmit}
      loading={loading}
    />
  );
}
