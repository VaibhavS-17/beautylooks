'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Star, Trash2, ExternalLink, MessageSquare, Loader2, Filter, User } from 'lucide-react';
import { AdminReview } from '../AdminClient';

interface ReviewsTabProps {
  reviews: AdminReview[];
  deletingReviewId: string | null;
  handleDeleteReview: (reviewId: string) => void;
}

export default function ReviewsTab({
  reviews,
  deletingReviewId,
  handleDeleteReview
}: ReviewsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  // Calculate statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return { total: 0, average: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / total;
    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
    });
    return { total, average, breakdown };
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.productName.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q)
      );
    }

    if (ratingFilter !== 'all') {
      const targetRating = parseInt(ratingFilter, 10);
      result = result.filter(r => r.rating === targetRating);
    }

    return result;
  }, [reviews, searchQuery, ratingFilter]);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EFECE6] pb-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-wider text-[#1C1917] uppercase flex items-center gap-2.5">
            <MessageSquare size={24} className="text-[#CA8A04]" />
            <span>Customer Reviews Console</span>
          </h2>
          <p className="text-xs text-[#8A8177] mt-1 font-light">
            Monitor, review, and moderate submitted ratings and customer feedback across your catalog.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#FAF9F6] px-4 py-2 rounded-xl border border-[#EFECE6]">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8177] block leading-none">Average Rating</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Star size={16} className="text-[#CA8A04] fill-[#CA8A04]" />
              <span className="text-base font-bold text-[#1C1917]">{stats.average ? stats.average.toFixed(1) : 'N/A'}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-[#EFECE6] mx-1" />
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8177] block leading-none">Total Reviews</span>
            <span className="text-base font-bold text-[#1C1917] mt-1 block">{stats.total}</span>
          </div>
        </div>
      </div>

      {/* Rating Breakdown Bars */}
      {stats.total > 0 && (
        <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#EFECE6] grid grid-cols-1 sm:grid-cols-5 gap-4">
          {[5, 4, 3, 2, 1].map(stars => {
            const count = stats.breakdown[stars] || 0;
            const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return (
              <button
                key={stars}
                type="button"
                onClick={() => setRatingFilter(ratingFilter === stars.toString() ? 'all' : stars.toString())}
                className={`flex flex-col gap-1.5 p-3 rounded-xl border transition-all text-left ${
                  ratingFilter === stars.toString()
                    ? 'bg-[#1C1917] text-white border-[#1C1917] shadow-sm'
                    : 'bg-white text-[#1C1917] border-[#EFECE6] hover:border-[#CA8A04]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1">
                    <span>{stars}</span>
                    <Star size={12} className={ratingFilter === stars.toString() ? 'text-[#CA8A04] fill-[#CA8A04]' : 'text-[#CA8A04] fill-[#CA8A04]'} />
                  </span>
                  <span className={ratingFilter === stars.toString() ? 'text-white/80 font-normal' : 'text-[#8A8177] font-normal'}>{count}</span>
                </div>
                <div className="w-full bg-[#EFECE6] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#CA8A04] h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-3 text-[#8A8177]" />
          <input
            type="text"
            placeholder="Search by product name, customer name, or comment text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EFECE6] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#CA8A04]"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="appearance-none bg-white border border-[#EFECE6] rounded-xl py-2.5 pl-3.5 pr-8 text-xs font-semibold uppercase tracking-wider text-[#1C1917] focus:outline-none focus:border-[#CA8A04] cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <Filter size={14} className="absolute right-3 top-3 text-[#8A8177] pointer-events-none" />
          </div>
          {(searchQuery || ratingFilter !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setRatingFilter('all'); }}
              className="text-xs font-semibold text-[#8A8177] hover:text-[#1C1917] px-3 py-2.5 transition-colors shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-[#FAF9F6] border border-[#EFECE6] rounded-2xl p-12 text-center">
          <MessageSquare size={36} className="text-[#CA8A04] mx-auto mb-3 opacity-60" />
          <h3 className="font-display text-base font-bold text-[#1C1917] uppercase tracking-wider mb-1">
            No reviews found
          </h3>
          <p className="text-xs text-[#8A8177]">
            {reviews.length === 0
              ? 'No customer reviews have been submitted yet.'
              : 'Try clearing your search query or adjusting the rating filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Customer & Rating */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EFECE6]/60 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#FAF9F6] border border-[#EFECE6] flex items-center justify-center text-[#CA8A04] shrink-0 font-bold text-xs">
                      {review.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-[#1C1917] truncate">{review.customerName}</h4>
                      <span className="text-[10px] text-[#8A8177] block">{review.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 bg-[#FAF9F6] px-2.5 py-1 rounded-full border border-[#EFECE6]">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        size={12}
                        className={idx < review.rating ? 'text-[#CA8A04] fill-[#CA8A04]' : 'text-[#D6D3D1]'}
                      />
                    ))}
                  </div>
                </div>

                {/* Product Badge */}
                {review.productName && (
                  <div className="flex items-center justify-between gap-3 bg-[#FAF9F6] p-2.5 rounded-xl border border-[#EFECE6]/80 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {review.productImage ? (
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white shrink-0 border border-[#EFECE6]">
                          <Image src={review.productImage} alt={review.productName} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-stone-200 shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-[#1C1917] truncate">{review.productName}</span>
                    </div>
                    {review.productSlug && (
                      <Link
                        href={`/products/${review.productSlug}`}
                        target="_blank"
                        className="text-[#CA8A04] hover:text-[#1C1917] p-1.5 rounded-lg hover:bg-white transition-colors shrink-0"
                        title="View product on storefront"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    )}
                  </div>
                )}

                {/* Comment */}
                <p className="text-xs text-[#44403C] leading-relaxed italic mb-4">
                  &ldquo;{review.comment || 'No written feedback provided.'}&rdquo;
                </p>
              </div>

              {/* Footer: Delete Action */}
              <div className="flex items-center justify-end pt-3 border-t border-[#EFECE6]/60">
                <button
                  type="button"
                  onClick={() => handleDeleteReview(review.id)}
                  disabled={deletingReviewId === review.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deletingReviewId === review.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  <span>{deletingReviewId === review.id ? 'Deleting...' : 'Delete Review'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
