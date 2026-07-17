'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
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
      const catObj = allCategories.find(c => c.slug === categoryParam || c.id === categoryParam);
      const targetSlug = catObj ? catObj.slug : categoryParam;
      setSelectedCategories([targetSlug]);
    } else {
      setSelectedCategories([]);
    }

    if (searchParam) {
      setSearchQuery(searchParam);
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
