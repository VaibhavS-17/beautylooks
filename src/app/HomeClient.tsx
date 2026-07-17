'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { useCartStore } from '@/lib/store';
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
    hero_button_text: string;
    hero_button_link: string;
  };
}

export default function HomeClient({ featuredProducts, categories, blogPosts, siteSettings }: HomeClientProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const heroImageUrl = siteSettings.hero_image_url || '/images/hero-beauty.png';
  const heroMobileImageUrl = siteSettings.hero_mobile_image_url || heroImageUrl;
  const fallbackProductImage = '/images/products/facial-kit-1.png';

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const [notifyProduct, setNotifyProduct] = useState<{ id: string; name: string } | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <div className="w-full bg-primary overflow-hidden">
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full h-[80vh] sm:h-auto sm:aspect-video sm:max-h-[85vh] xl:max-h-[800px] flex items-center justify-center bg-[#111]">
        <div className="absolute inset-0 z-0">
          {/* Desktop Image */}
          <div className="hidden sm:block absolute inset-0">
            <Image
              src={heroImageUrl}
              alt={siteSettings.hero_title}
              fill
              sizes="100vw"
              className="object-cover opacity-90"
              priority
            />
          </div>
          {/* Mobile Image */}
          <div className="block sm:hidden absolute inset-0">
            <Image
              src={heroMobileImageUrl}
              alt={siteSettings.hero_title}
              fill
              sizes="100vw"
              className="object-cover opacity-90"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        </div>

        <div className="relative z-10 px-6 py-16 md:px-12 text-center max-w-4xl mx-4 animate-slide-up">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-white/90 mb-6 block drop-shadow-sm">
            {siteSettings.hero_subtitle}
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display text-white leading-[1.1] mb-8 drop-shadow-md">
            {siteSettings.hero_title}
          </h1>
          <p className="text-sm md:text-base text-white/80 mb-10 font-light max-w-xl mx-auto">
            {siteSettings.hero_description}
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href={siteSettings.hero_button_link} className="inline-flex items-center justify-center px-10 py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.15em] transition-transform duration-700 hover:scale-105">
              {siteSettings.hero_button_text}
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SHOP BY CONCERN ================= */}
      <section className="py-12 md:py-16 bg-white overflow-hidden">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl text-text-main mb-3">Shop by Concern</h2>
            <div className="w-8 h-px bg-accent mx-auto" />
          </div>
          
          {/* Horizontal Scrolling Menu for Mobile */}
          <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 gap-4 sm:gap-6 hide-scrollbar">
            {[
              { title: "Brightening & Glow", q: "glow" },
              { title: "Tanning & Sun", q: "tan" },
              { title: "Deep Hydration", q: "hydra" },
              { title: "Frizz & Smoothing", q: "keratin" }
            ].map((concern, idx) => (
              <Link 
                key={idx} 
                href={`/products?search=${concern.q}`}
                className="min-w-[160px] sm:min-w-0 flex flex-col items-center justify-center p-8 transition-opacity duration-500 hover:opacity-60"
              >
                <div className="w-16 h-16 rounded-full border border-text-main flex items-center justify-center mb-6">
                  <span className="text-text-main text-lg font-serif italic">0{idx + 1}</span>
                </div>
                <h3 className="text-xs font-bold text-text-main text-center uppercase tracking-[0.1em]">{concern.title}</h3>
                <span className="text-[10px] text-text-muted mt-2 tracking-[0.2em] uppercase">Explore</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES SECTION ================= */}
      <section className="py-16 md:py-24 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl text-text-main mb-4">Curated Edits</h2>
          <div className="w-12 h-px bg-accent mx-auto" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {categories.map((category) => (
            <Link
              href={`/products?category=${category.slug}`}
              key={category.id}
              className="group block"
            >
              <div className="relative h-[300px] md:h-[400px] w-full bg-[#FAFAF9] mb-6 overflow-hidden product-image-container">
                {category.imageUrl && !category.imageUrl.includes('facial-kits.png') ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C88E75] to-[#2C1E16] flex items-center justify-center p-6 text-center text-white transition-transform duration-700 group-hover:scale-105">
                    <span className="font-serif text-2xl font-bold tracking-tight uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {category.name}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-text-main">
                  {category.name}
                </h3>
                <span className="text-xs text-text-muted mt-1 block">Explore</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#FDFBF7] to-white relative">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-multiply"></div>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="font-display text-3xl text-text-main mb-4">Cult Favorites</h2>
              <p className="text-sm text-text-muted font-light">
                The essentials trusted by Mumbai's beauty enthusiasts.
              </p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-text-main hover:text-accent transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 lg:gap-12">
            {featuredProducts.map((product, index) => {
              const isOnSale = product.salePrice !== null;
              const currentPrice = product.salePrice || product.price;

              return (
                  <div key={product.id} className="product-card group cursor-pointer flex flex-col h-full bg-white rounded-2xl overflow-hidden hover:shadow-gold-hover border border-transparent transition-all duration-500">
                    <Link href={`/products/${product.slug}`} className="block overflow-hidden relative">
                      <div className="h-[200px] sm:h-[350px] relative bg-[#FAFAF9] product-image-container">
                        <Image
                          src={product.images?.[0] || fallbackProductImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, 25vw"
                          className="object-cover product-image"
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
                      </div>
                    </Link>

                    <div className="p-2.5 sm:p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-full">
                          <span className="text-[10px] font-semibold text-accent tracking-widest uppercase block mb-1">
                            {product.brand}
                          </span>
                          <h3 className="font-display text-lg text-text-main hover:text-accent transition-colors mb-1 line-clamp-2">
                            <Link href={`/products/${product.slug}`}>{product.name}</Link>
                          </h3>
                          {product.reviewCount > 0 ? (
                            <div className="flex items-center space-x-1 mb-2">
                              <span className="text-accent text-xs">★</span>
                              <span className="text-[11px] font-semibold text-text-main">{product.rating.toFixed(1)}</span>
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
                          <span className="text-sm font-medium text-text-main">
                            {formatPrice(currentPrice)}
                          </span>
                          {isOnSale && (
                            <span className="text-xs text-text-muted line-through mt-0.5">
                              {formatPrice(product.price)}
                            </span>
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
                        className={`w-full mt-4 px-4 py-3 text-xs font-semibold uppercase tracking-widest transition-all ${
                          product.stockQuantity > 0
                            ? 'bg-accent text-white shadow-md rounded-lg hover:bg-black'
                            : 'bg-black text-white shadow-md rounded-lg hover:bg-gray-800'
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
      <section className="py-16 md:py-32 bg-primary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="subtitle block mb-6">
            Our Philosophy
          </span>
          <h2 className="font-display text-3xl md:text-5xl text-text-main leading-tight mb-8">
            Authenticity in every detail. <br />
            Beauty without compromise.
          </h2>
          <p className="text-sm md:text-base text-text-muted font-light leading-relaxed max-w-2xl mx-auto">
            Founded with a vision to redefine the beauty landscape in Mumbai, we curate authentic skincare products from the most celebrated global and local cosmetics brands. Every product is rigorously vetted to ensure it meets our standard of excellence.
          </p>
        </div>
      </section>

      {/* ================= EDITORIAL / BLOG PREVIEW ================= */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl text-text-main mb-4">The Journal</h2>
            <div className="w-12 h-px bg-accent mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {blogPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="group cursor-pointer">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="relative h-[250px] sm:h-[300px] w-full bg-primary/20 mb-6 overflow-hidden rounded-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
                    <div className="absolute inset-0 bg-text-main opacity-5 group-hover:opacity-10 transition-opacity z-10" />
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-dark flex items-center justify-center font-display text-3xl text-border">
                        Editorial
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <span className="text-[10px] font-semibold text-accent tracking-widest uppercase">
                      {post.publishedAt}
                    </span>
                    <h3 className="font-display text-xl text-text-main group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-text-muted font-light line-clamp-2">
                      {post.excerpt}
                    </p>
                    <span className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-text-main group-hover:text-accent transition-colors pt-2">
                      <span>Read Article</span>
                      <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl text-text-main mb-6">
            Join The Society
          </h2>
          <p className="text-sm text-text-muted mb-10 font-light">
            Subscribe to receive updates, access to exclusive deals, and more.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row max-w-md mx-auto border border-border rounded-2xl overflow-hidden shadow-sm bg-white">
            <input
              suppressHydrationWarning
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow bg-transparent text-sm text-text-main px-6 py-4 focus:outline-none placeholder:text-text-muted/60"
              required
            />
            <button suppressHydrationWarning type="submit" className="bg-text-main text-primary px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-accent transition-colors">
              Subscribe
            </button>
          </form>
          {subscribed && (
            <p className="mt-4 text-sm text-text-main uppercase tracking-widest font-semibold animate-fade-in">
              Thank you for subscribing.
            </p>
          )}
        </div>
      </section>

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
