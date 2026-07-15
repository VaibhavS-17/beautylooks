'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Search, Heart, ShoppingBag, Menu, X, Truck, Shield, Sparkles, User, Loader2, ArrowRight } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

export default function Navbar({ categories = [] }: { categories?: { id: string, name: string, slug: string }[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [debouncedSearchVal, setDebouncedSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSearchSubmit = (term?: string) => {
    const query = term !== undefined ? term : searchVal;
    if (!query.trim()) return;
    setIsSearchOpen(false);
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchVal('');
    setSearchResults([]);
  };

  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const openCart = useCartStore((state) => state.openCart);
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();

    // Check initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      if (user) {
        useWishlistStore.getState().syncWithDB();
      }
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      if (session?.user && _event === 'SIGNED_IN') {
        useWishlistStore.getState().syncWithDB();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Shop All', href: '/products' },
    ...categories.slice(0, 2).map((c: { id: string, name: string, slug: string }) => ({ name: c.name, href: `/products?category=${c.slug}` })),
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  const perks = [
    { icon: Truck, label: 'Free Delivery' },
    { icon: Shield, label: '100% Genuine' },
    { icon: Sparkles, label: 'Expert Curated' },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[var(--color-text-main)] text-white text-center py-2 text-[10px] tracking-[0.2em] uppercase font-medium overflow-hidden">
        <div className="flex items-center justify-center gap-8">
          <span>• Free Delivery on Orders Above ₹499 •</span>
          <span className="hidden sm:inline">100% Authentic Products • Mumbai's Trusted Beauty Store</span>
        </div>
      </div>

      <nav
        className={`sticky top-0 sm:top-4 w-full max-w-[1920px] mx-auto z-40 transition-all duration-500 sm:px-6 lg:px-8 sm:mb-4 ${
          isScrolled ? 'translate-y-0 sm:translate-y-[-4px]' : ''
        }`}
      >
        <div className={`transition-all duration-500 sm:rounded-2xl border-b sm:border ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-white/60'
            : 'bg-[var(--color-primary)] shadow-sm border-[var(--color-border)]'
        }`}>
        {/* Main Navbar Row */}
        <div className="px-4 sm:px-6">
          <div className={`flex justify-between items-center relative transition-all duration-500 ${isScrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'}`}>

            {/* Left: Mobile Menu Button (Hamburger) */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors mr-4"
                aria-label="Open menu"
              >
                <Menu size={22} strokeWidth={1.5} />
              </button>
            </div>

            {/* Left: Desktop Logo */}
            <div className="hidden md:flex items-center flex-1">
              <Link href="/" className="flex items-center gap-3.5 group flex-shrink-0">
                {/* Logo Image (Properly scaled) */}
                <div className="relative h-12 w-12 rounded-full overflow-hidden border border-[var(--color-accent)]/30 shadow-sm shrink-0 bg-black transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-md">
                  <Image
                    src="/images/brand/logo.png"
                    alt="Beauty Looks Logo"
                    fill
                    sizes="48px"
                    className="object-contain p-0.5"
                    priority
                  />
                </div>
                {/* Brand Name Text */}
                <div className="transition-transform duration-500 group-hover:translate-x-1 flex flex-col justify-center">
                  <div className="text-[var(--color-text-main)] font-semibold text-xl leading-none tracking-wide font-display mb-1 transition-colors duration-300 group-hover:text-[var(--color-accent)]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Beauty Looks
                  </div>
                  <div className="text-[9px] text-[var(--color-accent)] tracking-[0.3em] uppercase font-bold opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                    Premium Cosmetics
                  </div>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Nav Links */}
            <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center gap-6 lg:gap-10">
              {navLinks.map((link) => {
                const [linkPath, linkQuery] = link.href.split('?');
                const isActive = pathname === linkPath && (
                  !linkQuery 
                    ? !searchParams.get('category') 
                    : searchParams.get('category') === new URLSearchParams(linkQuery).get('category')
                );
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative text-[11px] tracking-[0.15em] uppercase font-semibold transition-all duration-300 group px-2 py-1 ${
                      isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-main)] hover:text-[var(--color-accent)] hover:-translate-y-0.5'
                    }`}
                  >
                    {link.name}
                    <span className={`absolute -bottom-0.5 left-0 h-px bg-[var(--color-accent)] transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                  </Link>
                );
              })}
            </div>

            {/* Logo Section for Mobile Layout (Centered & Circle cropped logo + Premium brand text beside it) */}
            <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 flex md:hidden items-center gap-2 group flex-shrink-0">
              <div className="relative h-8 w-8 rounded-full overflow-hidden border border-[var(--color-accent)]/20 shadow-sm shrink-0 bg-white p-0.5">
                <Image
                  src="/images/brand/logo.png"
                  alt="Beauty Looks Logo"
                  fill
                  sizes="32px"
                  className="object-cover rounded-full"
                  priority
                />
              </div>
              <span className="text-[14px] font-semibold tracking-wider font-display text-[var(--color-text-main)] uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
                Beauty Looks
              </span>
            </Link>

            {/* Right Icons */}
            <div className="flex items-center justify-end gap-3 sm:gap-4 flex-1">
              {/* Search Toggle (Visible on both mobile and desktop) */}
              <button
                suppressHydrationWarning
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors p-2 rounded-full hover:bg-[var(--color-secondary)]/50"
                aria-label="Search"
              >
                <Search size={19} strokeWidth={1.5} />
              </button>

              {/* Wishlist (Desktop only) */}
              <Link href="/wishlist" className="relative text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors hidden md:block">
                <Heart size={19} strokeWidth={1.5} />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[var(--color-accent)] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart (Desktop only) */}
              <button
                suppressHydrationWarning
                onClick={openCart}
                className="relative text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors hidden md:block"
                aria-label="Cart"
              >
                <ShoppingBag size={19} strokeWidth={1.5} />
                {mounted && cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[var(--color-text-main)] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {/* Account (Desktop only) */}
              <Link
                href={isLoggedIn ? '/account' : '/login'}
                className="text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors hidden md:block"
                title={isLoggedIn ? 'My Account' : 'Sign In'}
                aria-label="Account"
              >
                <User size={19} strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (Visible only on mobile) */}
        <div className="md:hidden px-4 pb-3">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="w-full relative flex items-center bg-white border border-[var(--color-border)] rounded-lg pl-3 pr-4 py-2.5 text-sm text-[var(--color-text-muted)] focus:outline-none shadow-sm"
          >
            <Search size={16} className="text-[var(--color-text-muted)] mr-2" />
            <span className="font-light">Search products, brands...</span>
          </button>
        </div>
        {/* Perks Bar — fills the empty space near logo on wider screens */}
        <div className="hidden lg:block border-t border-[var(--color-border)] bg-[var(--color-secondary)]/50 rounded-b-2xl">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-12 py-2">
              {perks.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] tracking-[0.12em] uppercase font-semibold">
                  <Icon size={12} className="text-[var(--color-accent)]" strokeWidth={2} />
                  <span>{label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] tracking-[0.12em] uppercase font-semibold">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span>WhatsApp Support · 8879655807</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Screen Search Overlay */}
        <div 
          className={`fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-32 transition-all duration-500 ease-in-out ${
            isSearchOpen 
              ? 'opacity-100 pointer-events-auto bg-white/80 backdrop-blur-xl' 
              : 'opacity-0 pointer-events-none bg-white/0 backdrop-blur-none'
          }`}
        >
          <div className="absolute inset-0" onClick={closeSearch} />
          <div 
            className={`w-full max-w-3xl mx-4 relative bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden transition-all duration-500 delay-100 ${
              isSearchOpen ? 'transform translate-y-0 scale-100' : 'transform -translate-y-8 scale-95'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center p-4 sm:p-6 border-b border-[var(--color-border)]">
              <Search size={24} className="text-[var(--color-text-muted)] shrink-0" />
              <input
                suppressHydrationWarning
                type="text"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="Search for premium cosmetics, brands..."
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-lg sm:text-2xl px-4 text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]/40 font-light"
                autoFocus={isSearchOpen}
              />
              <button 
                suppressHydrationWarning
                onClick={closeSearch}
                className="p-2 bg-[var(--color-secondary)] hover:bg-[var(--color-border)] rounded-full transition-colors shrink-0"
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
                        className="px-4 py-2 bg-white border border-[var(--color-border)] rounded-full text-xs font-medium text-[var(--color-text-main)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
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
                        className="px-3 py-1.5 bg-white border border-[var(--color-border)] rounded-full text-xs text-[var(--color-text-main)] hover:border-[var(--color-accent)] transition-colors"
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
                        onClick={closeSearch}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white transition-all duration-200 group border border-transparent hover:border-[var(--color-border)] hover:shadow-sm"
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
                      className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] hover:text-[var(--color-text-main)] flex items-center gap-1.5 transition-colors"
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
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) md:hidden`}
      >
        <div
          className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col border-r border-[var(--color-border)]">
          <div className="px-6 py-6 flex justify-between items-center border-b border-[var(--color-border)]">
            <Link href="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="relative h-9 w-9 overflow-hidden">
                <Image
                  src="/images/brand/logo.png"
                  alt="Beauty Looks Mumbai"
                  fill
                  sizes="36px"
                  className="object-contain"
                />
              </div>
              <div>
                <div className="text-[var(--color-text-main)] font-semibold text-sm font-display mb-0.5" style={{ fontFamily: 'Playfair Display, serif' }}>Beauty Looks</div>
                <div className="text-[8px] text-[var(--color-accent)] tracking-[0.15em] uppercase font-semibold">Premium Cosmetics</div>
              </div>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors p-2 bg-[var(--color-primary)] rounded-full"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-8 px-6 space-y-2">
            {navLinks.map((link, index) => (
              <div
                key={link.name}
                className="transform transition-all duration-500"
                style={{
                  opacity: isMobileMenuOpen ? 1 : 0,
                  transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                  transitionDelay: `${index * 60}ms`
                }}
              >
                <Link
                  href={link.href}
                  className="flex items-center justify-between py-3.5 px-4 rounded-xl hover:bg-[var(--color-primary)] text-[12px] tracking-[0.12em] uppercase font-semibold text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-all group"
                >
                  <span>{link.name}</span>
                  <span className="text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              </div>
            ))}

            <div
              className="pt-6 mt-6 border-t border-[var(--color-border)] space-y-3"
              style={{
                opacity: isMobileMenuOpen ? 1 : 0,
                transitionDelay: `${navLinks.length * 60}ms`,
                transitionDuration: '500ms',
                transition: 'opacity 500ms'
              }}
            >
              {/* Removed redundant links that are now in MobileBottomNav */}
            </div>
          </div>

          <div className="p-5 bg-[var(--color-primary)] border-t border-[var(--color-border)]">
            <p className="text-[10px] tracking-[0.15em] text-[var(--color-text-muted)] text-center uppercase">
              Need help?{' '}
              <a href="tel:+918879655807" className="text-[var(--color-accent)] hover:text-[var(--color-text-main)] transition-colors font-semibold">
                8879655807
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
