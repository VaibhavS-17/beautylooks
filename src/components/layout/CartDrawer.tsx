'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/data';
import { checkCartStock } from '@/app/actions/cartActions';
import { NotifyMeButton } from '@/components/product/NotifyMeButton';
import { createClient } from '@/lib/supabase/client';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore();
  const fallbackProductImage = '/images/products/facial-kit-1.png';
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Focus close button on open
      setTimeout(() => {
        const closeBtn = document.getElementById('cart-close-btn');
        if (closeBtn) closeBtn.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeCart]);

  const handleTabKey = (e: React.KeyboardEvent) => {
    if (!drawerRef.current) return;
    
    const focusableElements = drawerRef.current.querySelectorAll(
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

  // Real-time stock check
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [stockChecked, setStockChecked] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });
  }, []);

  useEffect(() => {
    if (!isOpen || items.length === 0) return;
    async function refreshStock() {
      const productIds = items.map(item => item.product.id);
      try {
        const res = await checkCartStock(productIds);
        if (res.success && res.stockMap) {
          setStockMap(res.stockMap);
        }
      } catch (err) {
        console.error('Failed to check cart stock:', err);
      }
      setStockChecked(true);
    }
    refreshStock();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, items.length]);

  if (!isOpen) return null;

  const subtotal = getTotalPrice();
  const shipping = subtotal >= 499 ? 0 : 49;
  const grandTotal = subtotal + shipping;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden" 
      role="dialog" 
      aria-modal="true" 
      aria-label="Shopping Cart"
      onKeyDown={handleTabKey}
      ref={drawerRef}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="absolute inset-0 md:inset-y-0 md:right-0 md:left-auto flex justify-end">
        <div className="w-full h-[100dvh] md:max-w-md md:h-full bg-white shadow-2xl flex flex-col overflow-hidden relative">
          
          {/* Header */}
          <div className="flex-none px-4 py-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
            <h2 className="text-2xl font-display font-light text-text-main">Your Bag ({getTotalItems()})</h2>
            <button
              id="cart-close-btn"
              onClick={closeCart}
              className="text-text-muted hover:text-text-main transition-colors focus-visible:outline-none"
              aria-label="Close cart"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          {/* Free Shipping Progress */}
          {items.length > 0 && (
            <div className="px-4 py-4 bg-white border-b border-gray-100 flex flex-col gap-2 z-10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted font-medium">Shipping</span>
                <span className="font-medium text-text-main">
                  {subtotal >= 499 ? 'Free Shipping Unlocked' : `Add ${formatPrice(499 - subtotal)} more for Free`}
                </span>
              </div>
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, (subtotal / 499) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Item List */}
          <div className="flex-1 overflow-y-auto px-4 divide-y divide-gray-100 no-scrollbar">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <ShoppingBag size={48} strokeWidth={1} className="text-gray-300" />
                <div className="space-y-2">
                  <h3 className="font-display text-2xl text-text-main">Your bag is empty</h3>
                  <p className="text-text-muted font-light">
                    Discover our premium salon-grade cosmetics.
                  </p>
                </div>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="mt-4 px-8 py-3 bg-black text-white text-sm uppercase tracking-wider hover:bg-gray-900 transition-colors"
                >
                  Shop Collection
                </Link>
              </div>
            ) : (
              <div className="flex flex-col">
                {items.map((item) => {
                  const itemPrice = item.product.salePrice || item.product.price;
                  const originalPrice = item.product.price;
                  const hasDiscount = item.product.salePrice !== null && item.product.salePrice < originalPrice;
                  
                  const currentStock = stockChecked && stockMap[item.product.id] !== undefined
                    ? stockMap[item.product.id]
                    : item.product.stockQuantity;
                  const isOutOfStock = currentStock <= 0;

                  return (
                    <div
                      key={item.product.id}
                      className={`py-6 flex gap-4 ${
                        isOutOfStock ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Image */}
                      <div className="relative w-24 h-24 bg-gray-50 shrink-0">
                        <Image
                          src={item.product.images?.[0] || fallbackProductImage}
                          alt={item.product.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-1">
                              {item.product.brand}
                            </span>
                            <h4 className="text-base text-text-main line-clamp-2">
                              <Link href={`/products/${item.product.slug}`} onClick={closeCart}>
                                {item.product.name}
                              </Link>
                            </h4>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-text-muted hover:text-red-600 transition-colors p-1 -mr-1"
                            aria-label="Remove item"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="flex items-end justify-between mt-4">
                          {/* Quantity */}
                          <div className="flex items-center border border-gray-200">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-3 py-1 text-text-muted hover:text-black transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 py-1 text-sm text-text-main min-w-[32px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stockQuantity}
                              className={`px-3 py-1 transition-colors ${
                                item.quantity >= item.product.stockQuantity
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-text-muted hover:text-black'
                              }`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-base font-medium text-text-main">
                              {formatPrice(itemPrice * item.quantity)}
                            </div>
                            {hasDiscount && (
                              <div className="text-xs text-text-muted line-through mt-0.5">
                                {formatPrice(originalPrice * item.quantity)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {isOutOfStock && (
                           <div className="mt-3">
                             <NotifyMeButton
                               productId={item.product.id}
                               defaultEmail={userEmail}
                               className="!mt-0 font-medium text-xs text-red-600"
                             />
                           </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with clean CTA */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-6 bg-white flex-none">
              <div className="flex justify-between items-center mb-6">
                <span className="text-base text-text-main">Subtotal</span>
                <span className="text-lg font-medium text-text-main">{formatPrice(subtotal)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full py-4 bg-black text-white text-center text-sm uppercase tracking-wider hover:bg-gray-900 transition-colors"
              >
                Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
