'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, getDiscountPercent } from '@/lib/data';
import { Sparkles, Droplets, SprayCan, Package, Component } from 'lucide-react';
import { StarRating } from '@/components/product/StarRating';

export const getCategoryIcon = (categoryName: string, size = 16) => {
  const name = categoryName.toLowerCase();
  if (name.includes('facial') || name.includes('kit')) return <Package size={size} className="text-accent" />;
  if (name.includes('serum') || name.includes('oil')) return <Droplets size={size} className="text-accent" />;
  if (name.includes('cleanser') || name.includes('wash')) return <SprayCan size={size} className="text-accent" />;
  if (name.includes('mask') || name.includes('pack')) return <Component size={size} className="text-accent" />;
  if (name.includes('shampoo') || name.includes('conditioner')) return <Droplets size={size} className="text-accent" />;
  return <Sparkles size={size} className="text-accent" />;
};

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  salePrice?: number | null;
  images?: string[];
  badge?: string;
  stockQuantity: number;
  reviewCount: number;
  rating: number;
  [key: string]: any;
}

interface GroupedProduct {
  id: string;
  categoryName: string;
  products: Product[];
}

interface ProductGridProps {
  groupedProducts: GroupedProduct[];
  filteredProductsLength: number;
  fallbackProductImage: string;
  setQuickViewProduct: (product: any) => void;
  addItem: (product: any, quantity: number) => void;
  clearFilters: () => void;
}

export function ProductGrid({
  groupedProducts,
  filteredProductsLength,
  fallbackProductImage,
  setQuickViewProduct,
  addItem,
  clearFilters
}: ProductGridProps) {
  return (
    <main className="lg:w-3/4 space-y-16">
      <div className="hidden lg:flex justify-between items-center mb-4 pb-4 border-b border-border">
        <span className="text-xs uppercase tracking-widest font-semibold text-text-muted">
          Showing {filteredProductsLength} Curated Products
        </span>
      </div>

      {groupedProducts.length === 0 ? (
        <div className="text-center py-20 card-container bg-white">
          <p className="text-lg text-text-main mb-2 font-serif">No products found</p>
          <p className="text-sm text-text-muted font-light">Try adjusting your filters or search query.</p>
          <button onClick={clearFilters} className="mt-6 btn-secondary text-xs">
            Clear Filters
          </button>
        </div>
      ) : (
        groupedProducts.map(group => (
          <section key={group.id} className="space-y-6">
            {/* Category Header */}
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="p-2 bg-secondary rounded-xl text-accent border border-border/60">
                <span className="text-sm leading-none">{getCategoryIcon(group.categoryName)}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-text-main">
                {group.categoryName}
              </h2>
              <span className="text-xs bg-secondary text-text-muted font-semibold px-2.5 py-0.5 rounded-full mt-0.5">
                {group.products.length} {group.products.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Grid of Products inside this Category */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
              {group.products.map((product, index) => {
                const isOnSale = product.salePrice !== null && product.salePrice !== undefined;
                const currentPrice = product.salePrice || product.price;

                return (
                  <div
                    key={product.id}
                    className="product-card group flex flex-col h-full bg-white rounded-2xl border border-border/60 overflow-hidden hover:border-accent/40 hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-primary">
                      <Link href={`/products/${product.slug}`} className="block absolute inset-0 z-0">
                        <Image
                          src={product.images?.[0] || fallbackProductImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                          priority={index < 4}
                        />
                        <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10">
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
                      </Link>
                      <div className="absolute inset-x-0 bottom-3 hidden sm:flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none px-4">
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(product); }}
                          className="w-full bg-white/95 backdrop-blur-xs text-text-main text-[11px] font-semibold uppercase tracking-widest py-2.5 rounded-xl hover:bg-brand-dark hover:text-white transition-colors pointer-events-auto shadow-sm"
                          suppressHydrationWarning
                        >
                          Quick View
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-5 flex flex-col flex-grow">
                      <div className="mb-2">
                        <span className="text-[10px] font-semibold text-accent tracking-[0.2em] uppercase block mb-1">
                          {product.brand}
                        </span>
                        <h3 className="font-serif text-sm sm:text-base text-text-main group-hover:text-accent transition-colors mb-2 line-clamp-2 leading-snug">
                          <Link href={`/products/${product.slug}`}>{product.name}</Link>
                        </h3>
                        {product.reviewCount > 0 ? (
                          <div className="flex items-center gap-1.5 mb-2">
                            <StarRating rating={product.rating} size={12} />
                            <span className="text-[11px] font-semibold text-text-main">{(product.rating || 0).toFixed(1)}</span>
                            <span className="text-[10px] text-text-muted">({product.reviewCount})</span>
                          </div>
                        ) : (
                          <div className="flex items-center mb-2">
                            <span className="text-[10px] text-text-muted">New Arrival</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-auto pt-3 border-t border-border/50">
                        {product.stockQuantity > 0 && product.stockQuantity <= 3 && (
                          <span className="text-[11px] text-amber-800 font-medium mb-1.5 block">
                            Only {product.stockQuantity} remaining in stock
                          </span>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-text-main">
                            {formatPrice(currentPrice)}
                          </span>
                          {isOnSale && (
                            <>
                              <span className="text-xs text-text-muted line-through">
                                {formatPrice(product.price)}
                              </span>
                              <span className="bg-secondary text-accent text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded">
                                {getDiscountPercent(product.price, product.salePrice!)}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addItem(product, 1);
                        }}
                        disabled={product.stockQuantity === 0}
                        className={`w-full mt-4 py-3 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all duration-200 ${
                          product.stockQuantity === 0
                            ? 'btn-secondary text-text-muted cursor-not-allowed'
                            : 'btn-primary'
                        }`}
                        suppressHydrationWarning
                      >
                        {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
