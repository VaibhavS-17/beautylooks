'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Heart, ArrowRight } from 'lucide-react';
import { useWishlistStore, useCartStore } from '@/lib/store';
import { formatPrice, getDiscountPercent } from '@/lib/data';

interface WishlistClientProps {
  products: any[];
}

export default function WishlistClient({ products }: WishlistClientProps) {
  const wishlistItems = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const addItem = useCartStore((state) => state.addItem);
  const fallbackProductImage = '/images/products/facial-kit-1.png';

  // Filter products in wishlist
  const wishlistedProducts = products.filter((p) => wishlistItems.includes(p.id));

  return (
    <div className="w-full min-h-screen bg-primary py-10 sm:py-12 text-left">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="border-b border-border pb-6 mb-10">
          <span className="subtitle block mb-2">Saved Items</span>
          <h1 className="text-3xl sm:text-4xl font-serif text-text-main font-normal">
            Your Wishlist
          </h1>
          <p className="text-xs text-text-muted mt-2 tracking-wide font-light">
            Review your saved salon favorites or move them directly to your shopping bag.
          </p>
        </div>

        {wishlistedProducts.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto space-y-6 bg-white p-8 sm:p-12 rounded-2xl border border-border/60 shadow-xs">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-secondary border border-border text-accent">
              <Heart size={32} strokeWidth={1.5} className="fill-accent/10" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-text-main font-normal">
                Your wishlist is empty
              </h2>
              <p className="text-xs sm:text-sm text-text-muted font-light leading-relaxed max-w-xs">
                Save products here while browsing to keep track of your favorite salon kits and treatments.
              </p>
            </div>
            <Link
              href="/products"
              className="btn-primary inline-flex items-center gap-2"
            >
              <span>Explore Collection</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          /* Grid of Wishlist Items */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {wishlistedProducts.map((product) => {
              const isOnSale = product.salePrice !== null && product.salePrice !== undefined;
              const currentPrice = product.salePrice || product.price;

              return (
                <div
                  key={product.id}
                  className="product-card group flex flex-col h-full bg-white rounded-2xl border border-border/60 overflow-hidden hover:border-accent/40 hover:shadow-md transition-all duration-300 relative"
                >
                  <div className="relative aspect-[3/4] w-full bg-primary overflow-hidden">
                    <Link href={`/products/${product.slug}`} className="block absolute inset-0 z-0">
                      <Image
                        src={product.images?.[0] || fallbackProductImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </Link>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-xs rounded-full text-text-main hover:bg-brand-dark hover:text-white transition-colors z-10 shadow-xs"
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      <X size={15} strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="p-3.5 sm:p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-accent tracking-[0.2em] uppercase block mb-1">
                        {product.brand}
                      </span>
                      <h3 className="font-serif text-sm sm:text-base text-text-main group-hover:text-accent transition-colors mb-2 line-clamp-2 leading-snug">
                        <Link href={`/products/${product.slug}`}>{product.name}</Link>
                      </h3>
                    </div>

                    <div className="mt-4 border-t border-border/50 pt-3">
                      {product.stockQuantity > 0 && product.stockQuantity <= 3 && (
                        <span className="text-[11px] text-amber-800 font-medium mb-1.5 block">
                          Only {product.stockQuantity} remaining
                        </span>
                      )}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className="text-sm font-semibold text-text-main">
                          {formatPrice(currentPrice)}
                        </span>
                        {isOnSale && (
                          <span className="text-xs text-text-muted line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          addItem(product, 1);
                          removeItem(product.id);
                        }}
                        disabled={product.stockQuantity === 0}
                        className={`w-full py-3 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all duration-200 ${
                          product.stockQuantity > 0
                            ? 'btn-primary'
                            : 'btn-secondary text-text-muted cursor-not-allowed'
                        }`}
                      >
                        {product.stockQuantity > 0 ? 'Move to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
