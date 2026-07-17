'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, User, ShoppingBag, Tag } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const openCart = useCartStore((state) => state.openCart);
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      if (user) {
        useWishlistStore.getState().syncWithDB();
        useCartStore.getState().syncWithDB();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      if (session?.user && _event === 'SIGNED_IN') {
        useWishlistStore.getState().syncWithDB();
        useCartStore.getState().syncWithDB();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
    },
    {
      name: 'Categories',
      href: '/products',
      icon: Tag,
    },
    {
      name: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
      badge: wishlistCount,
    },
    {
      name: 'Account',
      href: isLoggedIn ? '/account' : '/login',
      icon: User,
    },
  ];

  // Hide the global bottom nav on the product detail page because it has its own sticky CTA bar.
  const isProductDetailPage = pathname?.match(/^\/products\/[^/]+$/);
  
  if (isProductDetailPage) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-accent' : 'text-text-muted hover:text-text-main'
              } transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[9px] uppercase tracking-widest font-semibold">{item.name}</span>
            </Link>
          );
        })}

        {/* Center Cart Button */}
        <button
          onClick={openCart}
          className="relative flex flex-col items-center justify-center -mt-6 transition-transform duration-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full"
        >
          <div className="bg-brand-dark text-primary h-14 w-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(202,138,4,0.3)] border-4 border-white">
            <ShoppingBag size={22} strokeWidth={1.5} />
            {mounted && cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                {cartItemsCount}
              </span>
            )}
          </div>
        </button>

        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-accent' : 'text-text-muted hover:text-text-main'
              } transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              {mounted && (item.badge || 0) > 0 && (
                <span className="absolute top-1 right-2 bg-accent text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                  {item.badge}
                </span>
              )}
              <span className="text-[9px] uppercase tracking-widest font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
