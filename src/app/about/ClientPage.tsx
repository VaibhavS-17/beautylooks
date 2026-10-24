'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, Sparkles, User, Heart, MessageCircle, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-primary py-12 text-left">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-border pb-6 mb-12">
          <span className="subtitle block mb-2">Our Heritage &amp; Mission</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-text-main font-normal">
            About Beauty Looks Mumbai
          </h1>
          <p className="text-xs text-text-muted mt-2 tracking-wide font-light max-w-xl">
            The story behind Mumbai&apos;s trusted destination for genuine salon-grade cosmetics, bridal kits, and professional haircare.
          </p>
        </div>

        {/* Hero Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-brand-dark border border-border shadow-xs">
            <Image
              src="/images/hero-beauty.png"
              alt="Beauty Looks Mumbai Salon Formulation"
              fill
              className="object-cover opacity-75"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-black/20" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent-light block mb-1">Authentic Curation</span>
              <p className="font-serif text-xl sm:text-2xl font-light">Salon-Grade Care, Delivered with Integrity.</p>
            </div>
          </div>
          <div className="space-y-6">
            <span className="text-xs text-accent font-semibold tracking-widest uppercase block">
              Curated Professional Beauty
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-text-main leading-tight font-normal">
              Simple • Genuine • Affordable <br />
              <span className="italic font-normal text-accent">Professional Care for Everyone</span>
            </h2>
            <p className="text-sm sm:text-base text-text-muted font-light leading-relaxed">
              Founded in Mumbai, <strong>Beauty Looks</strong> was born to solve a real frustration: beauty enthusiasts and salon professionals struggling to find authentic, fresh-batch professional cosmetics without inflated middleman markups or counterfeit fears.
            </p>
            <p className="text-sm sm:text-base text-text-muted font-light leading-relaxed">
              We curate verified salon formulations — from complete bridal facial rituals and restorative hair care to de-tan regimes — directly from official brand partners like Oxylife, QOD Professional, Raaga, Wella, and Luxliss.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link href="/products" className="btn-primary">
                Explore Collection
              </Link>
              <a
                href="https://wa.me/918879655807"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2"
              >
                <MessageCircle size={15} />
                <span>WhatsApp Advisor</span>
              </a>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="border-t border-border pt-12 mb-16">
          <div className="text-center sm:text-left mb-8">
            <span className="subtitle block mb-1">Our Pillars</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-text-main">
              Why Beauty Lovers &amp; Salons Trust Us
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Value 1 */}
            <div className="p-6 border border-border bg-white rounded-2xl space-y-3 shadow-xs">
              <div className="p-3 bg-secondary rounded-xl text-accent inline-block border border-border/60">
                <ShieldCheck size={22} />
              </div>
              <h4 className="font-semibold text-sm text-text-main">100% Genuine Brands</h4>
              <p className="text-xs text-text-muted font-light leading-relaxed">
                We source directly from manufacturers and official distributors to guarantee authentic seals and active stability.
              </p>
            </div>

            {/* Value 2 */}
            <div className="p-6 border border-border bg-white rounded-2xl space-y-3 shadow-xs">
              <div className="p-3 bg-secondary rounded-xl text-accent inline-block border border-border/60">
                <Truck size={22} />
              </div>
              <h4 className="font-semibold text-sm text-text-main">Direct Mumbai Dispatch</h4>
              <p className="text-xs text-text-muted font-light leading-relaxed">
                Fast shipping dispatched within 24 hours across Mumbai, Thane, Navi Mumbai, and all Indian metropolitan regions.
              </p>
            </div>

            {/* Value 3 */}
            <div className="p-6 border border-border bg-white rounded-2xl space-y-3 shadow-xs">
              <div className="p-3 bg-secondary rounded-xl text-accent inline-block border border-border/60">
                <Heart size={22} />
              </div>
              <h4 className="font-semibold text-sm text-text-main">Curated Formulations</h4>
              <p className="text-xs text-text-muted font-light leading-relaxed">
                Handpicked salon kits optimized for Indian climate, humidity protection, and diverse skin types.
              </p>
            </div>

            {/* Value 4 */}
            <div className="p-6 border border-border bg-white rounded-2xl space-y-3 shadow-xs">
              <div className="p-3 bg-secondary rounded-xl text-accent inline-block border border-border/60">
                <Sparkles size={22} />
              </div>
              <h4 className="font-semibold text-sm text-text-main">Personalized Support</h4>
              <p className="text-xs text-text-muted font-light leading-relaxed">
                Direct WhatsApp consultation with our curator team to answer product queries, usage steps, and order tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Curator Profile Section */}
        <div className="border-t border-border pt-12">
          <div className="p-8 sm:p-10 border border-border bg-white rounded-2xl shadow-xs text-center max-w-2xl mx-auto space-y-6">
            <div className="w-20 h-20 bg-secondary rounded-full border border-border flex items-center justify-center mx-auto text-accent shadow-xs">
              <User size={36} strokeWidth={1.5} />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-serif font-normal text-2xl text-text-main">Pramod Thakur</h3>
              <span className="text-[10px] text-accent uppercase tracking-widest font-semibold block">Founder &amp; Curator</span>
            </div>

            <p className="text-sm text-text-muted max-w-lg mx-auto font-light leading-relaxed">
              &ldquo;We built Beauty Looks Mumbai to bridge the gap between salon-grade formulations and everyday accessibility. Our mission is to make authentic treatments directly available at fair prices, backed by personal advice you can rely on.&rdquo;
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <a
                href="https://wa.me/918879655807"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold flex items-center gap-2"
              >
                <MessageCircle size={15} />
                <span>Chat with Pramod</span>
              </a>
              <a
                href="https://www.instagram.com/beauty.looks.mumbai?igsh=MTRjdHh6dDZjZ3UydQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-gold"
              >
                <span>Follow Instagram</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
