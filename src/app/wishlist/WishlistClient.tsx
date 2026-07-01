'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
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
          <div className="flex flex-col items-center justify-center py-24 text-center max-w-xl mx-auto space-y-8">
            <h2 className="font-display text-3xl text-text-main">Your wishlist is empty</h2>
            <p className="text-sm text-text-muted max-w-sm font-light">
              Save products here to review them later or quickly add them to your bag.
            </p>
            <Link href="/products" className="btn-primary">
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
                      src={product.images[0]}
                      alt={product.name}
                      fill
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
                        className="w-full mt-4 bg-brand-dark text-primary px-4 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-accent hover:text-brand-dark transition-all rounded-xl"
                      >
                        Add to Bag
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
