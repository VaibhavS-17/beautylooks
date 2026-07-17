'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState('');
  const [debouncedSearchVal, setDebouncedSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
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
    if (!debouncedSearchVal.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    setIsSearching(true);

    const fetchSearchResults = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, price, sale_price, images, brand, categories(name)')
        .eq('is_active', true)
        .textSearch('name', debouncedSearchVal, { type: 'websearch' })
        .limit(6);

      if (isMounted) {
        if (!error && data) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
        setIsSearching(false);
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
      setSearchResults([]);
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
        <div className="flex items-center p-4 sm:p-6 border-b border-[var(--color-border)]">
          <label htmlFor="search-input" className="sr-only">Search products</label>
          <Search size={24} className="text-[var(--color-text-muted)] shrink-0" aria-hidden="true" />
          <input
            id="search-input"
            ref={inputRef}
            suppressHydrationWarning
            type="text"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
            placeholder="Search for premium cosmetics, brands..."
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-lg sm:text-2xl px-4 text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]/40 font-light"
          />
          <button 
            suppressHydrationWarning
            onClick={onClose}
            className="p-2 bg-[var(--color-secondary)] hover:bg-[var(--color-border)] rounded-full transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                {['Vitamin C Serum', 'Hydrating Primer', 'Matte Lipstick', 'Sunscreen SPF 50', 'Lotus', 'Face Scrub'].map(term => (
                  <button
                    suppressHydrationWarning
                    key={term}
                    type="button"
                    onClick={() => handleSearchSubmit(term)}
                    className="px-4 py-2 bg-white border border-[var(--color-border)] rounded-full text-xs font-medium text-[var(--color-text-main)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center animate-fade-in">
              <p className="text-[var(--color-text-main)] font-display text-lg mb-1">
                No products found matching &ldquo;{debouncedSearchVal}&rdquo;
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mb-6">
                Try searching for a brand name like &ldquo;Lotus&rdquo; or category like &ldquo;Serum&rdquo;.
              </p>
              <div className="flex justify-center gap-2">
                {['Vitamin C Serum', 'Lotus', 'Matte Lipstick'].map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSearchSubmit(term)}
                    className="px-3 py-1.5 bg-white border border-[var(--color-border)] rounded-full text-xs text-[var(--color-text-main)] hover:border-[var(--color-accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-3 flex items-center justify-between">
                <span>Products Matching &ldquo;{debouncedSearchVal}&rdquo;</span>
                <span className="text-[9px] bg-[var(--color-secondary)] px-2.5 py-0.5 rounded-full font-semibold">
                  {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
                {searchResults.map(product => (
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
              <div className="pt-4 border-t border-[var(--color-border)] flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] hover:text-[var(--color-text-main)] flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
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
