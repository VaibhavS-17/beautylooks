'use client';

export const runtime = 'edge';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck, Truck, Undo } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/data';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems, getSubtotal } = useCartStore();
  const fallbackProductImage = '/images/products/facial-kit-1.png';

  const subtotal = getSubtotal();
  const totalPrice = getTotalPrice();
  const shippingCharge = totalPrice >= 499 ? 0 : 49;
  const finalTotal = totalPrice + shippingCharge;
  const discountTotal = subtotal - totalPrice;

  return (
    <div className="w-full min-h-screen bg-primary py-12">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="border-b border-border pb-6 mb-12">
          <h1 className="text-2xl md:text-3xl md:text-4xl font-display text-text-main">
            Shopping Bag
          </h1>
          <p className="text-xs text-text-muted mt-2 tracking-widest uppercase font-semibold">
            Review your selections
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto space-y-6">
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-secondary/50 border border-border/40 shadow-inner">
              <ShoppingBag size={38} strokeWidth={1.2} className="text-accent" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent/20 animate-ping" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-accent/15" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-3xl text-text-main font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>
                Your bag is empty
              </h2>
              <p className="text-sm text-text-muted max-w-xs font-light leading-relaxed">
                It looks like you haven't added anything to your cart yet. Discover our premium collections to start your beauty journey.
              </p>
            </div>
            <Link
              href="/products"
              className="mt-4 px-8 py-3.5 bg-brand-dark text-primary hover:bg-accent hover:text-brand-dark text-xs uppercase tracking-widest font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
            >
              Discover Collection
            </Link>
          </div>
        ) : (
          /* Cart Content Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Items List */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-3 sm:space-y-0 sm:divide-y sm:divide-border sm:bg-white sm:rounded-2xl sm:border sm:border-border sm:overflow-hidden sm:shadow-xs">
                {items.map((item) => {
                  const itemPrice = item.product.salePrice ?? item.product.price;
                  const originalPrice = item.product.price;
                  const hasDiscount = item.product.salePrice !== null && item.product.salePrice < originalPrice;
                  const discountPercent = hasDiscount ? Math.round(((originalPrice - itemPrice) / originalPrice) * 100) : 0;

                  return (
                    <div
                      key={item.product.id}
                      className="p-4 sm:px-6 sm:py-3.5 bg-white sm:bg-transparent rounded-2xl sm:rounded-none border border-border sm:border-0 shadow-xs sm:shadow-none hover:bg-white/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
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

                            <h3 className="text-sm sm:text-xs font-semibold text-text-main line-clamp-2 sm:truncate hover:text-accent transition-colors mt-0.5">
                              <Link href={`/products/${item.product.slug}`}>{item.product.name}</Link>
                            </h3>

                            {/* Quantity Selector + Controls Row */}
                            <div className="flex items-center gap-3 mt-2 sm:mt-1.5">
                              <div className="inline-flex items-center border border-border rounded-lg sm:rounded-md bg-white h-8 sm:h-6 overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="px-2.5 sm:px-1.5 text-text-muted hover:text-text-main hover:bg-stone-100 transition-colors h-full flex items-center"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={13} className="sm:w-[11px] sm:h-[11px]" />
                                </button>
                                <span className="px-2.5 sm:px-2 text-xs font-semibold text-text-main select-none min-w-[24px] sm:min-w-[20px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stockQuantity}
                                  className={`px-2.5 sm:px-1.5 h-full flex items-center transition-colors ${
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
              </div>

              {/* Security info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                <div className="flex items-center space-x-3 text-xs text-text-muted">
                  <ShieldCheck size={18} strokeWidth={1.5} className="text-accent" />
                  <span>100% Authentic</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-text-muted">
                  <Truck size={18} strokeWidth={1.5} className="text-accent" />
                  <span>Complimentary Shipping</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-text-muted">
                  <Undo size={18} strokeWidth={1.5} className="text-accent" />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>

            {/* Checkout / Summary column */}
            <div className="lg:col-span-4 bg-secondary p-8 rounded-2xl shadow-sm">
              <h3 className="font-display text-xl text-text-main border-b border-border pb-4 mb-6">
                Order Summary
              </h3>

              <div className="space-y-4 text-sm font-light text-text-muted mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-text-main">
                    <span>Discount</span>
                    <span>-{formatPrice(discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span>{totalPrice >= 499 ? 'Complimentary' : formatPrice(shippingCharge)}</span>
                </div>
                {totalPrice < 499 && (
                  <p className="text-xs text-text-muted pt-2">
                    Add {formatPrice(499 - totalPrice)} more to unlock complimentary shipping.
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-6 mb-8 flex justify-between items-center text-base font-semibold text-text-main">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>

              <div className="space-y-4">
                <Link
                  href="/checkout"
                  className="btn-primary w-full justify-center text-xs uppercase tracking-widest"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/products"
                  className="block text-center text-xs font-semibold uppercase tracking-widest text-text-muted hover:text-text-main py-4 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
