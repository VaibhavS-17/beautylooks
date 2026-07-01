'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Heart, ShoppingBag, Menu, X, Truck, Shield, Sparkles, User } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/lib/store';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const pathname = usePathname();

  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const openCart = useCartStore((state) => state.openCart);
  const wishlistCount = useWishlistStore((state) => state.items.length);

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
    { name: 'Facial Kits', href: '/products?category=facial-kits' },
    { name: 'Skincare', href: '/products?category=serums-oils' },
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
      <div className="bg-[#2C1E16] text-white text-center py-2 text-[10px] tracking-[0.2em] uppercase font-medium overflow-hidden">
        <div className="flex items-center justify-center gap-8">
          <span>✦ Free Delivery on Orders Above ₹499 ✦</span>
          <span className="hidden sm:inline">100% Authentic Products ✦ Mumbai's Trusted Beauty Store</span>
        </div>
      </div>

      <nav
        className={`sticky top-0 w-full z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-[0_4px_24px_-4px_rgba(44,30,22,0.12)] border-b border-[#E8E2D9] py-0'
            : 'bg-[#FAF9F6] py-0 border-b border-[#E8E2D9]'
        }`}
      >
        {/* Main Navbar Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20 relative">

            {/* Left: Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-[#2C1E16] hover:text-[#C88E75] transition-colors mr-4"
                aria-label="Open menu"
              >
                <Menu size={22} strokeWidth={1.5} />
              </button>
            </div>

            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
              {/* Logo Image */}
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden border-2 border-[#C88E75]/30 shadow-md group-hover:border-[#C88E75] group-hover:shadow-[0_0_16px_rgba(200,142,117,0.3)] transition-all duration-300">
                <Image
                  src="/images/brand/logo.png"
                  alt="Beauty Looks Mumbai Logo"
                  fill
                  className="object-cover scale-110"
                  priority
                />
              </div>
              {/* Brand Name Text */}
              <div className="hidden sm:block">
                <div className="text-[#2C1E16] font-bold text-base leading-tight tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Beauty Looks
                </div>
                <div className="text-[9px] text-[#C88E75] tracking-[0.2em] uppercase font-semibold">
                  Premium Cosmetics · Mumbai
                </div>
              </div>
            </Link>

            {/* Desktop Navigation (Center) */}
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href.split('?')[0]));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative text-[11px] tracking-[0.15em] uppercase font-semibold transition-colors group ${
                      isActive ? 'text-[#C88E75]' : 'text-[#2C1E16] hover:text-[#C88E75]'
                    }`}
                  >
                    {link.name}
                    <span className={`absolute -bottom-0.5 left-0 h-px bg-[#C88E75] transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                  </Link>
                );
              })}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-[#2C1E16] hover:text-[#C88E75] transition-colors hidden sm:block"
                aria-label="Search"
              >
                <Search size={19} strokeWidth={1.5} />
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className="relative text-[#2C1E16] hover:text-[#C88E75] transition-colors hidden sm:block">
                <Heart size={19} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#C88E75] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative text-[#2C1E16] hover:text-[#C88E75] transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={19} strokeWidth={1.5} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#2C1E16] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {/* Account */}
              <Link
                href="/account"
                className="text-[#2C1E16] hover:text-[#C88E75] transition-colors"
                aria-label="Account"
              >
                <User size={19} strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>

        {/* Perks Bar — fills the empty space near logo on wider screens */}
        <div className="hidden lg:block border-t border-[#E8E2D9] bg-[#FDF8F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-12 py-2">
              {perks.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-[10px] text-[#6B5C52] tracking-[0.12em] uppercase font-semibold">
                  <Icon size={12} className="text-[#C88E75]" strokeWidth={2} />
                  <span>{label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-[10px] text-[#6B5C52] tracking-[0.12em] uppercase font-semibold">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span>WhatsApp Support · 8879655807</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar — slides down */}
        <div className={`overflow-hidden transition-all duration-300 ${isSearchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-t border-[#E8E2D9] bg-white px-4 sm:px-8 py-3">
            <div className="max-w-lg mx-auto relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5C52]" />
              <input
                type="text"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search for products, brands..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E8E2D9] rounded-xl focus:outline-none focus:border-[#C88E75] bg-[#FAF9F6] text-[#2C1E16] placeholder:text-[#6B5C52]/50"
                autoFocus={isSearchOpen}
              />
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
        <div className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col border-r border-[#E8E2D9]">
          <div className="px-6 py-6 flex justify-between items-center border-b border-[#E8E2D9]">
            <Link href="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-[#C88E75]/30">
                <Image
                  src="/images/brand/logo.png"
                  alt="Beauty Looks Mumbai"
                  fill
                  className="object-cover scale-110"
                />
              </div>
              <div>
                <div className="text-[#2C1E16] font-bold text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>Beauty Looks</div>
                <div className="text-[8px] text-[#C88E75] tracking-[0.15em] uppercase font-semibold">Premium Cosmetics</div>
              </div>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[#6B5C52] hover:text-[#2C1E16] transition-colors p-2 bg-[#FAF9F6] rounded-full"
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
                  className="flex items-center justify-between py-3.5 px-4 rounded-xl hover:bg-[#FAF9F6] text-[12px] tracking-[0.12em] uppercase font-semibold text-[#2C1E16] hover:text-[#C88E75] transition-all group"
                >
                  <span>{link.name}</span>
                  <span className="text-[#C88E75] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              </div>
            ))}

            <div
              className="pt-6 mt-6 border-t border-[#E8E2D9] space-y-3"
              style={{
                opacity: isMobileMenuOpen ? 1 : 0,
                transitionDelay: `${navLinks.length * 60}ms`,
                transitionDuration: '500ms',
                transition: 'opacity 500ms'
              }}
            >
              <Link href="/wishlist" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-[#FAF9F6] text-[#2C1E16] hover:text-[#C88E75] transition-all">
                <Heart size={18} strokeWidth={1.5} />
                <span className="text-[11px] tracking-[0.12em] uppercase font-semibold">Wishlist ({wishlistCount})</span>
              </Link>
              <Link href="/account" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-[#FAF9F6] text-[#2C1E16] hover:text-[#C88E75] transition-all">
                <User size={18} strokeWidth={1.5} />
                <span className="text-[11px] tracking-[0.12em] uppercase font-semibold">Account</span>
              </Link>
            </div>
          </div>

          <div className="p-5 bg-[#FAF9F6] border-t border-[#E8E2D9]">
            <p className="text-[10px] tracking-[0.15em] text-[#6B5C52] text-center uppercase">
              Need help?{' '}
              <a href="tel:+918879655807" className="text-[#C88E75] hover:text-[#2C1E16] transition-colors font-semibold">
                8879655807
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
