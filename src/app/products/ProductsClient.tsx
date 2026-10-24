'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ChevronDown, Filter, Sparkles, Layers, Check, X, Droplets, SprayCan, Package, Component } from 'lucide-react';
import { formatPrice, getDiscountPercent } from '@/lib/data';
import { ProductFilters } from '@/components/product/ProductFilters';
import { ProductGrid, getCategoryIcon } from '@/components/product/ProductGrid';
import { ProductQuickView } from '@/components/product/ProductQuickView';
import { useCartStore } from '@/lib/store';

interface ProductsClientProps {
  products: any[];
  allCategories: any[];
  allBrands: any[];
}

function ProductCatalogContent({ products, allCategories, allBrands }: ProductsClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const fallbackProductImage = '/images/products/facial-kit-1.png';

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  // Fix Next.js Hydration Mismatch
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounce search query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Compute suggestions (matching brands and products)
  const suggestions = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return { brands: [], products: [] };
    }
    const q = debouncedSearchQuery.toLowerCase().trim();

    const matchedBrands = allBrands
      .filter((b) => b.name.toLowerCase().includes(q))
      .slice(0, 4);

    const matchedProducts = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q))
      )
      .slice(0, 5);

    return { brands: matchedBrands, products: matchedProducts };
  }, [products, allBrands, debouncedSearchQuery]);

  // Handle search submission and smooth scroll to results
  const handleSearchSubmit = (term?: string) => {
    if (term !== undefined) {
      setSearchQuery(term);
    }
    setShowSuggestions(false);

    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Sync state when URL params change from navbar clicks
  useEffect(() => {
    if (categoryParam) {
      const catObj = allCategories.find(c => c.slug === categoryParam || c.id === categoryParam);
      const targetSlug = catObj ? catObj.slug : categoryParam;
      setSelectedCategories([targetSlug]);
    } else {
      setSelectedCategories([]);
    }

    if (searchParam) {
      setSearchQuery(searchParam);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      setSearchQuery('');
    }
  }, [categoryParam, searchParam, allCategories]);

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
        p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q)) || (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) || (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (selectedCategories.length > 0) {
      const selectedCategoryIds = allCategories
        .filter(c => selectedCategories.includes(c.slug) || selectedCategories.includes(c.id))
        .map(c => c.id);
      
      result = result.filter(p => selectedCategoryIds.includes(p.categoryId) || selectedCategories.includes(p.categoryId));
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

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-left">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl sm:text-5xl text-text-main mb-3 font-normal">
          The Collection
        </h1>
        <div className="w-12 h-px bg-accent/60 mx-auto mb-4" />
        <p className="text-xs text-text-muted font-medium uppercase tracking-[0.25em] max-w-xl mx-auto">
          Explore Mumbai&apos;s authentic salon-grade cosmetics organized by category and brand
        </p>
      </div>

      {/* Centered Search Bar with Autocomplete */}
      <div className="max-w-2xl mx-auto mb-14 relative" ref={searchContainerRef}>
        <div className="relative flex items-center bg-white rounded-2xl border border-border focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/10 shadow-xs hover:shadow-sm transition-all duration-300 p-1.5 z-20">
          <Search size={20} className="text-accent ml-4 shrink-0" />
          <input
            type="text"
            placeholder="Search our salon collection (e.g. Oxylife, Facial Kit, Serum)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (searchQuery.trim()) {
                setShowSuggestions(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit();
              } else if (e.key === 'Escape') {
                setShowSuggestions(false);
              }
            }}
            className="w-full bg-transparent border-none text-sm sm:text-base text-text-main placeholder:text-text-muted/50 focus:outline-none focus:ring-0 px-3 py-2 font-normal"
            suppressHydrationWarning
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowSuggestions(false);
              }}
              className="p-1.5 rounded-full hover:bg-secondary text-text-muted mr-2 transition-colors cursor-pointer"
              aria-label="Clear search"
              suppressHydrationWarning
            >
              <X size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSearchSubmit()}
            className="btn-primary text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl cursor-pointer shrink-0"
            suppressHydrationWarning
          >
            Search
          </button>
        </div>

        {/* Autocomplete / Suggestions Dropdown */}
        {showSuggestions && debouncedSearchQuery.trim() && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
            {suggestions.brands.length === 0 && suggestions.products.length === 0 ? (
              <div className="p-5 text-center text-sm text-text-muted">
                No suggestions found for &ldquo;<span className="font-semibold text-text-main">{debouncedSearchQuery}</span>&rdquo;
              </div>
            ) : (
              <div className="py-2">
                {/* Brand Suggestions */}
                {suggestions.brands.length > 0 && (
                  <div className="px-4 py-2 border-b border-border/60">
                    <div className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles size={12} />
                      <span>Brand Suggestions</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.brands.map((brand) => (
                        <button
                          key={brand.id || brand.name}
                          type="button"
                          onClick={() => handleSearchSubmit(brand.name)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 hover:bg-secondary border border-border text-xs font-medium text-text-main hover:text-accent transition-colors cursor-pointer"
                        >
                          <Search size={12} className="text-accent" />
                          <span>{brand.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Suggestions */}
                {suggestions.products.length > 0 && (
                  <div>
                    <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Product Suggestions
                    </div>
                    <div className="divide-y divide-border/40">
                      {suggestions.products.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleSearchSubmit(product.name)}
                          className="w-full text-left px-4 py-2.5 hover:bg-secondary/40 flex items-center gap-3 transition-colors group cursor-pointer"
                        >
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0 border border-border/50">
                            <Image
                              src={product.images?.[0] || fallbackProductImage}
                              alt={product.name}
                              fill
                              sizes="40px"
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-accent tracking-widest uppercase line-clamp-1">
                              {product.brand}
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-text-main group-hover:text-accent transition-colors line-clamp-1">
                              {product.name}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-semibold text-text-main">
                              {formatPrice(product.salePrice || product.price)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Bar: Press Enter to Search */}
                <div className="p-3 bg-secondary/30 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-text-muted">
                    Press <kbd className="px-1.5 py-0.5 bg-white border border-border rounded text-[11px] font-mono shadow-xs">Enter</kbd> to search
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Search all results &rarr;</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= SHOP BY CATEGORY (VISUAL BUTTONS WITH ICONS) ================= */}
      <div className="mb-10 pb-4 border-b border-border/60">
        <h2 className="text-xs font-bold text-text-main uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Layers size={14} className="text-accent" />
          Shop By Category
        </h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
          {allCategories.map(cat => {
            const isSelected = selectedCategories.includes(cat.slug);
            const icon = getCategoryIcon(cat.name);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.slug)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all duration-200 shrink-0 select-none cursor-pointer ${
                  isSelected 
                    ? 'bg-brand-dark text-white border-brand-dark shadow-xs' 
                    : 'bg-white text-text-main border-border hover:border-accent hover:text-accent'
                }`}
                suppressHydrationWarning
              >
                <span className="text-base">{icon}</span>
                <span>{cat.name}</span>
                {isSelected && <Check size={12} className="ml-1 text-accent" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= SHOP BY BRAND (VISUAL LOGO BUTTONS) ================= */}
      <div className="mb-12 pb-6 border-b border-border/60">
        <h2 className="text-xs font-bold text-text-main uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
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
                className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all duration-200 shrink-0 cursor-pointer ${
                  isSelected 
                    ? 'scale-105' 
                    : 'hover:scale-105'
                }`}
                style={{ width: '80px' }}
                suppressHydrationWarning
              >
                {/* Logo Circle */}
                <div className={`relative w-14 h-14 rounded-full flex items-center justify-center border overflow-hidden shadow-xs transition-all bg-white ${
                  isSelected 
                    ? 'border-accent ring-2 ring-accent/30' 
                    : 'border-border hover:border-accent'
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
                    <div className="w-full h-full bg-secondary flex items-center justify-center font-bold text-text-main text-xs">
                      {initials}
                    </div>
                  )}
                </div>
                {/* Brand Name */}
                <span className={`text-[9px] font-bold uppercase tracking-wider text-center line-clamp-1 w-full ${
                  isSelected ? 'text-accent' : 'text-text-muted'
                }`}>
                  {b.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout */}
      <div ref={resultsRef} className="flex flex-col lg:flex-row gap-12 scroll-mt-28">
        
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
        <ProductFilters
          allCategories={allCategories}
          allBrands={allBrands}
          selectedCategories={selectedCategories}
          selectedBrands={selectedBrands}
          selectedSkinTypes={selectedSkinTypes}
          selectedPriceRanges={selectedPriceRanges}
          searchQuery={searchQuery}
          sortBy={sortBy}
          mobileFiltersOpen={mobileFiltersOpen}
          toggleCategory={toggleCategory}
          toggleBrand={toggleBrand}
          toggleSkinType={toggleSkinType}
          togglePriceRange={togglePriceRange}
          setSortBy={setSortBy}
          clearFilters={clearFilters}
          setMobileFiltersOpen={setMobileFiltersOpen}
        />

        {/* Product Sections Grouped by Category */}
        <ProductGrid
          groupedProducts={groupedProducts}
          filteredProductsLength={filteredProducts.length}
          fallbackProductImage={fallbackProductImage}
          setQuickViewProduct={setQuickViewProduct}
          addItem={addItem}
          clearFilters={clearFilters}
        />
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickView 
          product={quickViewProduct} 
          fallbackProductImage={fallbackProductImage} 
          onClose={() => setQuickViewProduct(null)} 
          addItem={addItem} 
        />
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
