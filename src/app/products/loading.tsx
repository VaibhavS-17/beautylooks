import React from 'react';
import { Search, Layers, Sparkles } from 'lucide-react';

export default function ProductsLoading() {
  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-left min-h-screen">
      
      {/* Header Skeleton */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="h-10 sm:h-12 w-64 bg-secondary rounded-lg animate-pulse mb-4" />
        <div className="w-16 h-0.5 bg-secondary animate-pulse mb-4" />
        <div className="h-4 w-full max-w-xl bg-secondary rounded animate-pulse" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="max-w-2xl mx-auto mb-14">
        <div className="relative flex items-center bg-white rounded-2xl border-2 border-border p-1.5 h-14">
          <Search size={22} className="text-border ml-4 shrink-0 animate-pulse" />
          <div className="flex-1 ml-4 h-6 bg-secondary rounded animate-pulse" />
          <div className="w-24 h-10 bg-secondary rounded-xl shrink-0 animate-pulse ml-2" />
        </div>
      </div>

      {/* Shop By Category Skeleton */}
      <div className="mb-10 pb-4 border-b border-border/60">
        <h2 className="text-xs font-bold text-border uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
          <Layers size={14} />
          Shop By Category
        </h2>
        <div className="flex gap-4 overflow-hidden py-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-full border border-border bg-secondary shrink-0 w-32 h-11 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Shop By Brand Skeleton */}
      <div className="mb-12 pb-6 border-b border-border/60">
        <h2 className="text-xs font-bold text-border uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
          <Sparkles size={14} />
          Shop By Brand
        </h2>
        <div className="flex gap-4 overflow-hidden py-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-2 w-[80px] shrink-0">
              <div className="w-14 h-14 rounded-full border-2 border-border bg-secondary animate-pulse" />
              <div className="h-2 w-12 bg-secondary rounded animate-pulse mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar Skeleton (Filters) */}
        <aside className="hidden lg:block lg:w-1/4">
          <div className="space-y-10">
            {/* Categories */}
            <div>
              <div className="h-4 w-32 bg-secondary rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-4 h-4 border border-border rounded-sm bg-secondary animate-pulse" />
                    <div className="h-4 w-24 bg-secondary rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <div className="h-4 w-20 bg-secondary rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-4 h-4 border border-border rounded-sm bg-secondary animate-pulse" />
                    <div className="h-4 w-20 bg-secondary rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Sections Skeleton */}
        <main className="lg:w-3/4 space-y-16">
          <div className="hidden lg:flex justify-between items-center mb-4 pb-4 border-b border-border">
            <div className="h-4 w-20 bg-secondary rounded animate-pulse" />
          </div>

          <section className="space-y-6">
            {/* Category Header */}
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="p-2 w-9 h-9 rounded-xl bg-secondary border border-border animate-pulse" />
              <div className="h-8 w-48 bg-secondary rounded-lg animate-pulse" />
              <div className="h-5 w-20 bg-secondary rounded-full animate-pulse ml-2" />
            </div>

            {/* Grid of Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="product-card flex flex-col h-full bg-white rounded-2xl p-3 border border-border/50">
                  <div className="h-[250px] sm:h-[350px] w-full rounded-xl bg-secondary animate-pulse mb-4" />
                  
                  <div className="px-1 flex flex-col flex-grow">
                    <div className="h-3 w-16 bg-secondary rounded animate-pulse mb-2" />
                    <div className="h-5 w-3/4 bg-secondary rounded animate-pulse mb-3" />
                    <div className="h-6 w-24 bg-secondary rounded animate-pulse mb-2" />
                    
                    <div className="mt-auto pt-4 flex gap-2">
                      <div className="h-10 flex-1 bg-secondary rounded-xl animate-pulse" />
                      <div className="h-10 w-10 bg-secondary rounded-xl animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
