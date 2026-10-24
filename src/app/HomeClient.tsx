'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { formatPrice, getDiscountPercent } from '@/lib/data';
import { useCartStore } from '@/lib/store';
import { StarRating } from '@/components/product/StarRating';
import NotifyMeModal from '@/components/layout/NotifyMeModal';

interface HomeClientProps {
  featuredProducts: any[];
  categories: any[];
  blogPosts: any[];
  siteSettings: {
    hero_title: string;
    hero_subtitle: string;
    hero_description: string;
    hero_image_url: string;
    hero_mobile_image_url?: string;
    hero_video_url?: string;
    hero_button_text: string;
    hero_button_link: string;
  };
}

export default function HomeClient({ featuredProducts, categories, blogPosts, siteSettings }: HomeClientProps) {
  const heroImageUrl = siteSettings.hero_image_url || '/images/hero-beauty.png';
  const heroMobileImageUrl = siteSettings.hero_mobile_image_url || heroImageUrl;
  const heroVideoUrl = siteSettings.hero_video_url;
  const fallbackProductImage = '/images/products/facial-kit-1.png';

  const addItem = useCartStore((state) => state.addItem);
  const [notifyProduct, setNotifyProduct] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="w-full bg-primary overflow-hidden -mt-[96px] sm:-mt-[127px]">
      {/* ================= HERO SECTION ================= */}
      <div className="relative w-full h-[100svh] min-h-[100svh] overflow-hidden bg-brand-dark">
        {/* Background Media */}
        <div className="absolute inset-0 z-0">
          <div className="hidden sm:block absolute inset-0">
            {heroVideoUrl ? (
              <video
                src={heroVideoUrl}
                poster={heroImageUrl}
                preload="metadata"
                className="w-full h-full object-cover opacity-60"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <Image
                src={heroImageUrl}
                alt={siteSettings.hero_title}
                fill
                sizes="100vw"
                className="object-cover opacity-60"
                priority
              />
            )}
          </div>
          <div className="block sm:hidden absolute inset-0">
            <Image
              src={heroMobileImageUrl}
              alt={siteSettings.hero_title}
              fill
              sizes="100vw"
              className="object-cover opacity-60"
              priority
            />
          </div>
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/30 to-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 max-w-4xl mx-auto">
          <span className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-accent-light mb-4">
            Curated Mumbai Salon Care
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight mb-6 text-white leading-[1.1]">
            {siteSettings.hero_title}
          </h1>
          <p className="text-sm sm:text-base md:text-lg font-light mb-10 max-w-xl text-white/85 leading-relaxed">
            {siteSettings.hero_description}
          </p>
          <Link
            href={siteSettings.hero_button_link}
            className="px-9 py-4 bg-white text-brand-dark font-semibold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-accent hover:text-white transition-all duration-300 shadow-md active:scale-95"
          >
            {siteSettings.hero_button_text}
          </Link>
        </div>
      </div>

      {/* ================= SHOP BY CONCERN ================= */}
      <section className="py-16 md:py-24 bg-white overflow-hidden border-b border-border/50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="subtitle block mb-2">Targeted Regimes</span>
            <h2 className="font-serif text-3xl md:text-4xl text-text-main mb-4 font-normal">Shop by Concern</h2>
            <div className="w-12 h-px bg-accent/60 mx-auto" />
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { title: "Brightening & Glow", q: "glow", img: "/images/concerns/brightening.jpg", desc: "Vitamin C · Turmeric · AHA" },
              { title: "Tanning & Sun", q: "tan", img: "/images/concerns/tanning.jpg", desc: "SPF · Aloe Vera · After-Sun" },
              { title: "Deep Hydration", q: "hydra", img: "/images/concerns/hydration.jpg", desc: "Hyaluronic · Rose · Ceramides" },
              { title: "Frizz & Smoothing", q: "keratin", img: "/images/concerns/smoothing.jpg", desc: "Keratin · Argan · Silk Protein" }
            ].map((concern, idx) => (
              <Link 
                key={idx} 
                href={`/products?search=${concern.q}`}
                className="group relative block overflow-hidden rounded-2xl bg-secondary aspect-[3/4]"
              >
                <Image
                  src={concern.img}
                  alt={concern.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                {/* Subtle refined overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/25 to-transparent transition-opacity duration-300" />
                
                {/* Content overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 flex flex-col items-start">
                  <h3 className="text-sm sm:text-base font-semibold text-white tracking-wide mb-1">
                    {concern.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-white/75 font-light mb-3">
                    {concern.desc}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs text-accent-light font-semibold uppercase tracking-[0.15em] group-hover:text-white transition-colors">
                    Explore
                    <ArrowRight size={12} className="transform group-hover:translate-x-1.5 transition-transform duration-200 ease-out" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES SECTION ================= */}
      <section className="py-16 md:py-24 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="subtitle block mb-2">Curated Categories</span>
          <h2 className="font-serif text-3xl md:text-4xl text-text-main mb-4 font-normal">Shop by Category</h2>
          <div className="w-12 h-px bg-accent/60 mx-auto" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {categories.map((category) => (
            <Link
              href={`/products?category=${category.slug}`}
              key={category.id}
              className="group block"
            >
              <div className="relative aspect-[4/5] w-full bg-secondary mb-4 overflow-hidden rounded-2xl border border-border/50">
                {category.imageUrl && !category.imageUrl.includes('facial-kits.png') ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8F6E47] to-[#1C1917] flex items-center justify-center p-6 text-center text-white transition-transform duration-500 ease-out group-hover:scale-105">
                    <span className="font-serif text-xl sm:text-2xl font-normal tracking-wide">
                      {category.name}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-text-main group-hover:text-accent transition-colors">
                  {category.name}
                </h3>
                <span className="text-[11px] text-text-muted mt-0.5 block font-light">Explore Collection</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="py-16 md:py-24 bg-white border-y border-border/50 relative">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 sm:mb-16 gap-4">
            <div>
              <span className="subtitle block mb-2">Selected Regimes</span>
              <h2 className="font-serif text-3xl md:text-4xl text-text-main font-normal">Cult Favorites</h2>
              <p className="text-sm text-text-muted font-light mt-1">
                Authentic salon formulations trusted by Mumbai&apos;s beauty enthusiasts.
              </p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-text-main hover:text-accent transition-colors"
            >
              <span>View All Products</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => {
              const isOnSale = product.salePrice !== null;
              const currentPrice = product.salePrice || product.price;

              return (
                <div
                  key={product.id}
                  className="product-card group flex flex-col h-full bg-white rounded-2xl border border-border/60 overflow-hidden hover:border-accent/40 hover:shadow-md transition-all duration-300"
                >
                  <Link href={`/products/${product.slug}`} className="block overflow-hidden relative aspect-[3/4] bg-primary">
                    <Image
                      src={product.images?.[0] || fallbackProductImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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
                          <span className="text-[11px] font-semibold text-text-main">{product.rating.toFixed(1)}</span>
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
                              {getDiscountPercent(product.price, product.salePrice)}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <button
                      suppressHydrationWarning
                      onClick={(e) => {
                        e.preventDefault();
                        if (product.stockQuantity > 0) {
                          addItem(product, 1);
                        } else {
                          setNotifyProduct({ id: product.id, name: product.name });
                        }
                      }}
                      className={`w-full mt-4 py-3 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all duration-200 ${
                        product.stockQuantity > 0
                          ? 'btn-primary'
                          : 'btn-secondary text-text-muted'
                      }`}
                    >
                      {product.stockQuantity > 0 ? 'Add to Cart' : 'Notify Me'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-10 text-center sm:hidden">
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-text-main hover:text-accent transition-colors"
            >
              <span>View All Products</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= BRAND STORY SECTION ================= */}
      <section className="py-20 md:py-32 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="subtitle block mb-4">
            Our Philosophy
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-light mb-6 tracking-tight leading-tight text-text-main">
            Simple • Genuine • Affordable <br />
            <span className="font-serif italic font-normal text-accent">Professional Beauty Care</span>
          </h2>
          <p className="text-sm sm:text-base text-text-muted font-light leading-relaxed max-w-2xl mx-auto">
            Founded with a commitment to transparency in Mumbai&apos;s beauty landscape, we curate 100% authentic salon-grade skincare, professional facial kits, and restorative hair care directly from official distributors. No middlemen, no counterfeit stock — simply genuine formulations delivered directly to your doorstep.
          </p>
        </div>
      </section>

      {/* ================= EDITORIAL / BLOG PREVIEW ================= */}
      {blogPosts && blogPosts.length > 0 && (
        <section className="py-16 md:py-24 bg-secondary/50 border-t border-border/50">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="subtitle block mb-2">Beauty Journal</span>
              <h2 className="font-serif text-3xl md:text-4xl text-text-main mb-4 font-normal">Expert Editorial</h2>
              <div className="w-12 h-px bg-accent/60 mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {blogPosts.slice(0, 3).map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="relative aspect-[16/10] w-full bg-primary mb-6 overflow-hidden rounded-2xl border border-border/40">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary-dark flex items-center justify-center font-serif text-2xl text-text-muted/40">
                          Beauty Journal
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold text-accent tracking-[0.2em] uppercase block">
                        {post.publishedAt}
                      </span>
                      <h3 className="font-serif text-lg sm:text-xl text-text-main group-hover:text-accent transition-colors leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-text-muted font-light line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <span className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-text-main group-hover:text-accent transition-colors pt-2">
                        <span>Read Article</span>
                        <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Notify Me Modal for out-of-stock products */}
      <NotifyMeModal
        isOpen={!!notifyProduct}
        onClose={() => setNotifyProduct(null)}
        productId={notifyProduct?.id || ''}
        productName={notifyProduct?.name || ''}
      />
    </div>
  );
}
