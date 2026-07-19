const fs = require('fs');
const path = 'c:/beautylooks/src/app/products/[slug]/ProductDetailClient.tsx';

const newContent = `'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import NotifyMeModal from '@/components/layout/NotifyMeModal';
import { formatPrice, getDiscountPercent } from '@/lib/data';
import { Product, Review } from '@/lib/types';
import { StarRating } from '@/components/product/StarRating';
import { ProductReviews } from '@/components/product/ProductReviews';
import { ProductGallery } from '@/components/product/ProductGallery';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { ProductPurchasePanel } from '@/components/product/ProductPurchasePanel';
import { ProductDetailsAccordion } from '@/components/product/ProductDetailsAccordion';
import { useWishlistStore } from '@/lib/store';

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
  const [isSubscription, setIsSubscription] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const fallbackProductImage = '/images/products/facial-kit-1.png';

  const wishlistItems = useWishlistStore((state) => state.items);
  const isWishlisted = product ? wishlistItems.includes(product.id) : false;

  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [product?.slug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: \`Check out \${product.name} at Beauty Looks Mumbai!\`,
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
          <Link href={\`/products?category=\${product.categoryId}\`} className="hover:text-text-main transition-colors">{product.category}</Link>
          <ChevronRight size={12} className="mx-2" />
          <span className="text-text-main">{product.name}</span>
        </nav>
        {/* Mobile Back Link */}
        <nav className="flex sm:hidden items-center text-[10px] font-semibold tracking-widest uppercase text-text-muted">
          <Link href={product.categoryId ? \`/products?category=\${product.categoryId}\` : '/products'} className="flex items-center hover:text-text-main transition-colors gap-1">
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

            {/* Star Rating Summary */}
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
              <div className={\`border rounded-full px-4 py-2 text-[10px] uppercase tracking-widest font-semibold \${
                product.stockQuantity > 0 ? 'border-text-main text-text-main' : 'border-border text-text-muted'
              }\`}>
                {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>

            <ProductPurchasePanel
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              isSubscription={isSubscription}
              setIsSubscription={setIsSubscription}
              handleShare={handleShare}
              isShared={isShared}
              setNotifyModalOpen={setNotifyModalOpen}
            />
          </div>
        </div>

        <ProductDetailsAccordion product={product} />

        <div id="reviews">
          <ProductReviews
            productId={product.id}
            reviews={reviews}
            averageRating={averageRating}
            reviewCount={reviewCount}
            canReview={canReview}
            hasReviewed={hasReviewed}
            currentUserId={currentUserId}
          />
        </div>

        <RelatedProducts products={relatedProducts} categoryId={product.categoryId} fallbackImage={fallbackProductImage} />
      </div>

      <NotifyMeModal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        productId={product.id}
        productName={product.name}
      />
    </div>
  );
}
`;

fs.writeFileSync(path, newContent);
console.log('ProductDetailClient successfully rewritten.');
