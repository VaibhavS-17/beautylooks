'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Heart } from 'lucide-react';
import { useWishlistStore, useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/data';

interface WishlistClientProps {
  products: any[];
}

export default function WishlistClient({ products }: WishlistClientProps) {
  const wishlistItems = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const fallbackProductImage = '/images/products/facial-kit-1.png';

  // Filter products in wishlist
  const wishlistedProducts = products.filter((p) => wishlistItems.includes(p.id));

  return (
    <div className="w-full min-h-screen bg-primary py-12 text-left">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="border-b border-border pb-6 mb-12">
          <h1 className="text-4xl font-display text-text-main">
            Wishlist
          </h1>
          <p className="text-xs text-text-muted mt-2 tracking-widest uppercase font-semibold">
            Your saved favorites
          </p>
        </div>

        {wishlistedProducts.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto space-y-6">
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-secondary/50 border border-border/40 shadow-inner">
              <Heart size={38} strokeWidth={1.2} className="text-accent fill-accent/5" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent/20 animate-ping" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-accent/15" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-3xl text-text-main font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>
                Your wishlist is empty
              </h2>
              <p className="text-sm text-text-muted max-w-xs font-light leading-relaxed">
                Save products here to review them later or quickly add them to your bag. Discover our catalog to find items you love.
              </p>
            </div>
            <Link
              href="/products"
              className="mt-4 px-8 py-3.5 bg-brand-dark text-primary hover:bg-accent hover:text-brand-dark text-xs uppercase tracking-widest font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
            >
              Discover Products
            </Link>
          </div>
        ) : (
          /* Grid of Wishlist Items */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {wishlistedProducts.map((product) => {
              const currentPrice = product.salePrice || product.price;

              return (
                <div key={product.id} className="group flex flex-col h-full relative product-card transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl p-3 border border-border/50 bg-white">
                  <div className="relative h-[300px] w-full bg-primary/20 rounded-xl overflow-hidden mb-4">
                    <Image
                      src={product.images?.[0] || fallbackProductImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <button
                      onClick={() => removeItem(product.id)}
                      className="absolute top-4 right-4 p-2 bg-primary rounded-full text-text-main hover:bg-secondary transition-colors z-10 shadow-sm"
                    >
                      <X size={16} strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest block mb-1">
                        {product.brand}
                      </span>
                      <h4 className="font-display text-base text-text-main mb-2 hover:opacity-60 transition-opacity">
                        <Link href={`/products/${product.slug}`}>{product.name}</Link>
                      </h4>
                    </div>

                    <div className="mt-4">
                      <span className="text-sm font-medium text-text-main block mb-4">
                        {formatPrice(currentPrice)}
                      </span>

                      <button
                        onClick={() => {
                          addItem(product, 1);
                          removeItem(product.id);
                          openCart();
                        }}
                        disabled={product.stockQuantity === 0}
                        className={`w-full mt-4 px-4 py-3 text-xs font-semibold uppercase tracking-widest transition-all rounded-xl ${
                          product.stockQuantity > 0
                            ? 'bg-brand-dark text-primary hover:bg-accent hover:text-brand-dark'
                            : 'bg-border text-text-muted cursor-not-allowed'
                        }`}
                      >
                        {product.stockQuantity > 0 ? 'Add to Bag' : 'Out of Stock'}
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
