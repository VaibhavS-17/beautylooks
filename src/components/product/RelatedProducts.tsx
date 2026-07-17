'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { StarRating } from './StarRating';

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  salePrice?: number | null;
  images?: string[];
  // Using any to match the original type hack, ideally we should type this properly
  [key: string]: any;
}

interface RelatedProductsProps {
  products: Product[];
  categoryId?: string | null;
  fallbackImage: string;
}

export function RelatedProducts({ products, categoryId, fallbackImage }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="mt-24 pt-16 border-t border-border">
      <div className="flex justify-between items-end mb-12">
        <h2 className="font-display text-2xl text-text-main">Complete Your Ritual</h2>
        <Link href={`/products?category=${categoryId || ''}`} className="hidden sm:inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-text-main hover:text-accent transition-colors">
          <span>View More</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((relProduct) => (
          <Link href={`/products/${relProduct.slug}`} key={relProduct.id} className="group block">
            <div className="relative h-[300px] sm:h-[350px] w-full bg-[#FAFAF9] mb-4 overflow-hidden product-image-container">
              <Image
                src={relProduct.images?.[0] || fallbackImage}
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
              {relProduct.reviewCount > 0 && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <StarRating rating={relProduct.rating || 0} size={12} />
                  <span className="text-[11px] text-text-muted">
                    ({relProduct.reviewCount})
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-text-main">
                {formatPrice(relProduct.salePrice || relProduct.price)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
