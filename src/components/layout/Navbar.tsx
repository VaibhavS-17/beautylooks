'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { Search, Heart, ShoppingBag, Menu, X, Truck, Shield, Sparkles, User } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

export default function Navbar({ categories = [] }: { categories?: { id: string, name: string, slug: string }[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const openCart = useCartStore((state) => state.openCart);
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Check initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
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
        className={`sticky top-4 w-full max-w-[1920px] mx-auto z-40 transition-all duration-500 px-4 sm:px-6 lg:px-8 mb-4 ${
          isScrolled ? 'translate-y-[-4px]' : ''
        }`}
      >
        <div className={`transition-all duration-500 rounded-2xl border ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-white/60'
            : 'bg-[var(--color-primary)]/95 backdrop-blur-md shadow-sm border-[var(--color-border)]'
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
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors p-2 rounded-full hover:bg-[var(--color-secondary)]/50"
                aria-label="Search"
              >
                <Search size={19} strokeWidth={1.5} />
              </button>

              {/* Wishlist (Desktop only) */}
              <Link href="/wishlist" className="relative text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors hidden md:block">
                <Heart size={19} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[var(--color-accent)] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart (Desktop only) */}
              <button
                onClick={openCart}
                className="relative text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors hidden md:block"
                aria-label="Cart"
              >
                <ShoppingBag size={19} strokeWidth={1.5} />
                {cartItemsCount > 0 && (
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

        {/* Search Bar — slides down */}
        <div className={`overflow-hidden transition-all duration-300 ${isSearchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-t border-[var(--color-border)] bg-white px-4 sm:px-8 py-3">
            <div className="max-w-lg mx-auto relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search for products, brands..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-accent)] bg-[var(--color-primary)] text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]/50"
                autoFocus={isSearchOpen}
              />
            </div>
          </div>
        </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-500 ease-in-out md:hidden`}
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
