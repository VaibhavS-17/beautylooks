import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function ProductDetailLoading() {
  return (
    <div className="bg-primary min-h-screen">
      {/* Breadcrumbs Skeleton */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center space-x-2">
          <div className="h-3 w-10 bg-secondary rounded animate-pulse" />
          <ChevronRight size={12} className="text-text-muted mx-1" />
          <div className="h-3 w-20 bg-secondary rounded animate-pulse" />
          <ChevronRight size={12} className="text-text-muted mx-1" />
          <div className="h-3 w-16 bg-secondary rounded animate-pulse" />
          <ChevronRight size={12} className="text-text-muted mx-1" />
          <div className="h-3 w-32 bg-secondary rounded animate-pulse" />
        </nav>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24">
          
          {/* Left: Product Images Skeleton */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full bg-secondary rounded-2xl animate-pulse" />
            
            {/* Thumbnail Gallery Skeleton */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative aspect-square w-full bg-secondary rounded-xl animate-pulse" />
              ))}
            </div>
          </div>

          {/* Right: Product Details Skeleton */}
          <div className="flex flex-col justify-center">
            {/* Brand */}
            <div className="h-3 w-24 bg-secondary rounded animate-pulse mb-3" />
            
            {/* Title */}
            <div className="h-10 sm:h-12 w-3/4 bg-secondary rounded-lg animate-pulse mb-5" />
            
            {/* Price Row */}
            <div className="flex items-center space-x-4 mb-7">
              <div className="h-8 w-24 bg-secondary rounded animate-pulse" />
              <div className="h-5 w-16 bg-secondary/50 rounded animate-pulse" />
            </div>
            
            {/* Divider */}
            <div className="w-12 h-px bg-secondary mb-7" />

            {/* Description */}
            <div className="space-y-3 mb-10">
              <div className="h-4 w-full bg-secondary rounded animate-pulse" />
              <div className="h-4 w-11/12 bg-secondary rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-secondary rounded animate-pulse" />
            </div>

            {/* Badges/Info */}
            <div className="flex flex-wrap gap-3 mb-12">
              <div className="h-8 w-32 bg-secondary rounded-full animate-pulse" />
              <div className="h-8 w-24 bg-secondary rounded-full animate-pulse" />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              {/* Quantity */}
              <div className="h-12 w-full sm:w-32 bg-secondary rounded-xl animate-pulse" />
              {/* Add to Cart */}
              <div className="h-12 flex-1 bg-secondary rounded-xl animate-pulse" />
              {/* Wishlist */}
              <div className="h-12 w-full sm:w-12 bg-secondary rounded-xl animate-pulse" />
            </div>
            
            {/* Value Props / Features list */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-5 w-5 bg-secondary rounded-full animate-pulse flex-shrink-0" />
                  <div className="h-3 w-1/2 bg-secondary rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Products Skeleton */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-border/50">
        <div className="flex justify-between items-end mb-12">
          <div className="h-8 sm:h-10 w-64 bg-secondary rounded-lg animate-pulse" />
          <div className="hidden sm:block h-4 w-24 bg-secondary rounded animate-pulse" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[3/4] w-full bg-secondary rounded-2xl animate-pulse" />
              <div className="h-3 w-1/3 bg-secondary rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-secondary rounded animate-pulse" />
              <div className="h-4 w-1/4 bg-secondary rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
