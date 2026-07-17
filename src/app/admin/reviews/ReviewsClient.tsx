'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReviewsTab from '../tabs/ReviewsTab';
import { deleteReviewAdmin } from '@/app/actions/adminActions';
import { AdminReview } from '../tabs/ReviewsTab';

export default function ReviewsClient({ initialReviews }: { initialReviews: AdminReview[] }) {
  const router = useRouter();
  const [reviews, setReviews] = useState<AdminReview[]>(initialReviews);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  React.useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  const handleDeleteReview = async (reviewId: string) => {
    setDeletingReviewId(reviewId);
    try {
      const res = await deleteReviewAdmin(reviewId);
      if (res.error) {
        alert(res.error);
      } else {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        router.refresh();
      }
    } catch (err) {
      console.error('Delete review error:', err);
      alert('An error occurred while deleting review.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  return (
    <ReviewsTab
      reviews={reviews}
      deletingReviewId={deletingReviewId}
      handleDeleteReview={handleDeleteReview}
    />
  );
}
