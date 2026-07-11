'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-brand-light py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent block mb-3">
            Policy & Logistics
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-text-main font-bold tracking-tight">
            Shipping & Returns Policy
          </h1>
          <p className="text-sm text-text-muted mt-4 max-w-xl mx-auto font-light leading-relaxed">
            Transparent delivery estimates across Mumbai & India, along with our simple hassle-free returns guarantee.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-border rounded-2xl p-6 text-center">
            <Truck className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-main mb-1">Fast Mumbai Delivery</h3>
            <p className="text-xs text-text-muted font-light leading-relaxed">
              Standard 2–4 business days across Greater Mumbai. Express options available at checkout.
            </p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-6 text-center">
            <ShieldCheck className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-main mb-1">Free Shipping</h3>
            <p className="text-xs text-text-muted font-light leading-relaxed">
              Complimentary standard shipping on all orders valued above ₹499 across India.
            </p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-6 text-center">
            <RotateCcw className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-main mb-1">7-Day Easy Returns</h3>
            <p className="text-xs text-text-muted font-light leading-relaxed">
              Return unopened and unused items within 7 days of delivery for a smooth replacement or refund.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8">
          {/* Shipping Section */}
          <div className="bg-white border border-border rounded-3xl p-8 sm:p-10 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-text-main mb-4 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-accent" />
              Shipping Timelines & Coverage
            </h2>
            <div className="space-y-4 text-sm text-text-muted font-light leading-relaxed">
              <p>
                All orders are processed within 24 business hours from our central warehouse in Mumbai, Maharashtra. Once dispatched, tracking updates are automatically shared via email and SMS.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-secondary/50 rounded-xl border border-border/50">
                  <p className="font-semibold text-text-main text-xs uppercase tracking-wider mb-1">Mumbai & Thane</p>
                  <p className="text-xs text-text-muted">2–4 Business Days (Express next-day delivery on select pincodes)</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-xl border border-border/50">
                  <p className="font-semibold text-text-main text-xs uppercase tracking-wider mb-1">Rest of India</p>
                  <p className="text-xs text-text-muted">4–6 Business Days via trusted national courier partners</p>
                </div>
              </div>
            </div>
          </div>

          {/* Returns Section */}
          <div className="bg-white border border-border rounded-3xl p-8 sm:p-10 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-text-main mb-4 flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-accent" />
              Returns, Replacements & Refunds
            </h2>
            <div className="space-y-4 text-sm text-text-muted font-light leading-relaxed">
              <p>
                Your satisfaction is our absolute priority. We accept return requests within <strong>7 days</strong> of delivery under the following conditions:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>The product is completely unopened, unused, and with original safety seals intact.</li>
                <li>In the rare event of receiving a transit-damaged or wrong item, please notify us within 48 hours with packaging photos for an expedited replacement.</li>
                <li>Due to strict cosmetic hygiene regulations, opened or sampled beauty products cannot be accepted for return.</li>
              </ul>
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Refunds for prepaid orders are credited back to the original payment source within 5–7 business days after our quality check team inspects the returned parcel.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            href="/faq"
            className="px-6 py-3 border border-border text-text-main text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-secondary transition-colors"
          >
            Read FAQ
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 bg-text-main text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
