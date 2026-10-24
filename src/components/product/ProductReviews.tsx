'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ThumbsUp } from 'lucide-react';
import { createReview, incrementHelpfulCount, checkReviewEligibility } from '@/app/actions/reviewActions';

import { Review } from '@/lib/types';
interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  canReview?: boolean;
  hasReviewed?: boolean;
  currentUserId?: string | null;
}

export function ProductReviews({
  productId,
  reviews,
  averageRating,
  reviewCount,
  canReview = false,
  hasReviewed = false,
  currentUserId = null
}: ProductReviewsProps) {
  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  
  // Asynchronous eligibility check for logged-in users without blocking SSR/ISR
  const [eligibility, setEligibility] = useState({
    canReview,
    hasReviewed,
    currentUserId,
  });

  useEffect(() => {
    if (!currentUserId) {
      checkReviewEligibility(productId).then((res) => {
        if (res && res.currentUserId) {
          setEligibility(res);
        }
      });
    }
  }, [productId, currentUserId]);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');
  
  // Helpful votes tracking
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    reviews.forEach(r => { counts[r.id] = r.helpfulCount || 0; });
    return counts;
  });

  // "View More" reviews pagination
  const INITIAL_REVIEW_LIMIT = 4;
  const [visibleReviewCount, setVisibleReviewCount] = useState(INITIAL_REVIEW_LIMIT);

  // Initialize localStorage-backed helpful vote state
  useEffect(() => {
    const voted: Record<string, boolean> = {};
    reviews.forEach(r => {
      if (typeof window !== 'undefined' && localStorage.getItem(`helpful_voted_${r.id}`)) {
        voted[r.id] = true;
      }
    });
    queueMicrotask(() => {
      setHelpfulVotes(voted);
    });
  }, [reviews]);

  // Handle helpful vote click
  const handleHelpfulClick = async (reviewId: string) => {
    if (helpfulVotes[reviewId]) return; // Already voted
    setHelpfulVotes(prev => ({ ...prev, [reviewId]: true }));
    setHelpfulCounts(prev => ({ ...prev, [reviewId]: (prev[reviewId] || 0) + 1 }));
    if (typeof window !== 'undefined') {
      localStorage.setItem(`helpful_voted_${reviewId}`, 'true');
    }
    await incrementHelpfulCount(reviewId);
  };

  // Submit review handler
  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (reviewRating === 0) {
      setReviewError('Please select a star rating.');
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 3) {
      setReviewError('Please write a review comment (minimum 3 characters).');
      return;
    }
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const result = await createReview({
        productId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      if (result.error) {
        setReviewError(result.error);
      } else {
        setReviewSuccess(true);
      }
    } catch {
      setReviewError('An unexpected error occurred.');
    } finally {
      setReviewSubmitting(false);
    }
  }

  return (
    <div id="reviews" className="pt-12 border-t border-border" ref={reviewsSectionRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="font-display text-2xl text-text-main">Customer Reviews ({reviewCount})</h2>
          <p className="text-sm text-text-muted mt-1">Verified feedback from our community</p>
        </div>
      </div>

      <div className="space-y-12">
        {/* Rating Distribution Summary */}
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 items-start bg-[#FAFAF9] p-8 border border-border">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <span className="font-display text-5xl text-text-main leading-none">
              {reviewCount > 0 ? averageRating.toFixed(1) : '—'}
            </span>
            <div className="flex text-accent text-sm">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.round(averageRating) ? 'text-accent' : 'text-border'}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-text-muted">
              Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          <div className="flex-1 w-full space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-12 text-text-muted text-right font-medium">{star} stars</span>
                  <div className="flex-1 h-2 bg-border overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-text-muted">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review Form (Authenticated Users) */}
        {eligibility.canReview && eligibility.currentUserId && !eligibility.hasReviewed && (
          <div className="bg-[#FAFAF9] p-6 sm:p-8 border border-border">
            <h3 className="font-display text-lg text-text-main mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">
                  Your Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`text-xl transition-colors ${
                        star <= reviewRating ? 'text-accent' : 'text-border hover:text-accent'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">
                  Your Review
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  placeholder="Share your experience with this product..."
                  className="w-full px-4 py-2.5 text-sm bg-white border border-border focus:border-text-main focus:outline-none"
                />
              </div>

              {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}
              {reviewSuccess && <p className="text-xs text-green-700">Review submitted successfully!</p>}

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-6 py-3 bg-text-main text-white text-xs font-semibold uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {reviewSubmitting && <Loader2 size={14} className="animate-spin" />}
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {eligibility.hasReviewed && (
          <div className="p-4 bg-[#FAFAF9] border border-border text-center text-sm text-text-muted">
            You have already reviewed this product. Thank you for your feedback!
          </div>
        )}

        {eligibility.currentUserId && !eligibility.canReview && !eligibility.hasReviewed && (
          <div className="p-4 bg-[#FAFAF9] border border-border text-center text-sm text-text-muted rounded-xl">
            Only verified customers whose order for this product has been <span className="font-semibold text-text-main">delivered</span> can write a review.
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="p-12 text-center bg-[#FAFAF9] border border-border">
            <p className="text-sm text-text-muted">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top 3 Featured Reviews Slider */}
            {reviews.length >= 3 && (() => {
              const topReviews = [...reviews]
                .sort((a, b) => {
                  const aHelpful = helpfulCounts[a.id] || 0;
                  const bHelpful = helpfulCounts[b.id] || 0;
                  if (b.rating !== a.rating) return b.rating - a.rating;
                  return bHelpful - aHelpful;
                })
                .slice(0, 3);

              return (
                <div className="bg-[#FAF8F5] border border-border/70 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.2em]">Featured Reviews</span>
                    <span className="text-xs text-text-muted">Top Rated by Customers</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {topReviews.map((rev) => (
                      <div key={rev.id} className="bg-white p-4 rounded-xl border border-border/50 shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="flex text-accent text-xs mb-2">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < rev.rating ? 'text-accent' : 'text-border'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-text-main font-medium line-clamp-3 mb-2">&ldquo;{rev.comment}&rdquo;</p>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-text-muted pt-2 border-t border-border/40">
                          <span className="font-semibold text-text-main">{rev.userName}</span>
                          <span>{new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="divide-y divide-border">
              {reviews.slice(0, visibleReviewCount).map((rev) => (
                <div key={rev.id} className="py-6 first:pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-xs font-semibold text-text-main uppercase">
                        {rev.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-text-main">{rev.userName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-medium">
                            Verified Buyer
                          </span>
                        </div>
                        <span className="text-xs text-text-muted">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex text-accent text-xs">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < rev.rating ? 'text-accent' : 'text-border'}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-text-muted font-light leading-relaxed">{rev.comment}</p>

                  <div className="flex items-center pt-2">
                    <button
                      onClick={() => handleHelpfulClick(rev.id)}
                      disabled={helpfulVotes[rev.id]}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                        helpfulVotes[rev.id]
                          ? 'bg-accent/10 border-accent/30 text-accent cursor-default'
                          : 'bg-white border-border text-text-muted hover:border-accent hover:text-accent'
                      }`}
                    >
                      <ThumbsUp size={12} className={helpfulVotes[rev.id] ? 'fill-accent' : ''} />
                      <span>Helpful{(helpfulCounts[rev.id] || 0) > 0 ? ` (${helpfulCounts[rev.id]})` : ''}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* View More Button */}
            {reviews.length > visibleReviewCount && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setVisibleReviewCount(prev => prev + 8)}
                  className="px-8 py-3 border border-border text-sm font-semibold uppercase tracking-widest text-text-main hover:border-accent hover:text-accent transition-all"
                >
                  View More Reviews (+{reviews.length - visibleReviewCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
