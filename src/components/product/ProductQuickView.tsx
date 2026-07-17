'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { Product } from '@/lib/types';

interface ProductQuickViewProps {
  product: Product;
  fallbackProductImage: string;
  onClose: () => void;
  addItem: (product: Product, quantity: number) => void;
}

export function ProductQuickView({
  product,
  fallbackProductImage,
  onClose,
  addItem
}: ProductQuickViewProps) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
        >
          <X size={20} className="text-text-main" />
        </button>
        <div className="w-full md:w-1/2 relative bg-secondary min-h-[300px] md:min-h-full">
          <Image 
            src={product.images?.[0] || fallbackProductImage} 
            alt={product.name} 
            fill 
            className="object-cover"
          />
        </div>
        <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto">
          <span className="text-[10px] font-bold text-accent tracking-widest uppercase block mb-2">
            {product.brand}
          </span>
          <h2 className="font-display text-2xl md:text-3xl text-text-main font-semibold mb-4">
            {product.name}
          </h2>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl font-semibold text-text-main">
              {formatPrice(product.salePrice || product.price)}
            </span>
            {product.salePrice && (
              <span className="text-sm text-text-muted line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted leading-relaxed mb-8 line-clamp-4">
            {product.description}
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                addItem(product, 1);
                onClose();
              }}
              disabled={product.stockQuantity === 0}
              className={`w-full py-4 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all ${
                product.stockQuantity > 0
                  ? 'bg-brand-dark text-primary hover:bg-accent hover:text-brand-dark'
                  : 'bg-border text-text-muted cursor-not-allowed'
              }`}
            >
              {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <Link 
              href={`/products/${product.slug}`}
              className="w-full text-center py-4 text-xs font-semibold uppercase tracking-widest text-text-main hover:text-accent transition-colors"
            >
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
