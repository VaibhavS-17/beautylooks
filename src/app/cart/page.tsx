'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck, Truck, Undo } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/data';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems, getSubtotal } = useCartStore();

  const subtotal = getSubtotal();
  const totalPrice = getTotalPrice();
  const shippingCharge = totalPrice >= 499 ? 0 : 49;
  const finalTotal = totalPrice + shippingCharge;
  const discountTotal = subtotal - totalPrice;

  return (
    <div className="w-full min-h-screen bg-primary py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="border-b border-border pb-6 mb-12">
          <h1 className="text-4xl font-display text-text-main">
            Shopping Bag
          </h1>
          <p className="text-xs text-text-muted mt-2 tracking-widest uppercase font-semibold">
            Review your selections
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center max-w-xl mx-auto space-y-8">
            <h2 className="font-display text-3xl text-text-main">Your bag is empty</h2>
            <p className="text-sm text-text-muted max-w-sm font-light">
              You haven't added any products to your shopping bag yet. Discover our curated collections to start your journey.
            </p>
            <Link href="/products" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          /* Cart Content Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Items List */}
            <div className="lg:col-span-8 space-y-8">
              {items.map((item) => {
                const itemPrice = item.product.salePrice || item.product.price;
                const originalPrice = item.product.price;
                const hasDiscount = item.product.salePrice !== null;

                return (
                  <div
                    key={item.product.id}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pb-8 border-b border-border"
                  >
                    {/* Item Left: Image & Info */}
                    <div className="flex items-start space-x-6">
                      <div className="relative w-32 h-32 bg-secondary rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="space-y-1 pt-2">
                        <span className="text-[10px] text-text-muted font-semibold tracking-widest uppercase">
                          {item.product.brand}
                        </span>
                        <h3 className="text-base font-medium text-text-main hover:opacity-60 transition-opacity">
                          <Link href={`/products/${item.product.slug}`}>{item.product.name}</Link>
                        </h3>
                        <p className="text-xs text-text-muted font-light capitalize pt-1">{item.product.category}</p>
                      </div>
                    </div>

                    {/* Item Right: Quantity, Price & Actions */}
                    <div className="flex flex-col sm:items-end justify-between h-full pt-2">
                      {/* Pricing */}
                      <div className="text-left sm:text-right mb-4">
                        <span className="block text-base font-medium text-text-main">
                          {formatPrice(itemPrice * item.quantity)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-text-muted line-through">
                            {formatPrice(originalPrice * item.quantity)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-6">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-border rounded-xl h-10 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-3 text-text-main hover:bg-secondary h-full flex items-center"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-4 text-sm font-medium text-text-main">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="px-3 text-text-main hover:bg-secondary h-full flex items-center"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-xs uppercase tracking-widest font-semibold text-text-muted hover:text-text-main transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

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
