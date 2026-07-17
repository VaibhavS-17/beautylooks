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
import { Product, Review } from '@/lib/types';
import { StarRating, StarInput } from '@/components/product/StarRating';
import { ProductReviews } from '@/components/product/ProductReviews';
import { ProductGallery } from '@/components/product/ProductGallery';
import { RelatedProducts } from '@/components/product/RelatedProducts';

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  canReview: boolean;
  hasReviewed: boolean;
  currentUserId: string | null;
  commonFaqs?: Array<{ question: string; answer: string }>;
}

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
  
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isSubscription, setIsSubscription] = useState(false);
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
  
  const [isShared, setIsShared] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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
        <h1 className="font-display text-3xl md:text-4xl text-[#000000] mb-4">Product Not Found</h1>
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

  function scrollToReviews() {
    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          <ProductGallery images={product.images} name={product.name} badge={product.badge} fallbackImage={fallbackProductImage} />

          {/* Right: Product Details */}
          <div className="flex flex-col justify-center">
            <span className="text-xs font-semibold text-text-muted tracking-widest uppercase mb-2">
              {product.brand}
            </span>
            <h1 className="font-display text-3xl md:text-4xl text-text-main leading-tight mb-3">
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
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
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
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="border border-border rounded-full px-4 py-2 text-[10px] uppercase tracking-widest font-semibold text-text-main">
                Skin Type: {product.skinType}
              </div>
              <div className={`border rounded-full px-4 py-2 text-[10px] uppercase tracking-widest font-semibold ${
                product.stockQuantity > 0 ? 'border-text-main text-text-main' : 'border-border text-text-muted'
              }`}>
                {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>

            {/* Subscribe & Save Mockup */}
            <div className="mb-8 border border-border/60 rounded-xl overflow-hidden bg-[#FCFBF9]">
              <label className={`flex items-start p-4 cursor-pointer transition-colors ${!isSubscription ? 'bg-[#F4F1EB] border-b border-border/60' : ''}`}>
                <div className="flex-shrink-0 mt-0.5">
                  <input type="radio" name="purchaseType" checked={!isSubscription} onChange={() => setIsSubscription(false)} className="w-4 h-4 text-accent border-border/60 focus:ring-accent" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-text-main">One-time purchase</span>
                    <span className="text-sm font-semibold text-text-main">
                      {formatPrice(product.salePrice ?? product.price)}
                    </span>
                  </div>
                </div>
              </label>
              
              <label className={`flex items-start p-4 cursor-pointer transition-colors ${isSubscription ? 'bg-[#F4F1EB]' : ''}`}>
                <div className="flex-shrink-0 mt-0.5">
                  <input type="radio" name="purchaseType" checked={isSubscription} onChange={() => setIsSubscription(true)} className="w-4 h-4 text-accent border-border/60 focus:ring-accent" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-text-main">Subscribe & Save 15%</span>
                    <span className="text-sm font-semibold text-text-main">
                      {formatPrice((product.salePrice ?? product.price) * 0.85)}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">Deliver every 1, 2, or 3 months. Cancel anytime.</p>
                </div>
              </label>
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
                <div className="flex flex-col sm:flex-row gap-3 w-full mt-4 sm:mt-0">
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
          <ProductReviews
            productId={product.id}
            reviews={reviews}
            averageRating={averageRating}
            reviewCount={reviewCount}
            canReview={canReview}
            hasReviewed={hasReviewed}
            currentUserId={currentUserId}
          />

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
          <ProductReviews
            productId={product.id}
            reviews={reviews}
            averageRating={averageRating}
            reviewCount={reviewCount}
            canReview={canReview}
            hasReviewed={hasReviewed}
            currentUserId={currentUserId}
          />

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

        <RelatedProducts products={relatedProducts} categoryId={product.categoryId} fallbackImage={fallbackProductImage} />
      </div>

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
