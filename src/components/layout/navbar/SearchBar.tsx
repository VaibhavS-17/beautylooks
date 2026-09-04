'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResultsState {
  brands: any[];
  products: any[];
}

export default function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState('');
  const [debouncedSearchVal, setDebouncedSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultsState>({ brands: [], products: [] });
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchVal(searchVal);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchVal]);

  useEffect(() => {
    const term = debouncedSearchVal.trim();
    if (!term) {
      setSearchResults({ brands: [], products: [] });
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    setIsSearching(true);

    const fetchSearchResults = async () => {
      try {
        const supabase = createClient();

        // 1. Search brands with ilike
        const { data: brands } = await supabase
          .from('brands')
          .select('id, name, slug, logo_url')
          .ilike('name', `%${term}%`)
          .limit(4);

        const brandIds = brands?.map((b: any) => b.id) || [];

        // 2. Search products matching name, description, or matched brand
        let productQuery = supabase
          .from('products')
          .select('id, name, slug, price, sale_price, images, brand_id, brands(name)')
          .eq('is_active', true);

        if (brandIds.length > 0) {
          productQuery = productQuery.or(
            `name.ilike.%${term}%,description.ilike.%${term}%,brand_id.in.(${brandIds.join(',')})`
          );
        } else {
          productQuery = productQuery.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
        }

        const { data: products, error } = await productQuery.limit(8);

        if (isMounted) {
          if (!error && (products || brands)) {
            setSearchResults({
              brands: brands || [],
              products: (products || []).map((p: any) => ({
                ...p,
                brand: p.brands?.name || 'Beauty Looks',
              })),
            });
          } else {
            setSearchResults({ brands: [], products: [] });
          }
          setIsSearching(false);
        }
      } catch {
        if (isMounted) {
          setSearchResults({ brands: [], products: [] });
          setIsSearching(false);
        }
      }
    };

    fetchSearchResults();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearchVal]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus input when opened
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
      setSearchVal('');
      setSearchResults({ brands: [], products: [] });
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (!searchContainerRef.current) return;
    
    const focusableElements = searchContainerRef.current.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  const handleSearchSubmit = (term?: string) => {
    const query = term !== undefined ? term : searchVal;
    if (!query.trim()) return;
    onClose();
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  const trendingSearches = [
    'Oxylife',
    'Raaga Professional',
    'Bleach',
    'Facial Kit',
    'Brazilian Hairtech',
    'Keratin',
  ];

  const hasResults = searchResults.brands.length > 0 || searchResults.products.length > 0;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-32 transition-all duration-500 ease-in-out ${
        isOpen 
          ? 'opacity-100 pointer-events-auto bg-white/80 backdrop-blur-xl' 
          : 'opacity-0 pointer-events-none bg-white/0 backdrop-blur-none'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div 
        ref={searchContainerRef}
        className={`w-full max-w-3xl mx-4 relative bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden transition-all duration-500 delay-100 ${
          isOpen ? 'transform translate-y-0 scale-100' : 'transform -translate-y-8 scale-95'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center p-3 sm:p-5 border-b border-[var(--color-border)] gap-2">
          <label htmlFor="search-input" className="sr-only">Search products</label>
          <Search size={22} className="text-accent shrink-0 ml-2" aria-hidden="true" />
          <input
            id="search-input"
            ref={inputRef}
            suppressHydrationWarning
            type="text"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
            placeholder="Search for premium cosmetics, brands (e.g. Oxylife, Raaga)..."
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-base sm:text-xl px-3 text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]/40 font-light"
          />
          {searchVal && (
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => {
                setSearchVal('');
                setSearchResults({ brands: [], products: [] });
              }}
              className="p-1.5 hover:bg-[var(--color-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] rounded-full transition-colors cursor-pointer shrink-0"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => handleSearchSubmit()}
            className="bg-[#2C1E16] hover:bg-[#C88E75] text-white text-xs sm:text-sm uppercase tracking-widest font-bold px-5 sm:px-6 py-2.5 rounded-xl transition-all duration-300 cursor-pointer shrink-0 hover:shadow-md active:scale-95"
          >
            Search
          </button>
          <button 
            suppressHydrationWarning
            onClick={onClose}
            className="p-2 bg-[var(--color-secondary)] hover:bg-[var(--color-border)] rounded-full transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ml-1"
            aria-label="Close search"
          >
            <X size={20} className="text-[var(--color-text-main)]" />
          </button>
        </div>

        {/* Quick Suggestions or Live Search Results */}
        <div className="p-6 sm:p-8 bg-[var(--color-primary)]">
          {!debouncedSearchVal.trim() ? (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-4">Trending Searches</div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map(term => (
                  <button
                    suppressHydrationWarning
                    key={term}
                    type="button"
                    onClick={() => handleSearchSubmit(term)}
                    className="px-4 py-2 bg-white border border-[var(--color-border)] rounded-full text-xs font-medium text-[var(--color-text-main)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : isSearching ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 size={28} className="animate-spin text-[var(--color-accent)] mb-3" />
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                Searching for &ldquo;{debouncedSearchVal}&rdquo;...
              </p>
            </div>
          ) : !hasResults ? (
            <div className="py-12 text-center animate-fade-in">
              <p className="text-[var(--color-text-main)] font-display text-lg mb-1">
                No products found matching &ldquo;{debouncedSearchVal}&rdquo;
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mb-6">
                Try searching for a brand name like &ldquo;Oxylife&rdquo; or category like &ldquo;Bleach&rdquo;.
              </p>
              <div className="flex justify-center flex-wrap gap-2">
                {trendingSearches.slice(0, 4).map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSearchSubmit(term)}
                    className="px-3 py-1.5 bg-white border border-[var(--color-border)] rounded-full text-xs text-[var(--color-text-main)] hover:border-[var(--color-accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Brand Suggestions */}
              {searchResults.brands.length > 0 && (
                <div className="pb-3 border-b border-[var(--color-border)]">
                  <div className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles size={12} />
                    <span>Brand Suggestions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchResults.brands.map((brand: any) => (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => handleSearchSubmit(brand.name)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-[var(--color-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-xs font-semibold text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
                      >
                        <Search size={12} className="text-accent" />
                        <span>{brand.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Suggestions */}
              {searchResults.products.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-3 flex items-center justify-between">
                    <span>Products Matching &ldquo;{debouncedSearchVal}&rdquo;</span>
                    <span className="text-[9px] bg-[var(--color-secondary)] px-2.5 py-0.5 rounded-full font-semibold">
                      {searchResults.products.length} {searchResults.products.length === 1 ? 'Result' : 'Results'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                    {searchResults.products.map((product: any) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white transition-all duration-200 group border border-transparent hover:border-[var(--color-border)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[var(--color-secondary)] shrink-0 border border-[var(--color-border)]/50">
                          <Image
                            src={product.images?.[0] || '/images/products/facial-kit-1.png'}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold text-[var(--color-accent)] uppercase tracking-wider block truncate">
                            {product.brand}
                          </span>
                          <h4 className="font-display text-xs sm:text-sm text-[var(--color-text-main)] font-semibold truncate group-hover:text-[var(--color-accent)] transition-colors">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-[var(--color-text-main)]">
                              ₹{(product.sale_price || product.price)?.toLocaleString('en-IN')}
                            </span>
                            {product.sale_price && (
                              <span className="text-[10px] text-[var(--color-text-muted)] line-through">
                                ₹{product.price?.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-muted)] hidden sm:inline">
                  Press <kbd className="px-1.5 py-0.5 bg-white border border-[var(--color-border)] rounded text-[11px] font-mono">Enter</kbd> to search
                </span>
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] hover:text-[var(--color-text-main)] flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm ml-auto cursor-pointer"
                >
                  <span>View all matching products</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
