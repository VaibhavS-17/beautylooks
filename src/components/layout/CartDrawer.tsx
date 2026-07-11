'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/data';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore();
  const fallbackProductImage = '/images/products/facial-kit-1.png';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
        onClick={closeCart}
      />

      {/* Responsive Drawer Container */}
      <div className="absolute inset-0 md:inset-y-0 md:right-0 md:left-auto flex justify-end">
        <div className="w-full h-[100dvh] md:max-w-md md:h-full bg-[#FDFBF7] shadow-2xl flex flex-col overflow-hidden relative border-l border-border/50">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-multiply z-0"></div>

          {/* ── STICKY HEADER (flex-none) ── */}
          <div className="flex-none relative z-10">
            {/* Drag Handle (Mobile only) */}
            <div className="md:hidden flex justify-center pt-3 pb-1 bg-white/50 backdrop-blur">
              <div className="w-12 h-1.5 bg-border rounded-full"></div>
            </div>

            {/* Header: Bag Count & Close */}
            <div className="px-6 py-4 md:py-6 border-b border-border flex items-center justify-between bg-white/50 backdrop-blur">
              <h2 className="text-xl font-display text-text-main">Your Bag ({getTotalItems()})</h2>
              <button
                onClick={closeCart}
                className="text-text-main hover:opacity-60 transition-opacity p-1"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Free Shipping Progress Tracker */}
            {items.length > 0 && (
              <div className="px-6 py-4 bg-secondary/30 border-b border-border">
                <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-widest text-text-main mb-2">
                  <span>Free Shipping</span>
                  <span>{getTotalPrice() >= 499 ? 'Unlocked' : `${formatPrice(499 - getTotalPrice())} away`}</span>
                </div>
                <div className="w-full h-1.5 bg-border/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, (getTotalPrice() / 499) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── ISOLATED MIDDLE SCROLL WRAPPER (flex-1) ── */}
          <div className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] py-6 px-6 no-scrollbar relative z-10 pb-16 md:pb-8">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-4">
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-secondary/50 border border-border/40 shadow-inner">
                  <ShoppingBag size={30} strokeWidth={1.2} className="text-accent" />
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent/20 animate-ping" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 rounded-full bg-accent/15" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display text-2xl text-text-main font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Your bag is empty
                  </h3>
                  <p className="text-xs text-text-muted max-w-[240px] font-light leading-relaxed">
                    Discover our premium collections and find your new favorites.
                  </p>
                </div>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="w-full mt-4 bg-brand-dark text-primary px-4 py-3.5 text-xs font-semibold uppercase tracking-widest hover:bg-accent hover:text-brand-dark transition-all rounded-xl text-center shadow-md active:scale-95"
                >
                  Shop Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => {
                  const itemPrice = item.product.salePrice || item.product.price;
                  return (
                    <div key={item.product.id} className="flex items-start space-x-4 border-b border-border pb-6 last:border-0 last:pb-0">
                      {/* Image */}
                      <div className="relative w-24 h-24 bg-secondary rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                        <Image
                          src={item.product.images?.[0] || fallbackProductImage}
                          alt={item.product.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-semibold text-text-muted tracking-widest uppercase block mb-1">
                              {item.product.brand}
                            </span>
                            <h4 className="text-sm font-medium text-text-main truncate hover:opacity-70 transition-opacity">
                              <Link href={`/products/${item.product.slug}`} onClick={closeCart}>
                                {item.product.name}
                              </Link>
                            </h4>
                          </div>
                          <span className="text-sm font-semibold text-text-main">
                            {formatPrice(itemPrice * item.quantity)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-border rounded-lg overflow-hidden h-8">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 text-text-main hover:bg-secondary transition-colors h-full flex items-center"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-3 text-xs font-medium text-text-main">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stockQuantity}
                              className={`px-2 h-full flex items-center transition-colors ${
                                item.quantity >= item.product.stockQuantity
                                  ? 'text-border cursor-not-allowed'
                                  : 'text-text-main hover:bg-secondary'
                              }`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Delete */}
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-xs uppercase tracking-widest font-semibold text-text-muted hover:text-text-main transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                        {item.product.stockQuantity === 1 && (
                          <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest block mt-2">
                            Only 1 left in stock
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Perfect Pairings Upsell Block */}
                <div className="mt-8 bg-secondary/30 p-4 rounded-xl border border-border">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Perfect Pairings</div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-lg border border-border flex items-center justify-center shrink-0">
                      <span className="text-xl">✨</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-semibold text-text-main truncate">Add a Premium Gift Box</h5>
                      <p className="text-[10px] text-text-muted truncate mt-0.5">Luxurious unboxing experience</p>
                      <span className="text-xs font-semibold text-accent block mt-1">₹299</span>
                    </div>
                    <button className="px-3 py-1.5 bg-white border border-accent text-accent rounded-lg text-[10px] font-bold uppercase hover:bg-accent hover:text-white transition-colors">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── STICKY FOOTER SUMMARY BOX (flex-none) ── */}
          {items.length > 0 && (
            <div className="flex-none px-6 py-6 bg-white/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)] relative z-10" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
              <div className="flex justify-between text-sm text-text-muted mb-4">
                <span>Subtotal</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-sm text-text-muted mb-6">
                <span>Shipping</span>
                <span>{getTotalPrice() >= 499 ? 'Complimentary' : formatPrice(49)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-text-main mb-8 pt-4 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(getTotalPrice() + (getTotalPrice() >= 499 ? 0 : 49))}</span>
              </div>

              <div className="flex flex-col space-y-3">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center w-full bg-brand-dark text-primary px-4 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-accent hover:text-brand-dark transition-all rounded-xl"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full text-center text-xs font-semibold uppercase tracking-widest text-text-muted hover:text-text-main transition-colors py-3"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
