'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ChevronDown, Filter } from 'lucide-react';
import { products, categories, formatPrice } from '@/lib/data';
import { Product } from '@/lib/types';
import { useCartStore } from '@/lib/store';

// We wrap the main content in a component to use useSearchParams
function ProductCatalogContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state when URL params change from navbar clicks
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    } else {
      setSelectedCategories([]);
    }
  }, [categoryParam]);

  // Derive all unique brands
  const brands = Array.from(new Set(products.map(p => p.brand)));

  const toggleCategory = (slug: string) => {
    setSelectedCategories(prev => 
      prev.includes(slug) 
        ? prev.filter(c => c !== slug)
        : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      // Find the category IDs for the selected slugs
      const selectedCategoryIds = categories
        .filter(c => selectedCategories.includes(c.slug))
        .map(c => c.id);
      
      result = result.filter(p => selectedCategoryIds.includes(p.categoryId));
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-high':
        result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'newest':
      default:
        // Assuming products array is roughly newest first or has a badge
        result.sort((a, b) => (a.badge === 'new' ? -1 : 1));
        break;
    }

    return result;
  }, [searchQuery, selectedCategories, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="font-display text-4xl text-text-main mb-4">The Collection</h1>
        <div className="w-12 h-px bg-accent mx-auto mb-6" />
        <p className="text-sm text-text-muted font-light max-w-xl mx-auto">
          Explore our curated selection of high-performance skincare and premium cosmetics.
        </p>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-between items-center border-b border-border pb-4">
          <button 
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center space-x-2 text-sm uppercase tracking-widest font-semibold text-text-main"
          >
            <Filter size={16} />
            <span>Filter & Sort</span>
          </button>
          <span className="text-xs text-text-muted">{filteredProducts.length} Results</span>
        </div>

        {/* Sidebar (Filters) */}
        <aside className={`lg:w-1/4 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="sticky top-28 space-y-10">
            
            {/* Search */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-b border-border py-2 pl-8 text-sm focus:outline-none focus:border-text-main placeholder:text-text-muted bg-transparent text-text-main"
                />
                <Search size={16} className="absolute left-0 top-2.5 text-text-main" />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4">Category</h3>
              <div className="space-y-3">
                {categories.map(category => (
                  <label key={category.id} className="flex items-center space-x-3 cursor-pointer group">
                    <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${
                      selectedCategories.includes(category.slug) 
                        ? 'bg-text-main border-text-main' 
                        : 'border-border group-hover:border-text-main'
                    }`}>
                      {selectedCategories.includes(category.slug) && (
                        <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${selectedCategories.includes(category.slug) ? 'text-text-main font-medium' : 'text-text-muted group-hover:text-text-main'}`}>
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4 text-text-main">Sort By</h3>
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-border rounded-xl py-3 px-4 text-sm appearance-none bg-white text-text-main cursor-pointer focus:outline-none focus:border-text-main transition-colors"
                >
                  <option value="newest">Newest Additions</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-3.5 pointer-events-none text-text-muted" />
              </div>
            </div>

            {(selectedCategories.length > 0 || searchQuery) && (
              <button 
                onClick={clearFilters}
                className="text-xs uppercase tracking-widest text-text-muted hover:text-text-main transition-colors border-b border-transparent hover:border-text-main"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:w-3/4">
          <div className="hidden lg:flex justify-between items-center mb-8 pb-4 border-b border-border">
            <span className="text-sm text-text-muted">{filteredProducts.length} Results</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 card-container">
              <p className="text-lg text-text-main mb-2 font-display">No products found.</p>
              <p className="text-sm text-text-muted">Try adjusting your filters or search query.</p>
              <button onClick={clearFilters} className="mt-6 btn-secondary text-xs">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {filteredProducts.map((product) => {
                const isOnSale = product.salePrice !== null;
                const currentPrice = product.salePrice || product.price;

                return (
                  <div key={product.id} className="product-card group cursor-pointer card-container flex flex-col h-full">
                    <Link href={`/products/${product.slug}`} className="block overflow-hidden rounded-t-2xl">
                      <div className="product-image-container h-[300px] sm:h-[400px] relative overflow-hidden">
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
                            <span className="badge-dark">SALE</span>
                          )}
                          {product.badge === 'new' && (
                            <span className="badge-gold">NEW</span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-[10px] font-semibold text-text-muted tracking-widest uppercase block mb-1">
                            {product.brand}
                          </span>
                          <h3 className="font-display text-lg text-text-main line-clamp-2">
                            <Link href={`/products/${product.slug}`} className="hover:text-accent transition-colors">
                              {product.name}
                            </Link>
                          </h3>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-auto pt-4">
                        <span className="text-sm font-medium text-text-main">
                          {formatPrice(currentPrice)}
                        </span>
                        {isOnSale && (
                          <span className="text-xs text-text-muted line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addItem(product, 1);
                          openCart();
                        }}
                        className="w-full mt-5 btn-secondary"
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductCatalog() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-pulse w-8 h-8 border-2 border-text-main border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductCatalogContent />
    </Suspense>
  );
}
