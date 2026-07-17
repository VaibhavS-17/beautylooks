'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Heart, ShoppingBag, Menu, Truck, Shield, Sparkles, User } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

import NavLinks from './navbar/NavLinks';
import MobileDrawer from './navbar/MobileDrawer';
import SearchBar from './navbar/SearchBar';

export default function Navbar({ categories = [] }: { categories?: { id: string, name: string, slug: string }[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

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
      <div className="bg-[var(--color-text-main)] text-[var(--color-primary)] text-center py-2 text-[10px] tracking-[0.2em] uppercase font-medium overflow-hidden">
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
            ? 'bg-white/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-[var(--color-border)]'
            : 'bg-[var(--color-primary)] shadow-sm border-[var(--color-border)]'
        }`}>
          {/* Main Navbar Row */}
          <div className="px-4 sm:px-6">
            <div className={`flex justify-between items-center relative transition-all duration-500 ${isScrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'}`}>

              {/* Left: Mobile Menu Button (Hamburger) */}
              <div className="flex items-center md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors mr-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                  aria-label="Open menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <Menu size={22} strokeWidth={1.5} />
                </button>
              </div>

              {/* Left: Desktop Logo */}
              <div className="hidden md:flex items-center flex-1">
                <Link href="/" className="flex items-center gap-3.5 group flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
                  {/* Logo Image */}
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
                    <div className="text-[var(--color-text-main)] font-semibold text-xl leading-none tracking-wide font-display mb-1 transition-colors duration-300 group-hover:text-[var(--color-accent)]">
                      Beauty Looks
                    </div>
                    <div className="text-[9px] text-[var(--color-accent)] tracking-[0.3em] uppercase font-bold opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                      Premium Cosmetics
                    </div>
                  </div>
                </Link>
              </div>

              {/* Center: Desktop Nav Links */}
              <NavLinks links={navLinks} />

              {/* Logo Section for Mobile Layout */}
              <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 flex md:hidden items-center gap-2 group flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
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
                <span className="text-[14px] font-semibold tracking-wider font-display text-[var(--color-text-main)] uppercase">
                  Beauty Looks
                </span>
              </Link>

              {/* Right Icons */}
              <div className="flex items-center justify-end gap-3 sm:gap-4 flex-1">
                {/* Search Toggle */}
                <button
                  suppressHydrationWarning
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors p-2 rounded-full hover:bg-[var(--color-secondary)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="Open search"
                >
                  <Search size={19} strokeWidth={1.5} />
                </button>

                {/* Wishlist */}
                <Link href="/wishlist" className="relative text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors hidden md:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full p-2" aria-label={`Wishlist, ${wishlistCount} items`}>
                  <Heart size={19} strokeWidth={1.5} />
                  {mounted && wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[var(--color-accent)] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <button
                  suppressHydrationWarning
                  onClick={openCart}
                  className="relative text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors hidden md:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full p-2"
                  aria-label={`Cart, ${cartItemsCount} items`}
                >
                  <ShoppingBag size={19} strokeWidth={1.5} />
                  {mounted && cartItemsCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[var(--color-text-main)] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                      {cartItemsCount}
                    </span>
                  )}
                </button>

                {/* Account */}
                <Link
                  href={isLoggedIn ? '/account' : '/login'}
                  className="text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-colors hidden md:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full p-2"
                  title={isLoggedIn ? 'My Account' : 'Sign In'}
                  aria-label={isLoggedIn ? 'My Account' : 'Sign In'}
                >
                  <User size={19} strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </div>


          {/* Perks Bar */}
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

          <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </div>
      </nav>

      <MobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} links={navLinks} />
    </>
  );
}
