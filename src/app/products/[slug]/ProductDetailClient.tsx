'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Minus, Plus, ChevronLeft, ChevronRight, Truck, Shield, RotateCcw, ArrowRight, X, Star, Loader2, Share2, Check, CheckCircle2, Leaf, Ban, Rabbit, Sparkles, Bell, ChevronDown, ThumbsUp } from 'lucide-react';
import NotifyMeModal from '@/components/layout/NotifyMeModal';
import { formatPrice, getDiscountPercent } from '@/lib/data';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { createReview, incrementHelpfulCount } from '@/app/actions/reviewActions';

// ── Types ──

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  avatarUrl: string | null;
  helpfulCount: number;
}

interface ProductDetailProps {
  product: any;
  relatedProducts: any[];
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  canReview: boolean;
  hasReviewed: boolean;
  currentUserId: string | null;
  commonFaqs?: Array<{ question: string; answer: string }>;
}

// ── Star Rating Display ──

function StarRating({ rating, size = 16, className = '' }: { rating: number; size?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? 'fill-[#CA8A04] text-[#CA8A04]'
              : 'fill-none text-[#CA8A04]/30'
          }
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

// ── Interactive Star Input ──

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 focus:outline-none"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            size={28}
            className={
              star <= (hover || value)
                ? 'fill-[#CA8A04] text-[#CA8A04] transition-colors'
                : 'fill-none text-[#CA8A04]/30 transition-colors'
            }
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

// ── Avatar ──

function UserAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={40}
        height={40}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-semibold text-[#CA8A04] shrink-0">
      {initials}
    </div>
  );
}

// ── Format date ──

function formatReviewDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Main Component ──

export default function ProductDetailClient({
  product,
  relatedProducts,
  reviews,
  averageRating,
  reviewCount,
  canReview,
  hasReviewed,
  currentUserId,
  commonFaqs,
}: ProductDetailProps) {
  
  const router = useRouter();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const fallbackProductImage = '/images/products/facial-kit-1.png';
  
  // Simulated Scarcity/Urgency logic
  const [peopleInCart, setPeopleInCart] = useState(0);
  const [countdownStr, setCountdownStr] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  // Isomorphic layout effect for zero-flash scroll-to-top
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [product.slug]);

  useEffect(() => {
    // Generate a static "random" number based on the product ID so it doesn't flicker on re-renders
    const hash = product.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    setPeopleInCart((hash % 10) + 3); // 3 to 12 people
    
    // Simulate countdown: "Order within 2 hrs 45 mins"
    const updateCountdown = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(18, 0, 0, 0); // 6 PM cutoff
      if (now > cutoff) {
        cutoff.setDate(cutoff.getDate() + 1);
      }
      const diff = cutoff.getTime() - now.getTime();
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdownStr(`${hrs} hrs ${mins} mins`);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    
    // Delivery date calculation (approx 3 days)
    const del = new Date();
    del.setDate(del.getDate() + 3);
    setDeliveryDate(del.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    
    return () => clearInterval(interval);
  }, [product.id]);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling down 400px
      if (window.scrollY > 400) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');
  
  const [isShared, setIsShared] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Helpful votes tracking
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    reviews.forEach(r => { counts[r.id] = r.helpfulCount; });
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
    setHelpfulVotes(voted);
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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} at Beauty Looks Mumbai!`,
          url: url,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    }
  };

  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const setBuyNowItem = useCartStore((state) => state.setBuyNowItem);
  const openCart = useCartStore((state) => state.openCart);

  const existingCartItem = cartItems.find((item) => item.product.id === product.id);
  const existingCartQty = existingCartItem ? existingCartItem.quantity : 0;
  
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <h1 className="font-display text-4xl text-[#000000] mb-4">Product Not Found</h1>
        <p className="text-sm text-[#767676] mb-8">The item you are looking for might have been removed or is temporarily unavailable.</p>
        <Link href="/products" className="btn-primary">
          Return to Collection
        </Link>
      </div>
    );
  }

  const isOnSale = product.salePrice !== null;
  const currentPrice = product.salePrice || product.price;
  const isWishlisted = wishlistItems.includes(product.id);
  const isMaxStockReached = (existingCartQty + quantity) > product.stockQuantity;

  // ── Rating distribution ──
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(...ratingDistribution.map((d) => d.count), 1);

  // ── Submit review handler ──
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
        productId: product.id,
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

  function scrollToReviews() {
    reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="bg-primary">
      {/* Breadcrumbs */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Desktop Breadcrumbs */}
        <nav className="hidden sm:flex items-center text-[10px] font-semibold tracking-widest uppercase text-text-muted">
          <Link href="/" className="hover:text-text-main transition-colors">Home</Link>
          <ChevronRight size={12} className="mx-2" />
          <Link href="/products" className="hover:text-text-main transition-colors">Collection</Link>
          <ChevronRight size={12} className="mx-2" />
          <Link href={`/products?category=${product.categoryId}`} className="hover:text-text-main transition-colors">{product.category}</Link>
          <ChevronRight size={12} className="mx-2" />
          <span className="text-text-main">{product.name}</span>
        </nav>
        {/* Mobile Back Link */}
        <nav className="flex sm:hidden items-center text-[10px] font-semibold tracking-widest uppercase text-text-muted">
          <Link href={product.categoryId ? `/products?category=${product.categoryId}` : '/products'} className="flex items-center hover:text-text-main transition-colors gap-1">
            <ChevronLeft size={12} className="-ml-1 shrink-0" />
            <span>Back to {product.category || 'Collection'}</span>
          </Link>
        </nav>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24">
          
          {/* Left: Product Images */}
          <div className="space-y-4">
            <div
              className="relative aspect-square w-full bg-[#FAFAF9] overflow-hidden group cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                src={product.images?.[selectedImageIndex] || fallbackProductImage}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute top-6 left-6 flex flex-col space-y-2 z-10">
                {product.badge === 'bestseller' && (
                  <span className="badge-dark">BESTSELLER</span>
                )}
                {product.badge === 'sale' && (
                  <span className="badge-dark">SALE</span>
                )}
                {product.badge === 'new' && (
                  <span className="badge-gold">NEW</span>
                )}
              </div>

              {/* Left/Right Navigation Arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev: number) => (prev === 0 ? product.images.length - 1 : prev - 1));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} className="text-text-main" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev: number) => (prev === product.images.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} className="text-text-main" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {product.images.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative aspect-square w-full bg-[#FAFAF9] overflow-hidden cursor-pointer hover:opacity-80 transition-all duration-200 ${idx === selectedImageIndex ? 'border-b-2 border-text-main' : 'border-b-2 border-transparent'}`}
                  >
                    <Image src={img} alt={`${product.name} view ${idx + 1}`} fill sizes="(max-width: 640px) 25vw, 120px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col justify-center">
            <span className="text-xs font-semibold text-text-muted tracking-widest uppercase mb-2">
              {product.brand}
            </span>
            <h1 className="font-display text-4xl text-text-main leading-tight mb-3">
              {product.name}
            </h1>

            {/* ── Star Rating Summary ── */}
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={averageRating} size={16} />
              {reviewCount > 0 ? (
                <button
                  onClick={scrollToReviews}
                  className="text-sm text-text-muted hover:text-accent transition-colors"
                >
                  {averageRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'})
                </button>
              ) : (
                <span className="text-sm text-text-muted">No Reviews Yet</span>
              )}
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-baseline space-x-3">
                <span className="text-xl font-medium text-text-main">
                  {formatPrice(currentPrice)}
                </span>
                {isOnSale && (
                  <span className="text-sm text-text-muted line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              {isOnSale && (
                <span className="bg-text-main text-primary text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded">
                  {getDiscountPercent(product.price, product.salePrice!)}% OFF
                </span>
              )}
            </div>
            
            <div className="w-12 h-px bg-accent mb-6" />

            <p className="text-sm text-text-muted font-light leading-relaxed mb-6">
              {product.shortDescription}
            </p>



            {/* Badges/Info */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="border border-border rounded-full px-4 py-2 text-[10px] uppercase tracking-widest font-semibold text-text-main">
                Skin Type: {product.skinType}
              </div>
              <div className={`border rounded-full px-4 py-2 text-[10px] uppercase tracking-widest font-semibold ${
                product.stockQuantity > 0 ? 'border-text-main text-text-main' : 'border-border text-text-muted'
              }`}>
                {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>

            {/* Urgency & Scarcity Elements */}
            <div className="flex flex-col gap-2 mb-8 bg-[#FDFBF7] p-4 border border-[#E8E2D9]/60 rounded-xl">
              <div className="flex items-center text-sm font-semibold text-[#DC2626]">
                <span className="mr-2 animate-pulse">🔥</span> 
                High demand: Currently in {peopleInCart} people's carts
              </div>
              <div className="text-sm text-text-muted font-medium">
                Want it by <strong className="text-text-main">{deliveryDate}</strong>? Order within <span className="text-[#CA8A04] font-bold">{countdownStr}</span>
              </div>
            </div>

            {/* Actions */}
            {product.stockQuantity > 0 ? (
              <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center border-t border-border/50">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <div className="flex gap-4 items-center w-full">
                    <div className="flex-1 sm:w-36 flex items-center bg-white h-14 overflow-hidden border border-border shrink-0">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 sm:px-5 h-full flex items-center justify-center hover:bg-black/5 transition-colors text-text-main"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="flex-1 text-center text-base font-semibold text-text-main">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                        disabled={quantity >= product.stockQuantity}
                        className={`w-12 sm:px-5 h-full flex items-center justify-center transition-colors ${
                          quantity >= product.stockQuantity 
                            ? 'text-border cursor-not-allowed' 
                            : 'hover:bg-black/5 text-text-main'
                        }`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={handleShare}
                      className="sm:hidden h-14 w-14 shrink-0 flex items-center justify-center border border-border bg-white hover:bg-black/5 transition-colors"
                      aria-label="Share product"
                    >
                      {isShared ? <Check size={22} className="text-green-600" strokeWidth={1.5} /> : <Share2 size={22} className="text-text-main" strokeWidth={1.5} />}
                    </button>
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className="sm:hidden h-14 w-14 shrink-0 rounded-xl flex items-center justify-center border border-border/50 bg-white/80 backdrop-blur shadow-sm hover:bg-black/5 transition-colors"
                    >
                      <Heart size={22} className={isWishlisted ? 'fill-accent text-accent' : 'text-text-main'} strokeWidth={1.5} />
                    </button>
                  </div>
                  {product.stockQuantity === 1 && (
                    <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest px-1">
                      Only 1 left in stock
                    </span>
                  )}
                </div>

                {/* Unified: Add to Cart + Buy Now for all viewports */}
                <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                  <button 
                    onClick={() => {
                      addItem(product, quantity);
                    }}
                    disabled={isMaxStockReached}
                    className={`w-full sm:w-1/2 h-14 shrink-0 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center border-2 ${
                      isMaxStockReached
                        ? 'border-[#EFECE6] bg-[#FBF9F6] text-[#8C8885] cursor-not-allowed opacity-75'
                        : 'border-text-main bg-transparent text-text-main hover:bg-text-main hover:text-white'
                    }`}
                  >
                    {isMaxStockReached ? 'Max Stock Reached' : 'Add to Cart'}
                  </button>
                  <button 
                    onClick={() => {
                      setBuyNowItem({ product, quantity });
                      router.push('/checkout?mode=buynow');
                    }}
                    className="w-full sm:w-1/2 h-14 shrink-0 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center bg-accent text-white hover:bg-black hover:text-white shadow-gold hover:-translate-y-1"
                  >
                    Buy Now
                  </button>
                </div>

                <div className="hidden sm:flex gap-4">
                  <button 
                    onClick={handleShare}
                    className="h-14 w-14 shrink-0 rounded-xl items-center justify-center border border-border/50 bg-white/80 backdrop-blur shadow-sm hover:bg-black/5 transition-colors flex"
                    aria-label="Share product"
                  >
                    {isShared ? <Check size={22} className="text-green-600" strokeWidth={1.5} /> : <Share2 size={22} className="text-text-main" strokeWidth={1.5} />}
                  </button>
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className="h-14 w-14 shrink-0 rounded-xl items-center justify-center border border-border/50 bg-white/80 backdrop-blur shadow-sm hover:bg-black/5 transition-colors flex"
                  >
                    <Heart size={22} className={isWishlisted ? 'fill-accent text-accent' : 'text-text-main'} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ) : (
              /* Out of Stock — Notify Me CTA */
              <div className="pt-6 sm:pt-8 border-t border-border/50">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <button
                    onClick={() => setNotifyModalOpen(true)}
                    className="w-full sm:w-auto h-14 px-10 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 bg-accent text-white hover:bg-black hover:text-white shadow-gold hover:-translate-y-1"
                  >
                    <Bell size={18} />
                    Notify Me When Available
                  </button>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleShare}
                      className="h-14 w-14 shrink-0 rounded-xl items-center justify-center border border-border/50 bg-white/80 backdrop-blur shadow-sm hover:bg-black/5 transition-colors flex"
                      aria-label="Share product"
                    >
                      {isShared ? <Check size={22} className="text-green-600" strokeWidth={1.5} /> : <Share2 size={22} className="text-text-main" strokeWidth={1.5} />}
                    </button>
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className="h-14 w-14 shrink-0 rounded-xl items-center justify-center border border-border/50 bg-white/80 backdrop-blur shadow-sm hover:bg-black/5 transition-colors flex"
                    >
                      <Heart size={22} className={isWishlisted ? 'fill-accent text-accent' : 'text-text-main'} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Frequently Bought Together Mock */}
            {relatedProducts && relatedProducts.length > 0 && (
              <div className="mt-10 p-5 bg-[#FAFAF9] border border-[#E8E2D9] rounded-2xl">
                <h4 className="font-display text-lg text-text-main mb-4 font-semibold">Frequently Bought Together</h4>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="h-20 w-20 relative rounded-lg overflow-hidden border border-border bg-white shrink-0">
                      <Image src={product.images?.[0] || fallbackProductImage} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="text-text-muted text-xl">+</div>
                    <div className="h-20 w-20 relative rounded-lg overflow-hidden border border-border bg-white shrink-0">
                      <Image src={relatedProducts[0].images?.[0] || fallbackProductImage} alt={relatedProducts[0].name} fill className="object-cover" />
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
                    <p className="text-sm font-semibold text-text-main mb-1">Buy the Bundle & Save</p>
                    <p className="text-xs text-text-muted mb-3">Add <strong>{relatedProducts[0].name}</strong> to your order.</p>
                    <button 
                      onClick={() => {
                        addItem(product, quantity);
                        addItem(relatedProducts[0], 1);
                        openCart();
                      }}
                      className="px-6 py-2 bg-text-main text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-accent transition-colors w-full sm:w-auto"
                    >
                      Add Both to Cart
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Vertical Stacked Sections ── */}
        <div className="mt-20 space-y-20">
          
          {/* Section 1: Product Overview & Formulation */}
          <div className="pt-12 border-t border-border">
            <h2 className="font-display text-2xl text-text-main mb-8">Formulation &amp; Efficacy</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-7 space-y-6">
                <p className="text-base text-text-muted font-light leading-relaxed">
                  {product.description}
                </p>
                <p className="text-sm text-text-muted font-light leading-relaxed">
                  Crafted using clinical-grade botanicals and dermatologically verified actives, this formula penetrates deeply to nourish and restore balance. Formulated to integrate effortlessly into both morning and evening skincare rituals.
                </p>
                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-accent shrink-0" />
                    <span className="text-sm text-text-main">Dermatologically tested and non-comedogenic</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-accent shrink-0" />
                    <span className="text-sm text-text-main">Free from artificial dyes, sulfates, and harsh fillers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-accent shrink-0" />
                    <span className="text-sm text-text-main">Eco-conscious glass vessel preserves active stability</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 space-y-8 bg-[#FAFAF9] p-8 border border-border">
                <div>
                  <h3 className="text-[10px] font-bold text-text-muted mb-4 uppercase tracking-widest">Premium Actives</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 border border-border text-[10px] font-semibold text-text-main tracking-widest uppercase bg-white">Hyaluronic Acid</span>
                    <span className="px-3 py-1.5 border border-border text-[10px] font-semibold text-text-main tracking-widest uppercase bg-white">Vitamin C</span>
                    <span className="px-3 py-1.5 border border-border text-[10px] font-semibold text-text-main tracking-widest uppercase bg-white">24K Gold Extracts</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-text-muted mb-4 uppercase tracking-widest">Our Promise</h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <div className="flex items-center gap-2">
                      <Leaf size={14} className="text-text-muted" strokeWidth={1.5} />
                      <span className="text-[10px] font-semibold tracking-widest uppercase text-text-main">100% Vegan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ban size={14} className="text-text-muted" strokeWidth={1.5} />
                      <span className="text-[10px] font-semibold tracking-widest uppercase text-text-main">Paraben-Free</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Rabbit size={14} className="text-text-muted" strokeWidth={1.5} />
                      <span className="text-[10px] font-semibold tracking-widest uppercase text-text-main">Cruelty-Free</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-text-muted" strokeWidth={1.5} />
                      <span className="text-[10px] font-semibold tracking-widest uppercase text-text-main">Authentic</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Complete Ingredients */}
          <div className="pt-12 border-t border-border">
            <h2 className="font-display text-2xl text-text-main mb-6">Complete Ingredients</h2>
            <div className="max-w-3xl text-sm text-text-muted font-light leading-relaxed space-y-3">
              <p>
                {product.ingredients || 'Aqua/Water/Eau, Glycerin, Niacinamide, Squalane, Butylene Glycol, Caprylic/Capric Triglyceride, Sodium Hyaluronate, Tocopherol, Allantoin, Panthenol, Phenoxyethanol, Ethylhexylglycerin.'}
              </p>
              <p className="italic text-xs text-text-muted">
                Please refer to the physical product packaging for the most accurate and up-to-date list of ingredients.
              </p>
            </div>
          </div>

          {/* Section 3: Shipping & Returns Summary */}
          <div className="pt-12 border-t border-border">
            <h2 className="font-display text-2xl text-text-main mb-6">Shipping &amp; Returns</h2>
            <div className="max-w-3xl text-sm text-text-muted font-light leading-relaxed space-y-4">
              <p>
                <strong>Standard Delivery:</strong> 2-4 business days across India. Complimentary shipping on orders above ₹499.
              </p>
              <p>
                <strong>Express Delivery:</strong> Same-day or next-day delivery available for select Mumbai and NCR pin codes.
              </p>
              <p>
                <strong>Returns Policy:</strong> We accept returns of unopened and unused items within 7 days of delivery. For hygiene and safety reasons, opened skincare products cannot be returned.
              </p>
            </div>
          </div>

          {/* Section 4: Customer Reviews */}
          <div className="pt-12 border-t border-border" ref={reviewsSectionRef}>
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

              {/* B) Review Form (Authenticated Users) */}
              {canReview && currentUserId && !hasReviewed && (
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

              {hasReviewed && (
                <div className="p-4 bg-[#FAFAF9] border border-border text-center text-sm text-text-muted">
                  You have already reviewed this product. Thank you for your feedback!
                </div>
              )}

              {currentUserId && !canReview && !hasReviewed && (
                <div className="p-4 bg-[#FAFAF9] border border-border text-center text-sm text-text-muted rounded-xl">
                  Only verified customers whose order for this product has been <span className="font-semibold text-text-main">delivered</span> can write a review.
                </div>
              )}

              {/* C) Reviews List — Top 3 Slider + Full List + View More */}
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
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Featured Reviews</h3>
                        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar">
                          {topReviews.map((rev) => (
                            <div
                              key={`featured-${rev.id}`}
                              className="min-w-[280px] sm:min-w-[320px] snap-start p-5 bg-gradient-to-br from-[#FDFBF7] to-[#F5F0E8] border border-accent/20 rounded-xl space-y-3 flex-shrink-0"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-accent/10 text-accent rounded-full">
                                    ★ Featured
                                  </span>
                                </div>
                                <div className="flex text-accent text-xs">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < rev.rating ? 'text-accent' : 'text-border'}>★</span>
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-text-muted font-light leading-relaxed line-clamp-3">{rev.comment}</p>
                              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                <span className="text-xs font-medium text-text-main">{rev.userName || 'Verified Buyer'}</span>
                                <span className="text-[10px] text-text-muted">
                                  {new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Full Reviews List with Helpful Button */}
                  <div className="space-y-6">
                    {reviews.slice(0, visibleReviewCount).map((rev) => (
                      <div key={rev.id} className="p-6 bg-white border border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-sm text-text-main">
                              {rev.userName || 'Verified Buyer'}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-[#FAFAF9] border border-border text-text-muted">
                              Verified
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

                        <div className="flex text-accent text-xs">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < rev.rating ? 'text-accent' : 'text-border'}>
                              ★
                            </span>
                          ))}
                        </div>

                        <p className="text-sm text-text-muted font-light leading-relaxed">{rev.comment}</p>

                        {/* Helpful Button */}
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

          {/* Section 5: Frequently Asked Questions (FAQ) Accordion — Dynamic with Fallback */}
          <div className="pt-12 border-t border-border">
            <h2 className="font-display text-2xl text-text-main mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3 max-w-3xl">
              {(() => {
                const DEFAULT_FAQS = [
                  {
                    question: 'Is this product suitable for sensitive skin?',
                    answer: 'Yes, all our formulations are dermatologically tested and crafted with gentle botanical actives. We recommend a quick patch test prior to full application.',
                  },
                  {
                    question: 'What are your shipping timelines and return policy?',
                    answer: 'We dispatch within 24 hours. Express delivery takes 2-4 business days across India. We offer a 7-day hassle-free return policy on unopened items.',
                  },
                  {
                    question: 'Are your products 100% vegan and cruelty-free?',
                    answer: 'Absolutely. Beauty Looks Mumbai is certified cruelty-free and 100% vegan with zero animal testing.',
                  },
                  {
                    question: 'How long until I see visible results?',
                    answer: 'Most users notice improved hydration and radiance immediately. For significant changes in tone and texture, consistent daily use for 2 to 4 weeks is recommended.',
                  },
                ];

                const faqsToRender = product.faqs && Array.isArray(product.faqs) && product.faqs.length > 0
                  ? product.faqs.map((f: { question: string; answer: string }) => ({ question: f.question, answer: f.answer }))
                  : (commonFaqs && Array.isArray(commonFaqs) && commonFaqs.length > 0 ? commonFaqs : DEFAULT_FAQS);

                return faqsToRender.map((faq: { question: string; answer: string }, idx: number) => (
                  <div key={idx} className="border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-5 text-left bg-[#FAFAF9] hover:bg-white transition-colors"
                    >
                      <span className="text-sm font-medium text-text-main">{faq.question}</span>
                      <ChevronDown
                        size={16}
                        className={`text-text-muted transition-transform duration-300 shrink-0 ${
                          openFaqIndex === idx ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`transition-all duration-300 overflow-hidden ${
                        openFaqIndex === idx ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <p className="px-5 pb-5 text-sm text-text-muted font-light leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-border">
            <div className="flex justify-between items-end mb-12">
              <h2 className="font-display text-2xl text-text-main">Complete Your Ritual</h2>
              <Link href={`/products?category=${product.categoryId}`} className="hidden sm:inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-text-main hover:text-accent transition-colors">
                <span>View More</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relProduct) => (
                <Link href={`/products/${relProduct.slug}`} key={relProduct.id} className="group block">
                  <div className="relative h-[300px] sm:h-[350px] w-full bg-[#FAFAF9] mb-4 overflow-hidden product-image-container">
                    <Image
                      src={relProduct.images?.[0] || fallbackProductImage}
                      alt={relProduct.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-text-muted tracking-widest uppercase block mb-1">
                      {relProduct.brand}
                    </span>
                    <h3 className="font-display text-base text-text-main mb-1 group-hover:text-accent transition-colors">
                      {relProduct.name}
                    </h3>
                    {(relProduct as any).reviewCount > 0 && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <StarRating rating={(relProduct as any).rating || 0} size={12} />
                        <span className="text-[11px] text-text-muted">
                          ({(relProduct as any).reviewCount})
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-text-main">
                      {formatPrice(relProduct.salePrice || relProduct.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>


      {/* Lightbox Modal */}
      {lightboxOpen && (
        <Lightbox
          images={product.images && product.images.length > 0 ? product.images : [fallbackProductImage]}
          selectedIndex={selectedImageIndex}
          onClose={() => setLightboxOpen(false)}
          onChangeIndex={setSelectedImageIndex}
          title={product.name}
        />
      )}

      {/* Notify Me Modal */}
      <NotifyMeModal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        productId={product.id}
        productName={product.name}
      />
    </div>
  );
}

function Lightbox({
  images,
  selectedIndex,
  onClose,
  onChangeIndex,
  title
}: {
  images: string[];
  selectedIndex: number;
  onClose: () => void;
  onChangeIndex: (idx: number) => void;
  title: string;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onChangeIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
      if (e.key === 'ArrowRight') onChangeIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onChangeIndex, onClose, selectedIndex]);

  const currentMedia = images[selectedIndex];
  const isVideo = currentMedia?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 text-white">
        <span className="text-xs uppercase tracking-widest font-semibold opacity-75">{title} ({selectedIndex + 1}/{images.length})</span>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close lightbox"
        >
          <X size={20} />
        </button>
      </div>

      {/* Media Display */}
      <div className="relative w-full max-w-4xl h-[75vh] flex items-center justify-center">
        {isVideo ? (
          <video src={currentMedia} controls autoPlay className="max-h-full max-w-full rounded-xl object-contain" />
        ) : (
          <Image
            src={currentMedia}
            alt={title}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => onChangeIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => onChangeIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-6 flex space-x-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onChangeIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${idx === selectedIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
