'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Minus, Plus, ChevronLeft, ChevronRight, Truck, Shield, RotateCcw, ArrowRight, X } from 'lucide-react';
import { formatPrice, getDiscountPercent } from '@/lib/data';
import { useCartStore, useWishlistStore } from '@/lib/store';

interface ProductDetailProps {
  product: any;
  relatedProducts: any[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailProps) {
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const fallbackProductImage = '/images/products/facial-kit-1.png';
  
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <h1 className="font-display text-4xl text-[#000000] mb-4">Product Not Found</h1>
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

  return (
    <div className="bg-primary">
      {/* Breadcrumbs */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex text-[10px] font-semibold tracking-widest uppercase text-text-muted">
          <Link href="/" className="hover:text-text-main transition-colors">Home</Link>
          <ChevronRight size={12} className="mx-2" />
          <Link href="/products" className="hover:text-text-main transition-colors">Collection</Link>
          <ChevronRight size={12} className="mx-2" />
          <Link href={`/products?category=${product.categoryId}`} className="hover:text-text-main transition-colors">{product.category}</Link>
          <ChevronRight size={12} className="mx-2" />
          <span className="text-text-main">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24">
          
          {/* Left: Product Images */}
          <div className="space-y-4">
            <div
              className="relative aspect-square w-full bg-primary/20 rounded-2xl overflow-hidden group cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                src={product.images?.[selectedImageIndex] || fallbackProductImage}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute top-6 left-6 flex flex-col space-y-2 z-10">
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

              {/* Left/Right Navigation Arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev: number) => (prev === 0 ? product.images.length - 1 : prev - 1));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} className="text-text-main" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev: number) => (prev === product.images.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} className="text-text-main" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {product.images.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative aspect-square w-full bg-primary/20 rounded-xl overflow-hidden border cursor-pointer hover:opacity-80 transition-all duration-200 ${idx === selectedImageIndex ? 'ring-2 ring-accent border-accent' : 'border-border/50'}`}
                  >
                    <Image src={img} alt={`${product.name} view ${idx + 1}`} fill sizes="(max-width: 640px) 25vw, 120px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col justify-center">
            <span className="text-xs font-semibold text-text-muted tracking-widest uppercase mb-2">
              {product.brand}
            </span>
            <h1 className="font-display text-4xl text-text-main leading-tight mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-4 mb-6">
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

            <p className="text-sm text-text-muted font-light leading-relaxed mb-8">
              {product.shortDescription}
            </p>

            {/* Badges/Info */}
            <div className="flex flex-wrap gap-3 mb-10">
              <div className="border border-border rounded-full px-4 py-2 text-[10px] uppercase tracking-widest font-semibold text-text-main">
                Skin Type: {product.skinType}
              </div>
              <div className={`border rounded-full px-4 py-2 text-[10px] uppercase tracking-widest font-semibold ${
                product.stockQuantity > 0 ? 'border-text-main text-text-main' : 'border-border text-text-muted'
              }`}>
                {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex items-center border border-border/50 bg-white shadow-sm rounded-xl h-12 w-full sm:w-32 overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 h-full flex items-center justify-center hover:bg-secondary transition-colors text-text-main"
                >
                  <Minus size={14} />
                </button>
                <span className="flex-1 text-center text-sm font-semibold text-text-main">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 h-full flex items-center justify-center hover:bg-secondary transition-colors text-text-main"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button 
                onClick={() => {
                  addItem(product, quantity);
                  openCart();
                }}
                disabled={product.stockQuantity === 0}
                className={`flex-1 h-12 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all ${
                  product.stockQuantity > 0 
                    ? 'bg-brand-dark text-primary hover:bg-accent hover:text-brand-dark shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(202,138,4,0.3)] hover:-translate-y-1' 
                    : 'bg-border text-text-muted cursor-not-allowed'
                }`}
              >
                {product.stockQuantity > 0 ? 'Add to Bag' : 'Out of Stock'}
              </button>

              <button 
                onClick={() => toggleWishlist(product.id)}
                className="h-12 w-12 rounded-xl flex items-center justify-center border border-border bg-white shadow-sm hover:bg-secondary transition-colors"
              >
                <Heart size={18} className={isWishlisted ? 'fill-accent text-accent' : 'text-text-main'} />
              </button>
            </div>

            {/* Service Pledges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-border">
              <div className="flex items-center space-x-3">
                <Truck size={18} className="text-accent" strokeWidth={1.5} />
                <span className="text-xs text-text-muted">Complimentary Shipping</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield size={18} className="text-accent" strokeWidth={1.5} />
                <span className="text-xs text-text-muted">100% Authentic</span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw size={18} className="text-accent" strokeWidth={1.5} />
                <span className="text-xs text-text-muted">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-24 pt-16 border-t border-border">
          <div className="flex space-x-4 sm:space-x-8 mb-6 sm:mb-8 border-b border-border overflow-x-auto no-scrollbar">
            {['description', 'ingredients', 'shipping'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-xs font-semibold uppercase tracking-widest relative transition-colors ${
                  activeTab === tab ? 'text-text-main' : 'text-text-muted hover:text-text-main'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-px bg-text-main" />
                )}
              </button>
            ))}
          </div>

          <div className="py-4 max-w-3xl">
            {activeTab === 'description' && (
              <div className="prose prose-sm prose-neutral text-text-muted font-light leading-relaxed">
                <p>{product.description}</p>
                <ul className="mt-6 space-y-2 list-disc pl-4 text-xs uppercase tracking-widest font-semibold text-text-main">
                  <li>Dermatologically Tested</li>
                  <li>Suitable for {product.skinType} skin</li>
                  <li>Premium formulation</li>
                </ul>
              </div>
            )}
            
            {activeTab === 'ingredients' && (
              <div className="text-sm text-text-muted font-light leading-relaxed">
                <p>We believe in full transparency. Our products are formulated with the highest quality ingredients to ensure maximum efficacy without compromising your skin&apos;s health.</p>
                <p className="mt-4 italic">Please refer to the physical product packaging for the most accurate and up-to-date list of ingredients.</p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="text-sm text-text-muted font-light leading-relaxed space-y-4">
                <p><strong>Standard Delivery:</strong> 2-4 business days (Mumbai region). Complimentary on orders over ₹499.</p>
                <p><strong>Express Delivery:</strong> Same-day or next-day delivery available for select pincodes in Mumbai.</p>
                <p><strong>Returns:</strong> We accept returns of unopened and unused products within 7 days of delivery. Due to hygiene reasons, opened cosmetics cannot be returned.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-border">
            <div className="flex justify-between items-end mb-12">
              <h2 className="font-display text-2xl text-text-main">You May Also Like</h2>
              <Link href={`/products?category=${product.categoryId}`} className="hidden sm:inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-text-main hover:text-accent transition-colors">
                <span>View More</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relProduct) => (
                <Link href={`/products/${relProduct.slug}`} key={relProduct.id} className="group block">
                  <div className="relative h-[250px] sm:h-[300px] w-full bg-primary/20 rounded-2xl border border-border/50 mb-4 overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
                    <Image
                      src={relProduct.images?.[0] || fallbackProductImage}
                      alt={relProduct.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-text-muted tracking-widest uppercase block mb-1">
                      {relProduct.brand}
                    </span>
                    <h3 className="font-display text-base text-text-main mb-1 group-hover:text-accent transition-colors">
                      {relProduct.name}
                    </h3>
                    <span className="text-sm font-medium text-text-main">
                      {formatPrice(relProduct.salePrice || relProduct.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <Lightbox
          images={product.images && product.images.length > 0 ? product.images : [fallbackProductImage]}
          selectedIndex={selectedImageIndex}
          onClose={() => setLightboxOpen(false)}
          onChangeIndex={setSelectedImageIndex}
          title={product.name}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  selectedIndex,
  onClose,
  onChangeIndex,
  title
}: {
  images: string[];
  selectedIndex: number;
  onClose: () => void;
  onChangeIndex: (idx: number) => void;
  title: string;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onChangeIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
      if (e.key === 'ArrowRight') onChangeIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onChangeIndex, onClose, selectedIndex]);

  const currentMedia = images[selectedIndex];
  const isVideo = currentMedia?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 text-white">
        <span className="text-xs uppercase tracking-widest font-semibold opacity-75">{title} ({selectedIndex + 1}/{images.length})</span>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close lightbox"
        >
          <X size={20} />
        </button>
      </div>

      {/* Media Display */}
      <div className="relative w-full max-w-4xl h-[75vh] flex items-center justify-center">
        {isVideo ? (
          <video src={currentMedia} controls autoPlay className="max-h-full max-w-full rounded-xl object-contain" />
        ) : (
          <Image
            src={currentMedia}
            alt={title}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => onChangeIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => onChangeIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-6 flex space-x-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onChangeIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${idx === selectedIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

