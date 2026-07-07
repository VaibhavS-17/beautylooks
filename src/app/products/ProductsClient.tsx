'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ChevronDown, Filter, Sparkles, Layers, Check, X, Droplets, SprayCan, Package, Component } from 'lucide-react';
import { formatPrice, getDiscountPercent } from '@/lib/data';
import { useCartStore } from '@/lib/store';

// Dynamic category icons helper
const getCategoryIcon = (categoryName: string, size = 16) => {
  const name = categoryName.toLowerCase();
  if (name.includes('facial') || name.includes('kit')) return <Package size={size} className="text-[var(--color-accent)]" />;
  if (name.includes('serum') || name.includes('oil')) return <Droplets size={size} className="text-[var(--color-accent)]" />;
  if (name.includes('cleanser') || name.includes('wash')) return <SprayCan size={size} className="text-[var(--color-accent)]" />;
  if (name.includes('mask') || name.includes('pack')) return <Component size={size} className="text-[var(--color-accent)]" />;
  if (name.includes('shampoo') || name.includes('conditioner')) return <Droplets size={size} className="text-[var(--color-accent)]" />;
  return <Sparkles size={size} className="text-[var(--color-accent)]" />; // default beauty sparkle icon
};

interface ProductsClientProps {
  products: any[];
  allCategories: any[];
  allBrands: any[];
}

function ProductCatalogContent({ products, allCategories, allBrands }: ProductsClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const fallbackProductImage = '/images/products/facial-kit-1.png';

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  // Fix Next.js Hydration Mismatch
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setTimeout(() => setIsMounted(true), 0);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  // Debounce search query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const toggleSkinType = (type: string) => {
    setSelectedSkinTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const togglePriceRange = (range: string) => {
    setSelectedPriceRanges(prev =>
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedSkinTypes([]);
    setSelectedPriceRanges([]);
    setSearchQuery('');
  };

  // Filter and sort products
  // Price range helper
  const matchesPriceRange = (effectivePrice: number, range: string): boolean => {
    switch (range) {
      case 'under-499': return effectivePrice < 499;
      case '499-999': return effectivePrice >= 499 && effectivePrice <= 999;
      case '1000-1999': return effectivePrice >= 1000 && effectivePrice <= 1999;
      case 'over-2000': return effectivePrice > 2000;
      default: return true;
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.toLowerCase();
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

    if (selectedSkinTypes.length > 0) {
      result = result.filter(p =>
        p.skinType === 'all' || selectedSkinTypes.includes(p.skinType)
      );
    }

    if (selectedPriceRanges.length > 0) {
      result = result.filter(p => {
        const effectivePrice = p.salePrice || p.price;
        return selectedPriceRanges.some(range => matchesPriceRange(effectivePrice, range));
      });
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
  }, [products, debouncedSearchQuery, selectedCategories, selectedBrands, selectedSkinTypes, selectedPriceRanges, allCategories, sortBy]);

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

  // No skeleton loader

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-left">
      
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
                      sizes="80px"
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
        <aside 
          className={`fixed inset-y-0 left-0 z-50 w-full sm:w-80 bg-primary shadow-2xl transform transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 lg:z-auto lg:w-1/4 lg:bg-transparent lg:shadow-none lg:block ${
            mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 hidden lg:block'
          }`}
        >
          {/* Mobile Overlay */}
          {mobileFiltersOpen && (
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm -z-10 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
          )}

          <div className="h-full overflow-y-auto p-6 lg:p-0 lg:sticky lg:top-28 space-y-10 lg:h-auto lg:overflow-visible">
            <div className="flex justify-between items-center lg:hidden mb-6">
              <h2 className="font-display text-2xl font-semibold">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-2 bg-secondary rounded-full">
                <X size={20} />
              </button>
            </div>

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

            {/* Skin Type */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4">Skin Type</h3>
              <div className="space-y-3">
                {[
                  { label: 'Oily', value: 'oily' },
                  { label: 'Dry', value: 'dry' },
                  { label: 'Combination', value: 'combination' },
                  { label: 'Sensitive', value: 'sensitive' },
                ].map(st => (
                  <label key={st.value} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedSkinTypes.includes(st.value)}
                      onChange={() => toggleSkinType(st.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${
                      selectedSkinTypes.includes(st.value) 
                        ? 'bg-text-main border-text-main' 
                        : 'border-border group-hover:border-text-main'
                    }`}>
                      {selectedSkinTypes.includes(st.value) && (
                        <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${selectedSkinTypes.includes(st.value) ? 'text-text-main font-medium' : 'text-text-muted group-hover:text-text-main'}`}>
                      {st.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4">Price Range</h3>
              <div className="space-y-3">
                {[
                  { label: 'Under ₹499', value: 'under-499' },
                  { label: '₹499 - ₹999', value: '499-999' },
                  { label: '₹1,000 - ₹1,999', value: '1000-1999' },
                  { label: 'Over ₹2,000', value: 'over-2000' },
                ].map(pr => (
                  <label key={pr.value} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedPriceRanges.includes(pr.value)}
                      onChange={() => togglePriceRange(pr.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${
                      selectedPriceRanges.includes(pr.value) 
                        ? 'bg-text-main border-text-main' 
                        : 'border-border group-hover:border-text-main'
                    }`}>
                      {selectedPriceRanges.includes(pr.value) && (
                        <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${selectedPriceRanges.includes(pr.value) ? 'text-text-main font-medium' : 'text-text-muted group-hover:text-text-main'}`}>
                      {pr.label}
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

            {(selectedCategories.length > 0 || selectedBrands.length > 0 || selectedSkinTypes.length > 0 || selectedPriceRanges.length > 0 || searchQuery) && (
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
                  {group.products.map((product, index) => {
                    const isOnSale = product.salePrice !== null;
                    const currentPrice = product.salePrice || product.price;

                    return (
                      <div key={product.id} className="product-card group cursor-pointer flex flex-col h-full transition-all duration-500 bg-transparent">
                        <Link href={`/products/${product.slug}`} className="block overflow-hidden">
                          <div className="product-image-container h-[300px] sm:h-[400px] relative overflow-hidden bg-[#FAFAF9]">
                            <Image
                              src={product.images?.[0] || fallbackProductImage}
                              alt={product.name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover product-image transition-transform duration-700 group-hover:scale-105"
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
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                              <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(product); }}
                                className="bg-white text-text-main text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-black hover:text-white transition-colors"
                              >
                                Quick View
                              </button>
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
                          
                           <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[#E8E2D9]/40 flex-wrap">
                            <span className="text-sm font-semibold text-text-main">
                              {formatPrice(currentPrice)}
                            </span>
                            {isOnSale && (
                              <>
                                <span className="text-xs text-text-muted line-through">
                                  {formatPrice(product.price)}
                                </span>
                                <span className="bg-[#2C1E16] text-[#FAF9F6] text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded">
                                  {getDiscountPercent(product.price, product.salePrice!)}% OFF
                                </span>
                              </>
                            )}
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              addItem(product, 1);
                            }}
                            disabled={product.stockQuantity === 0}
                            className={`w-full mt-5 px-4 py-3 text-xs font-semibold uppercase tracking-widest transition-all ${
                              product.stockQuantity > 0
                                ? 'bg-black text-white hover:bg-black/90'
                                : 'bg-border text-text-muted cursor-not-allowed'
                            }`}
                          >
                            {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
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

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setQuickViewProduct(null)} />
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            <button 
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
            >
              <X size={20} className="text-text-main" />
            </button>
            <div className="w-full md:w-1/2 relative bg-secondary min-h-[300px] md:min-h-full">
              <Image 
                src={quickViewProduct.images?.[0] || fallbackProductImage} 
                alt={quickViewProduct.name} 
                fill 
                className="object-cover"
              />
            </div>
            <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto">
              <span className="text-[10px] font-bold text-accent tracking-widest uppercase block mb-2">
                {quickViewProduct.brand}
              </span>
              <h2 className="font-display text-2xl md:text-3xl text-text-main font-semibold mb-4">
                {quickViewProduct.name}
              </h2>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xl font-semibold text-text-main">
                  {formatPrice(quickViewProduct.salePrice || quickViewProduct.price)}
                </span>
                {quickViewProduct.salePrice && (
                  <span className="text-sm text-text-muted line-through">
                    {formatPrice(quickViewProduct.price)}
                  </span>
                )}
              </div>
              <p className="text-sm text-text-muted leading-relaxed mb-8 line-clamp-4">
                {quickViewProduct.description}
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    addItem(quickViewProduct, 1);
                    setQuickViewProduct(null);
                  }}
                  disabled={quickViewProduct.stockQuantity === 0}
                  className={`w-full py-4 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all ${
                    quickViewProduct.stockQuantity > 0
                      ? 'bg-brand-dark text-primary hover:bg-accent hover:text-brand-dark'
                      : 'bg-border text-text-muted cursor-not-allowed'
                  }`}
                >
                  {quickViewProduct.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <Link 
                  href={`/products/${quickViewProduct.slug}`}
                  className="w-full text-center py-4 text-xs font-semibold uppercase tracking-widest text-text-main hover:text-accent transition-colors"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductCatalog({ products, allCategories, allBrands }: ProductsClientProps) {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-pulse w-8 h-8 border-2 border-text-main border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductCatalogContent products={products} allCategories={allCategories} allBrands={allBrands} />
    </Suspense>
  );
}
