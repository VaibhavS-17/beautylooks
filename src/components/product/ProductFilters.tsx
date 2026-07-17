'use client';

import React from 'react';
import { X, ChevronDown } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
}

interface ProductFiltersProps {
  allCategories: Category[];
  allBrands: Brand[];
  selectedCategories: string[];
  selectedBrands: string[];
  selectedSkinTypes: string[];
  selectedPriceRanges: string[];
  searchQuery: string;
  sortBy: string;
  mobileFiltersOpen: boolean;
  toggleCategory: (slug: string) => void;
  toggleBrand: (name: string) => void;
  toggleSkinType: (type: string) => void;
  togglePriceRange: (range: string) => void;
  setSortBy: (val: string) => void;
  clearFilters: () => void;
  setMobileFiltersOpen: (val: boolean) => void;
}

export function ProductFilters({
  allCategories,
  allBrands,
  selectedCategories,
  selectedBrands,
  selectedSkinTypes,
  selectedPriceRanges,
  searchQuery,
  sortBy,
  mobileFiltersOpen,
  toggleCategory,
  toggleBrand,
  toggleSkinType,
  togglePriceRange,
  setSortBy,
  clearFilters,
  setMobileFiltersOpen
}: ProductFiltersProps) {
  const hasFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || selectedSkinTypes.length > 0 || selectedPriceRanges.length > 0 || searchQuery;

  return (
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

        {hasFilters && (
          <button 
            onClick={clearFilters}
            className="text-xs uppercase tracking-widest text-text-muted hover:text-text-main transition-colors border-b border-transparent hover:border-text-main"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </aside>
  );
}
