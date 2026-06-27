'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { products, categories, blogPosts, formatPrice } from '@/lib/data';
import { useCartStore } from '@/lib/store';

export default function Homepage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4);

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
      <section className="relative w-full h-[85vh] flex items-center justify-center bg-secondary">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-beauty.png"
            alt="Beauty Looks Mumbai Hero Campaign"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content Box Overlay */}
        <div className="relative z-10 card-container px-8 py-16 md:px-16 md:py-20 text-center max-w-2xl mx-4 animate-slide-up bg-white/95 backdrop-blur-sm">
          <span className="subtitle block mb-6">
            The Autumn Collection
          </span>
          <h1 className="text-4xl md:text-6xl font-display text-text-main leading-tight mb-6">
            Unveil Your Radiance
          </h1>
          <p className="text-sm md:text-base text-text-muted mb-8 font-light">
            Simple. Genuine. Affordable. Experience professional results at home with Mumbai's most trusted curated beauty sets.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/products" className="btn-primary">
              Shop Collection
            </Link>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES SECTION ================= */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl text-text-main mb-4">Curated Edits</h2>
          <div className="w-12 h-px bg-accent mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link
              href={`/products?category=${category.slug}`}
              key={category.id}
              className="group block"
            >
              <div className="relative h-[400px] w-full bg-secondary mb-4 rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
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

      {/* ================= BESTSELLERS SECTION ================= */}
      <section className="py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {featuredProducts.map((product) => {
              const isOnSale = product.salePrice !== null;
              const currentPrice = product.salePrice || product.price;

              return (
                <div key={product.id} className="product-card group cursor-pointer">
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="relative h-[350px] rounded-2xl overflow-hidden shadow-sm bg-white">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover product-image transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
                        {product.badge === 'bestseller' && (
                          <span className="badge-dark">BESTSELLER</span>
                        )}
                        {product.badge === 'sale' && (
                          <span className="badge-gold">SALE</span>
                        )}
                        {product.badge === 'new' && (
                          <span className="badge-dark">NEW</span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="pt-6 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] font-semibold text-text-muted tracking-widest uppercase block mb-1">
                          {product.brand}
                        </span>
                        <h3 className="font-display text-lg text-text-main hover:text-accent transition-colors">
                          <Link href={`/products/${product.slug}`}>{product.name}</Link>
                        </h3>
                      </div>
                      <div className="text-right flex flex-col">
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
                      onClick={(e) => {
                        e.preventDefault();
                        addItem(product, 1);
                        openCart();
                      }}
                      className="btn-secondary w-full mt-4 rounded-xl"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-12 text-center sm:hidden">
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
      <section className="py-24 md:py-32 bg-primary">
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
      <section className="py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl text-text-main mb-4">The Journal</h2>
            <div className="w-12 h-px bg-accent mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {blogPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="group cursor-pointer">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="relative h-[300px] w-full bg-primary-dark mb-6 overflow-hidden rounded-2xl shadow-sm">
                    <div className="absolute inset-0 bg-text-main opacity-5 group-hover:opacity-10 transition-opacity z-10" />
                    {/* Placeholder for editorial image */}
                    <div className="w-full h-full bg-primary-dark flex items-center justify-center font-display text-3xl text-border">
                      Editorial
                    </div>
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
      <section className="py-24 border-t border-border">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl text-text-main mb-6">
            Join The Society
          </h2>
          <p className="text-sm text-text-muted mb-10 font-light">
            Subscribe to receive updates, access to exclusive deals, and more.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row max-w-md mx-auto border border-border rounded-2xl overflow-hidden shadow-sm bg-white">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow bg-transparent text-sm text-text-main px-6 py-4 focus:outline-none placeholder:text-text-muted/60"
              required
            />
            <button type="submit" className="bg-text-main text-primary px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-accent transition-colors">
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
    </div>
  );
}
