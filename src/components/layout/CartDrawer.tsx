'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/data';

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
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Responsive Drawer Container - Wider on PC so rows fit horizontally without wrapping */}
      <div className="absolute inset-0 md:inset-y-0 md:right-0 md:left-auto flex justify-end">
        <div className="w-full h-[100dvh] md:max-w-xl md:h-full bg-[#FDFBF7] shadow-2xl flex flex-col overflow-hidden relative border-l border-border/50">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-multiply z-0"></div>

          {/* ── COMPACT STICKY HEADER (flex-none) ── */}
          <div className="flex-none relative z-10 bg-white/95 backdrop-blur border-b border-border">
            {/* Drag Handle (Mobile only) */}
            <div className="md:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-border rounded-full"></div>
            </div>

            {/* Header: Bag Count & Close */}
            <div className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-display font-bold text-text-main">Your Bag</h2>
                <span className="text-xs font-semibold bg-secondary px-2.5 py-0.5 rounded-full text-text-main">
                  {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                id="cart-close-btn"
                onClick={closeCart}
                className="text-text-muted hover:text-text-main hover:bg-stone-100 p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close cart"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            {/* Ultra-Compact Free Shipping Progress Bar */}
            {items.length > 0 && (
              <div className="px-5 py-2 bg-[#FBF9F6] border-t border-border/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Shipping</span>
                  <span className="text-xs font-semibold text-text-main">
                    {subtotal >= 499 ? '✓ Free Shipping Unlocked' : `Add ${formatPrice(499 - subtotal)} more for Free Shipping`}
                  </span>
                </div>
                <div className="w-24 h-1.5 bg-border/50 rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full bg-accent transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, (subtotal / 499) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── SCROLLABLE COMPACT ITEMS LIST (flex-1) ── */}
          <div className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] divide-y divide-border/60 relative z-10 no-scrollbar">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-5 px-6">
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-secondary/60 border border-border/40 shadow-inner">
                  <ShoppingBag size={26} strokeWidth={1.3} className="text-accent" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-xl text-text-main font-semibold">Your bag is empty</h3>
                  <p className="text-xs text-text-muted max-w-[220px] font-light leading-relaxed">
                    Discover our premium salon-grade cosmetics and skincare.
                  </p>
                </div>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="mt-2 bg-brand-dark text-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-accent hover:text-brand-dark transition-all rounded-xl shadow-sm"
                >
                  Shop Collection
                </Link>
              </div>
            ) : (
              <div className="p-3 sm:p-0 space-y-3 sm:space-y-0 sm:divide-y sm:divide-border">
                {items.map((item) => {
                  const itemPrice = item.product.salePrice || item.product.price;
                  const originalPrice = item.product.price;
                  const hasDiscount = item.product.salePrice !== null && item.product.salePrice < originalPrice;
                  const discountPercent = hasDiscount ? Math.round(((originalPrice - itemPrice) / originalPrice) * 100) : 0;

                  return (
                    <div
                      key={item.product.id}
                      className="p-4 sm:px-5 sm:py-3 bg-white sm:bg-transparent rounded-2xl sm:rounded-none border border-border sm:border-0 shadow-xs sm:shadow-none hover:bg-white/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                    >
                      {/* Top / Left Section: Image + Info */}
                      <div className="flex items-start sm:items-center justify-between sm:justify-start gap-3.5 sm:gap-4 flex-1 min-w-0">
                        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                          {/* Thumbnail: 80x80 on mobile, 56x56 on PC */}
                          <div className="relative w-20 h-20 sm:w-14 sm:h-14 bg-secondary rounded-xl sm:rounded-lg overflow-hidden shrink-0 border border-border/60 shadow-2xs">
                            <Image
                              src={item.product.images?.[0] || fallbackProductImage}
                              alt={item.product.name}
                              fill
                              sizes="(max-width: 640px) 80px, 56px"
                              className="object-cover"
                            />
                          </div>

                          {/* Middle Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] sm:text-[10px] font-bold uppercase tracking-wider text-text-muted truncate block">
                                {item.product.brand}
                              </span>
                              {item.product.stockQuantity === 1 && (
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded shrink-0">
                                  Only 1 left
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm sm:text-xs font-semibold text-text-main line-clamp-2 sm:truncate hover:text-accent transition-colors mt-0.5">
                              <Link href={`/products/${item.product.slug}`} onClick={closeCart}>
                                {item.product.name}
                              </Link>
                            </h4>

                            {/* Quantity Selector + Controls Row */}
                            <div className="flex items-center gap-3 mt-2 sm:mt-1.5">
                              <div className="inline-flex items-center border border-border rounded-lg sm:rounded-md bg-white h-8 sm:h-6 overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="px-2.5 sm:px-2 text-text-muted hover:text-text-main hover:bg-stone-100 transition-colors h-full flex items-center"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={13} className="sm:w-[11px] sm:h-[11px]" />
                                </button>
                                <span className="px-2.5 sm:px-2 text-xs sm:text-xs font-semibold text-text-main select-none min-w-[24px] sm:min-w-[20px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stockQuantity}
                                  className={`px-2.5 sm:px-2 h-full flex items-center transition-colors ${
                                    item.quantity >= item.product.stockQuantity
                                      ? 'text-border cursor-not-allowed'
                                      : 'text-text-muted hover:text-text-main hover:bg-stone-100'
                                  }`}
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={13} className="sm:w-[11px] sm:h-[11px]" />
                                </button>
                              </div>

                              {/* Desktop Remove Button */}
                              <button
                                onClick={() => removeItem(item.product.id)}
                                className="hidden sm:flex text-[11px] text-text-muted hover:text-red-600 transition-colors items-center gap-1 font-medium"
                                aria-label="Remove item"
                              >
                                <Trash2 size={12} /> Remove
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Mobile Top-Right Trash Icon (Nykaa style) */}
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="sm:hidden p-1.5 text-text-muted hover:text-red-600 transition-colors rounded-lg hover:bg-red-50/50 -mr-1 -mt-1 shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      {/* Bottom / Right Section: Nykaa 'You Pay' on mobile, Price column on PC */}
                      <div className="mt-1 pt-3 border-t border-border/60 sm:mt-0 sm:pt-0 sm:border-0 flex items-center justify-between sm:block sm:text-right shrink-0">
                        <span className="text-xs font-medium text-text-muted sm:hidden">
                          You Pay
                        </span>

                        <div className="flex sm:block items-baseline gap-1.5 text-right">
                          <span className="text-sm sm:text-xs font-bold text-text-main">
                            {formatPrice(itemPrice * item.quantity)}
                          </span>
                          {hasDiscount && (
                            <>
                              <span className="text-xs sm:text-[10px] text-text-muted line-through">
                                {formatPrice(originalPrice * item.quantity)}
                              </span>
                              <span className="text-xs sm:text-[10px] font-bold text-emerald-600">
                                {discountPercent}% off
                              </span>
                            </>
                          )}
                          {item.quantity > 1 && (
                            <span className="hidden sm:block text-[10px] text-text-muted">
                              {formatPrice(itemPrice)} each
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Compact Optional Gift Box Strip - only shown if <= 3 items so it never forces scrolling */}
                {items.length <= 3 && (
                  <div className="mx-5 my-3 px-3.5 py-2.5 bg-secondary/40 border border-border/80 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm">🎁</span>
                      <div className="min-w-0">
                        <span className="font-semibold text-text-main text-xs block truncate">Add Luxury Gift Packaging</span>
                        <span className="text-[10px] text-text-muted block">Premium box & ribbon · ₹299</span>
                      </div>
                    </div>
                    <button className="px-2.5 py-1 bg-white border border-border text-xs font-bold rounded-lg hover:border-accent hover:text-accent transition-colors shrink-0">
                      + Add
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── ULTRA-COMPACT NYKAA-STYLE STICKY FOOTER (flex-none) ── */}
          {items.length > 0 && (
            <div
              className="flex-none bg-white/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] relative z-10"
              style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
            >
              {/* Top info bar */}
              <div className="px-5 py-1.5 bg-[#FBF9F6] border-b border-border/50 text-[11px] text-text-muted flex items-center justify-between">
                <span>✨ 100% Authentic & Salon Quality Guarantee</span>
                <span className="font-semibold text-text-main">
                  {shipping === 0 ? 'Free Shipping Included' : `Shipping: ${formatPrice(shipping)}`}
                </span>
              </div>

              {/* Compact Checkout Action Row */}
              <div className="px-5 py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-text-main">{formatPrice(grandTotal)}</span>
                    <span className="text-[11px] text-text-muted font-medium">Grand Total</span>
                  </div>
                  <span className="text-[10px] text-text-muted block">
                    Subtotal {formatPrice(subtotal)} {shipping > 0 ? `+ ${formatPrice(shipping)} ship` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={closeCart}
                    className="px-3 py-2.5 text-xs font-semibold text-text-muted hover:text-text-main transition-colors hidden sm:block"
                  >
                    Continue Shopping
                  </button>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="px-6 py-2.5 bg-brand-dark text-primary hover:bg-accent hover:text-brand-dark text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
                  >
                    Proceed <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
