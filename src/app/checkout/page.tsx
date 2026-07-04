'use client';

export const runtime = 'edge';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/data';

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart, getTotalItems } = useCartStore();
  const fallbackProductImage = '/images/products/facial-kit-1.png';
  
  // Checkout Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const totalPrice = getTotalPrice();
  const shippingCharge = totalPrice >= 499 ? 0 : 49;
  const finalTotal = totalPrice + shippingCharge;

  // Indian States
  const indianStates = [
    'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 
    'Telangana', 'Uttar Pradesh', 'Rajasthan', 'West Bengal', 'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate order placement
    const randomOrderId = 'BLM-' + Math.floor(100000 + Math.random() * 900000);
    setOrderId(randomOrderId);
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <div className="w-full min-h-screen bg-primary py-24 text-center flex flex-col items-center justify-center px-4">
        <div className="max-w-xl space-y-8 relative">
          <div className="flex justify-center">
            <CheckCircle2 size={64} strokeWidth={1} className="text-accent" />
          </div>
          <h2 className="font-display text-4xl text-text-main">Order Confirmed</h2>
          <p className="text-sm text-text-muted font-light max-w-md mx-auto leading-relaxed">
            Thank you for your purchase. Your order is being processed and a confirmation email has been sent to <strong>{formData.email}</strong>.
          </p>
          
          <div className="bg-secondary border border-border p-8 text-left space-y-4 text-sm text-text-muted rounded-2xl shadow-sm">
            <div className="flex justify-between border-b border-border pb-4 font-semibold text-text-main">
              <span>Order Reference</span>
              <span>{orderId}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span>Customer Name</span>
              <span className="font-medium text-text-main">{formData.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Address</span>
              <span className="font-medium text-text-main truncate max-w-[200px]">
                {formData.addressLine1}, {formData.city}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Contact Number</span>
              <span className="font-medium text-text-main">{formData.phone}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-border pt-4 mt-2">
              <span>Total Paid</span>
              <span className="text-text-main">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          <div className="pt-8 flex flex-col space-y-4 justify-center items-center">
            <Link href="/products" className="btn-primary w-full sm:w-64 justify-center">
              Continue Shopping
            </Link>
            <Link href="/" className="text-xs font-semibold uppercase tracking-widest text-text-muted hover:text-text-main transition-colors py-2">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-primary py-12">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="border-b border-border pb-6 mb-12 flex items-center">
          <Link href="/cart" className="text-text-main hover:opacity-60 transition-opacity mr-6">
            <ArrowLeft size={24} strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-4xl font-display text-text-main">
              Checkout
            </h1>
            <p className="text-xs text-text-muted mt-2 tracking-widest uppercase font-semibold">
              Secure your order
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-secondary rounded-2xl max-w-md mx-auto space-y-8 shadow-sm">
            <h3 className="font-display text-3xl text-text-main">No items to checkout</h3>
            <p className="text-sm text-text-muted font-light">Add items to your bag before proceeding.</p>
            <Link href="/products" className="btn-primary inline-flex">Go Shopping</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Form Column */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Shipping Information */}
              <div>
                <h3 className="font-display text-xl text-text-main border-b border-border pb-4 mb-8">
                  Shipping Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Name */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Contact Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm"
                    />
                  </div>

                  {/* Address 1 */}
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      required
                      className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm"
                    />
                  </div>

                  {/* Address 2 */}
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Apartment, Suite, etc. (Optional)</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm"
                    />
                  </div>

                  {/* City */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm"
                    />
                  </div>

                  {/* State */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">State *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors appearance-none shadow-sm"
                    >
                      <option value="">Select State</option>
                      {indianStates.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Pincode */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                      className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div>
                <h3 className="font-display text-xl text-text-main border-b border-border pb-4 mb-8 flex items-center space-x-3">
                  <CreditCard size={20} strokeWidth={1.5} />
                  <span>Payment Gateway</span>
                </h3>
                <div className="bg-secondary rounded-2xl p-8 space-y-4 shadow-sm border border-border">
                  <p className="text-sm text-text-muted font-light leading-relaxed">
                    Razorpay payments will be verified in production. For this demo, clicking "Place Order" will simulate a successful transaction.
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-text-main font-semibold uppercase tracking-widest pt-4 border-t border-border">
                    <ShieldCheck size={16} strokeWidth={1.5} className="text-accent" />
                    <span>Secure Encrypted Payment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4 bg-secondary p-8 sticky top-32 rounded-2xl shadow-sm border border-border">
              <h3 className="font-display text-xl text-text-main border-b border-border pb-4 mb-6">
                Order Review
              </h3>

              {/* List of items */}
              <div className="divide-y divide-border max-h-96 overflow-y-auto no-scrollbar mb-8">
                {items.map((item) => (
                  <div key={item.product.id} className="py-4 flex items-start justify-between text-sm">
                    <div className="flex items-start space-x-4">
                      <div className="relative w-16 h-16 bg-primary rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-border">
                        <Image
                          src={item.product.images?.[0] || fallbackProductImage}
                          alt={item.product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <span className="block font-medium text-text-main mb-1">{item.product.name}</span>
                        <span className="block text-[10px] text-text-muted uppercase tracking-widest font-semibold">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-medium text-text-main">
                      {formatPrice((item.product.salePrice || item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing list */}
              <div className="border-t border-border pt-6 space-y-4 text-sm font-light text-text-muted">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{totalPrice >= 499 ? 'Complimentary' : formatPrice(shippingCharge)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-border pt-6 mt-6 mb-8 flex justify-between items-center text-base font-semibold text-text-main">
                <span>Final Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center"
              >
                Place Order
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
