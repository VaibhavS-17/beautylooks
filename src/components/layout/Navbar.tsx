'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Heart, ShoppingBag, Menu, X, User } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Shop All', href: '/products' },
    { name: 'Facial Kits', href: '/products?category=facial-kits' },
    { name: 'Skincare', href: '/products?category=serums-oils' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <nav 
        className={`sticky top-0 w-full z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-primary/95 backdrop-blur-md shadow-sm border-b border-border py-2' 
            : 'bg-primary py-3 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center relative">
            
            {/* Left: Mobile Menu Button & Logo */}
            <div className="flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden text-text-main hover:text-accent transition-colors mr-14"
                aria-label="Open menu"
              >
                <Menu size={22} strokeWidth={1.25} />
              </button>

              <Link href="/" className="block relative group flex items-center">
                <div className="relative h-10 w-32 sm:h-12 sm:w-40 transition-opacity duration-300 group-hover:opacity-80">
                  <Image
                    src="/images/brand/logo.png"
                    alt="Beauty Looks Mumbai"
                    fill
                    className="object-contain object-left mix-blend-multiply"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation (Center) */}
            <div className="hidden md:flex items-center space-x-10 absolute left-1/2 transform -translate-x-1/2">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-[11px] tracking-[0.15em] uppercase font-medium text-text-main hover:text-accent transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-5">
              <button className="hidden sm:block text-text-main hover:text-accent transition-colors">
                <Search size={20} strokeWidth={1.25} />
              </button>
              
              <Link href="/wishlist" className="relative text-text-main hover:text-accent transition-colors hidden sm:block">
                <Heart size={20} strokeWidth={1.25} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-accent text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              
              <button 
                onClick={openCart}
                className="relative text-text-main hover:text-accent transition-colors"
              >
                <ShoppingBag size={20} strokeWidth={1.25} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-text-main text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              <Link
                href={isLoggedIn ? '/account' : '/login'}
                className="hidden sm:flex items-center text-text-main hover:text-accent transition-colors"
                title={isLoggedIn ? 'My Account' : 'Sign In'}
              >
                <User size={20} strokeWidth={1.25} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed inset-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-500 ease-in-out md:hidden`}
      >
        <div 
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-primary/90 backdrop-blur-xl shadow-2xl flex flex-col border-r border-border">
          <div className="px-6 py-8 flex justify-between items-center">
            <Link href="/" className="block relative h-10 w-32" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="relative h-full w-full">
                <Image
                  src="/images/brand/logo.png"
                  alt="Beauty Looks Mumbai"
                  fill
                  className="object-contain object-left mix-blend-multiply"
                />
              </div>
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-text-main hover:text-accent transition-colors p-2 bg-white/50 rounded-full"
            >
              <X size={20} strokeWidth={1.25} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6 px-8 space-y-6">
            {navLinks.map((link, index) => (
              <div 
                key={link.name}
                className="transform transition-all duration-500"
                style={{ 
                  opacity: isMobileMenuOpen ? 1 : 0, 
                  transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(15px)',
                  transitionDelay: `${index * 75}ms`
                }}
              >
                <Link 
                  href={link.href}
                  className="block text-[13px] tracking-[0.15em] uppercase font-medium text-text-main hover:text-accent transition-colors"
                >
                  {link.name}
                </Link>
              </div>
            ))}
            
            <div className="pt-8 mt-8 border-t border-border flex flex-col space-y-6"
              style={{ 
                opacity: isMobileMenuOpen ? 1 : 0, 
                transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(15px)',
                transitionDelay: `${navLinks.length * 75}ms`,
                transitionDuration: '500ms'
              }}
            >
              <Link href="/wishlist" className="flex items-center space-x-4 text-text-main hover:text-accent transition-colors">
                <Heart size={20} strokeWidth={1.25} />
                <span className="text-[11px] tracking-[0.15em] uppercase font-medium">Wishlist ({wishlistCount})</span>
              </Link>
              <Link href={isLoggedIn ? '/account' : '/login'} className="flex items-center space-x-4 text-text-main hover:text-accent transition-colors">
                <User size={20} strokeWidth={1.25} />
                <span className="text-[11px] tracking-[0.15em] uppercase font-medium">{isLoggedIn ? 'My Account' : 'Sign In'}</span>
              </Link>
            </div>
          </div>
          
          <div className="p-6 bg-secondary/50 backdrop-blur-md border-t border-border">
            <p className="text-[10px] tracking-[0.2em] text-text-muted text-center uppercase">
              Need help? <a href="tel:+918879655807" className="text-accent hover:text-text-main transition-colors ml-1 font-medium">8879655807</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
