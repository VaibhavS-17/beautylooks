'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ChevronDown, Filter, Sparkles, Layers, Check, X } from 'lucide-react';
import { products as staticProducts, categories as staticCategories, brands as staticBrands, formatPrice } from '@/lib/data';
import { useCartStore } from '@/lib/store';
import { useAdminStore } from '@/lib/adminStore';

// Dynamic category icons helper
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('facial') || name.includes('kit')) return '💄';
  if (name.includes('serum') || name.includes('oil')) return '🧴';
  if (name.includes('cleanser') || name.includes('wash')) return '🧼';
  if (name.includes('mask') || name.includes('pack')) return '🎭';
  if (name.includes('shampoo')) return '💇';
  if (name.includes('conditioner')) return '🧴';
  return '✨'; // default beauty sparkle icon
};

function ProductCatalogContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const adminProducts = useAdminStore((state) => state.adminProducts);
  const adminCategories = useAdminStore((state) => state.adminCategories);
  const adminBrands = useAdminStore((state) => state.adminBrands);

  // Fix Next.js Hydration Mismatch
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setTimeout(() => setIsMounted(true), 0);
  }, []);

  // Combine static and admin-created categories
  const allCategories = useMemo(() => {
    return [...staticCategories, ...adminCategories];
  }, [adminCategories]);

  // Combine static and admin-created brands
  const allBrands = useMemo(() => {
    return [...staticBrands, ...adminBrands];
  }, [adminBrands]);

  // Combine static and admin-created products
  const products = useMemo(() => {
    return [...adminProducts, ...staticProducts];
  }, [adminProducts]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state when URL params change from navbar clicks
  useEffect(() => {
    if (categoryParam) {
      setTimeout(() => setSelectedCategories([categoryParam]), 0);
    } else {
      setTimeout(() => setSelectedCategories([]), 0);
    }
  }, [categoryParam]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories(prev => 
      prev.includes(slug) 
        ? prev.filter(c => c !== slug)
        : [...prev, slug]
    );
  };

  const toggleBrand = (name: string) => {
    setSelectedBrands(prev => 
      prev.includes(name) 
        ? prev.filter(b => b !== name)
        : [...prev, name]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
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
      const selectedCategoryIds = allCategories
        .filter(c => selectedCategories.includes(c.slug))
        .map(c => c.id);
      
      result = result.filter(p => selectedCategoryIds.includes(p.categoryId));
    }

    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
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
        result.sort((a) => (a.badge === 'new' ? -1 : 1));
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategories, selectedBrands, allCategories, sortBy]);

  // Group products by Category and sort each category's products by Brand & Name
  const groupedProducts = useMemo(() => {
    const groups: { [categoryId: string]: { categoryName: string; products: typeof filteredProducts } } = {};

    // Initialize groups for all categories to maintain consistent order
    allCategories.forEach(cat => {
      groups[cat.id] = {
        categoryName: cat.name,
        products: []
      };
    });

    // Populate products
    filteredProducts.forEach(prod => {
      if (!groups[prod.categoryId]) {
        groups[prod.categoryId] = {
          categoryName: prod.category,
          products: []
        };
      }
      groups[prod.categoryId].products.push(prod);
    });

    // Sort products inside each group by Brand (A-Z) and then Name (A-Z)
    Object.keys(groups).forEach(id => {
      groups[id].products.sort((a, b) => {
        const brandCompare = a.brand.localeCompare(b.brand);
        if (brandCompare !== 0) return brandCompare;
        return a.name.localeCompare(b.name);
      });
    });

    // Filter out empty groups so we only display populated categories
    return Object.entries(groups)
      .filter(([, group]) => group.products.length > 0)
      .map(([id, group]) => ({
        id,
        categoryName: group.categoryName,
        products: group.products
      }));
  }, [filteredProducts, allCategories]);

  // Server-rendered fallback skeleton placeholder
  if (!isMounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
        <div className="text-center mb-16 animate-pulse">
          <div className="h-10 w-48 bg-[#E8E2D9] rounded-xl mx-auto mb-4" />
          <div className="h-4 w-72 bg-[#E8E2D9] rounded-lg mx-auto" />
        </div>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-1/4 h-80 bg-white rounded-2xl border border-border shimmer" />
          <div className="w-full lg:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="h-96 bg-white rounded-2xl border border-border shimmer" />
            <div className="h-96 bg-white rounded-2xl border border-border shimmer" />
            <div className="h-96 bg-white rounded-2xl border border-border shimmer" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl sm:text-5xl text-text-main mb-4 font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
          The Collection
        </h1>
        <div className="w-16 h-0.5 bg-accent mx-auto mb-4" />
        <p className="text-xs text-text-muted font-semibold uppercase tracking-[0.25em] max-w-xl mx-auto">
          Explore Mumbai&apos;s finest premium cosmetics organized visually by category and brand
        </p>
      </div>

      {/* Centered Large & Cool Search Bar with Search Button */}
      <div className="max-w-2xl mx-auto mb-14">
        <div className="relative flex items-center bg-white rounded-2xl border-2 border-[#E8E2D9] focus-within:border-[#C88E75] focus-within:ring-4 focus-within:ring-[#C88E75]/10 shadow-[0_4px_20px_-4px_rgba(44,30,22,0.04)] hover:shadow-[0_8px_30px_rgba(44,30,22,0.08)] transition-all duration-300 overflow-hidden p-1.5">
          <Search size={22} className="text-accent ml-4 shrink-0" />
          <input
            type="text"
            placeholder="Search our premium collection (e.g. Lotus, Scrub, Serum)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-base sm:text-lg text-[#2C1E16] placeholder:text-[#6B5C52]/40 focus:outline-none focus:ring-0 px-3 py-2 font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="p-1.5 rounded-full hover:bg-[#FAF9F6] text-[#6B5C52] mr-2 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
          <button
            type="button"
            className="bg-[#2C1E16] hover:bg-[#C88E75] text-white text-xs sm:text-sm uppercase tracking-widest font-bold px-7 py-3 rounded-xl transition-all duration-300 cursor-pointer shrink-0 hover:shadow-md active:scale-95"
          >
            Search
          </button>
        </div>
      </div>

      {/* ================= SHOP BY CATEGORY (VISUAL BUTTONS WITH ICONS) ================= */}
      <div className="mb-10 pb-4 border-b border-[#E8E2D9]/60">
        <h2 className="text-xs font-bold text-[#2C1E16] uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
          <Layers size={14} className="text-accent" />
          Shop By Category
        </h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
          {allCategories.map(cat => {
            const isSelected = selectedCategories.includes(cat.slug);
            const icon = getCategoryIcon(cat.name);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.slug)}
                className={`flex items-center gap-3 px-5 py-3 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all duration-300 shrink-0 select-none cursor-pointer ${
                  isSelected 
                    ? 'bg-[#2C1E16] text-white border-[#2C1E16] shadow-md -translate-y-0.5 scale-105' 
                    : 'bg-white text-[#2C1E16] border-[#E8E2D9] hover:border-accent hover:-translate-y-0.5 hover:shadow-sm'
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span>{cat.name}</span>
                {isSelected && <Check size={12} className="ml-1 text-accent" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= SHOP BY BRAND (VISUAL LOGO BUTTONS) ================= */}
      <div className="mb-12 pb-6 border-b border-[#E8E2D9]/60">
        <h2 className="text-xs font-bold text-[#2C1E16] uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          Shop By Brand
        </h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
          {allBrands.map(b => {
            const isSelected = selectedBrands.includes(b.name);
            const initials = b.name.substring(0, 2).toUpperCase();
            return (
              <button
                key={b.id}
                onClick={() => toggleBrand(b.name)}
                className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all duration-300 shrink-0 cursor-pointer ${
                  isSelected 
                    ? 'scale-105 -translate-y-1' 
                    : 'hover:scale-105 hover:-translate-y-1'
                }`}
                style={{ width: '80px' }}
              >
                {/* Logo Circle */}
                <div className={`relative w-14 h-14 rounded-full flex items-center justify-center border-2 overflow-hidden shadow-sm transition-all bg-white ${
                  isSelected 
                    ? 'border-[#2C1E16] ring-2 ring-[#C88E75]/30' 
                    : 'border-[#E8E2D9] group-hover:border-[#C88E75]'
                }`}>
                  {b.logoUrl ? (
                    <Image
                      src={b.logoUrl}
                      alt={b.name}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#C88E75]/20 to-[#2C1E16]/10 flex items-center justify-center font-bold text-[#2C1E16] text-xs">
                      {initials}
                    </div>
                  )}
                </div>
                {/* Brand Name */}
                <span className={`text-[9px] font-bold uppercase tracking-wider text-center line-clamp-1 w-full ${
                  isSelected ? 'text-[#C88E75]' : 'text-[#6B5C52]'
                }`}>
                  {b.name}
                </span>
              </button>
            );
          })}
        </div>
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

            {/* Categories */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4">Category Types</h3>
              <div className="space-y-3">
                {allCategories.map(category => (
                  <label key={category.id} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.slug)}
                      onChange={() => toggleCategory(category.slug)}
                      className="sr-only"
                    />
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

            {/* Brands Checkboxes */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4">Brands</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar border-b border-border/40 pb-4">
                {allBrands.map(b => (
                  <label key={b.id} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b.name)}
                      onChange={() => toggleBrand(b.name)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${
                      selectedBrands.includes(b.name) 
                        ? 'bg-text-main border-text-main' 
                        : 'border-border group-hover:border-text-main'
                    }`}>
                      {selectedBrands.includes(b.name) && (
                        <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${selectedBrands.includes(b.name) ? 'text-text-main font-medium' : 'text-text-muted group-hover:text-text-main'}`}>
                      {b.name}
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

            {(selectedCategories.length > 0 || selectedBrands.length > 0 || searchQuery) && (
              <button 
                onClick={clearFilters}
                className="text-xs uppercase tracking-widest text-text-muted hover:text-text-main transition-colors border-b border-transparent hover:border-text-main"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Product Sections Grouped by Category */}
        <main className="lg:w-3/4 space-y-16">
          <div className="hidden lg:flex justify-between items-center mb-4 pb-4 border-b border-border">
            <span className="text-sm text-text-muted">{filteredProducts.length} Results</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {group.products.map((product) => {
                    const isOnSale = product.salePrice !== null;
                    const currentPrice = product.salePrice || product.price;

                    return (
                      <div key={product.id} className="product-card group cursor-pointer card-container flex flex-col h-full bg-white">
                        <Link href={`/products/${product.slug}`} className="block overflow-hidden rounded-t-2xl">
                          <div className="product-image-container h-[300px] sm:h-[350px] relative overflow-hidden">
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
                              <span className="text-[10px] font-bold text-accent tracking-widest uppercase block mb-1">
                                {product.brand}
                              </span>
                              <h3 className="font-display text-base text-text-main line-clamp-2 font-semibold">
                                <Link href={`/products/${product.slug}`} className="hover:text-accent transition-colors">
                                  {product.name}
                                </Link>
                              </h3>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-auto pt-4 border-t border-[#E8E2D9]/40">
                            <span className="text-sm font-semibold text-text-main">
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
                            className="w-full mt-5 btn-secondary rounded-xl py-2.5"
                          >
                            Add to Bag
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
