'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/data';
import { ShoppingBag } from 'lucide-react';

export default function CartPreviewSnackbar() {
  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const pathname = usePathname();

  // Don't show on checkout page or admin pages
  if (pathname?.startsWith('/checkout') || pathname?.startsWith('/admin')) {
    return null;
  }

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce(
    (total, item) => total + (item.product.salePrice || item.product.price) * item.quantity,
    0
  );

  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-[4.5rem] sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-full px-4 sm:max-w-sm animate-fade-in">
      <div className="bg-brand-dark text-primary rounded-xl shadow-2xl p-3 flex items-center justify-between gap-4 border border-border/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag size={20} className="text-primary" />
            <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
            <span className="text-[10px] opacity-80">{formatPrice(totalPrice)}</span>
          </div>
        </div>
        <button
          onClick={openCart}
          className="px-4 py-2 bg-primary text-brand-dark text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-accent hover:text-white transition-colors"
        >
          View Cart
        </button>
      </div>
    </div>
  );
}
