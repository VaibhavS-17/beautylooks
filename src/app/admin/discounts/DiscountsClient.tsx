'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DiscountsTab, { DiscountCode } from '../tabs/DiscountsTab';
import { createDiscountCode, updateDiscountCode, deleteDiscountCode } from '@/app/actions/adminDiscountActions';

export default function DiscountsClient({ initialDiscountCodes }: { initialDiscountCodes: DiscountCode[] }) {
  const router = useRouter();
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>(initialDiscountCodes);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    setDiscountCodes(initialDiscountCodes);
  }, [initialDiscountCodes]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await deleteDiscountCode(id);
      if (res && res.error) {
        alert(res.error);
      } else {
        setDiscountCodes(prev => prev.filter(d => d.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error('Delete discount error:', err);
      alert('An error occurred while deleting discount code.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, editItem: DiscountCode | null) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        code: formData.get('code') as string,
        discount_percent: Number(formData.get('discount_percent')),
        valid_until: formData.get('valid_until') ? (formData.get('valid_until') as string) : null,
        usage_limit: formData.get('usage_limit') ? Number(formData.get('usage_limit')) : null,
        is_active: formData.get('is_active') === 'on',
      };

      const res = editItem ? await updateDiscountCode(editItem.id, data) : await createDiscountCode(data);

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error('Submit discount error:', err);
      setErrorMsg('An error occurred while saving discount code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DiscountsTab
      discountCodes={discountCodes}
      deletingId={deletingId}
      handleDelete={handleDelete}
      handleSubmit={handleSubmit}
      loading={loading}
      errorMsg={errorMsg}
      setErrorMsg={setErrorMsg}
    />
  );
}
