'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, getDiscountPercent } from '@/lib/data';
import { Sparkles, Droplets, SprayCan, Package, Component } from 'lucide-react';

export const getCategoryIcon = (categoryName: string, size = 16) => {
  const name = categoryName.toLowerCase();
  if (name.includes('facial') || name.includes('kit')) return <Package size={size} className="text-[var(--color-accent)]" />;
  if (name.includes('serum') || name.includes('oil')) return <Droplets size={size} className="text-[var(--color-accent)]" />;
  if (name.includes('cleanser') || name.includes('wash')) return <SprayCan size={size} className="text-[var(--color-accent)]" />;
  if (name.includes('mask') || name.includes('pack')) return <Component size={size} className="text-[var(--color-accent)]" />;
  if (name.includes('shampoo') || name.includes('conditioner')) return <Droplets size={size} className="text-[var(--color-accent)]" />;
  return <Sparkles size={size} className="text-[var(--color-accent)]" />;
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
        <span className="text-sm text-text-muted">{filteredProductsLength} Results</span>
      </div>

      {groupedProducts.length === 0 ? (
        <div className="text-center py-20 card-container">
          <p className="text-lg text-text-main mb-2 font-display">No products found.</p>
          <p className="text-sm text-text-muted">Try adjusting your filters or search query.</p>
          <button onClick={clearFilters} className="mt-6 btn-secondary text-xs">
            Clear Filters
          </button>
        </div>
      ) : (
        groupedProducts.map(group => (
          <section key={group.id} className="space-y-6">
            {/* Category Header */}
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="p-2 bg-[#FDF8F5] rounded-xl text-accent border border-border/60">
                <span className="text-sm leading-none">{getCategoryIcon(group.categoryName)}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#2C1E16]" style={{ fontFamily: 'Playfair Display, serif' }}>
                {group.categoryName}
              </h2>
              <span className="text-xs bg-[#2C1E16]/5 text-[#6B5C52] font-semibold px-2 py-0.5 rounded-full mt-1">
                {group.products.length} {group.products.length === 1 ? 'product' : 'products'}
              </span>
            </div>

            {/* Grid of Products inside this Category, sorted by Brand & Name */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-6 sm:gap-x-8 sm:gap-y-12">
              {group.products.map((product, index) => {
                const isOnSale = product.salePrice !== null && product.salePrice !== undefined;
                const currentPrice = product.salePrice || product.price;

                return (
                  <div key={product.id} className="product-card group cursor-pointer flex flex-col h-full transition-all duration-500 bg-transparent rounded-2xl overflow-hidden hover:shadow-gold-hover border border-transparent">
                    <Link href={`/products/${product.slug}`} className="block overflow-hidden">
                      <div className="product-image-container h-[200px] sm:h-[400px] relative overflow-hidden bg-[#FAFAF9]">
                        <Image
                          src={product.images?.[0] || fallbackProductImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover product-image transition-transform duration-700 group-hover:scale-105"
                          priority={index < 4}
                        />
                        <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
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
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(product); }}
                            className="bg-white text-text-main text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-black hover:text-white transition-colors"
                          >
                            Quick View
                          </button>
                        </div>
                      </div>
                    </Link>

                    <div className="p-2.5 sm:p-5 flex flex-col flex-grow bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-full">
                          <span className="text-[10px] font-bold text-accent tracking-widest uppercase block mb-1">
                            {product.brand}
                          </span>
                          <h3 className="font-display text-base text-text-main line-clamp-2 font-semibold mb-1">
                            <Link href={`/products/${product.slug}`} className="hover:text-accent transition-colors">
                              {product.name}
                            </Link>
                          </h3>
                          {product.reviewCount > 0 ? (
                            <div className="flex items-center space-x-1 mb-2">
                              <span className="text-accent text-xs">★</span>
                              <span className="text-[11px] font-semibold text-text-main">{(product.rating || 0).toFixed(1)}</span>
                              <span className="text-[10px] text-text-muted">({product.reviewCount})</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 mb-2">
                              <span className="text-[10px] text-text-muted">No Reviews Yet</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                        <div className="flex flex-col mt-auto pt-4 border-t border-[#E8E2D9]/40">
                        {product.stockQuantity > 0 && product.stockQuantity <= 3 && (
                          <span className="text-xs font-semibold text-[#DC2626] mb-2 block animate-pulse">
                            🔥 {product.stockQuantity === 1 ? 'Only 1 left in stock - order soon!' : `Selling fast! Only ${product.stockQuantity} left.`}
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
                              <span className="bg-[#2C1E16] text-[#FAF9F6] text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded">
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
                        className={`w-full mt-5 px-4 py-3 text-xs font-semibold uppercase tracking-widest transition-all ${
                          product.stockQuantity > 0
                            ? 'bg-accent text-white shadow-md rounded-lg hover:bg-black'
                            : 'bg-border text-text-muted cursor-not-allowed rounded-lg'
                        }`}
                      >
                        {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
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
