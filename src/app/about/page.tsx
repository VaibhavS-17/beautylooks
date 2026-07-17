'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, Sparkles, Star, User, Heart, MessageCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-[#FCFBF9] py-12 text-left">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-[#EFECE6] pb-6 mb-12">
          <h1 className="text-3xl sm:text-3xl md:text-4xl font-semibold font-display text-gold-gradient">
            About Us
          </h1>
          <p className="text-xs text-[#8A8177] mt-2 font-light">
            The story behind Mumbai's trusted destination for premium and genuine beauty cosmetics.
          </p>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-neutral-900 border border-[#EFECE6] shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#722F37] to-[#C9A94E] opacity-35" />
            <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-4xl md:text-6xl font-bold font-display text-white/5 select-none uppercase tracking-widest">
              Glow
            </div>
          </div>
          <div className="space-y-6">
            <span className="text-xs text-[#9A7B2F] font-semibold tracking-widest uppercase">
              Beauty Looks Mumbai
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-[#1A1A1A] leading-tight">
              Simple • Genuine • Affordable <br />
              <span className="text-gold-gradient">Skincare Curated For You</span>
            </h2>
            <p className="text-sm sm:text-base text-[#5C554D] font-light leading-relaxed">
              Founded in the heart of Mumbai, <strong>Beauty Looks Mumbai</strong> is your trusted online destination for premium, 100% genuine cosmetics and skin care products. We curate the finest collection of bridal facial kits, advanced facial serums, and clarifying cleansers from leading Indian and global brands.
            </p>
            <p className="text-sm sm:text-base text-[#5C554D] font-light leading-relaxed">
              Our mission is simple: to make professional, salon-quality self-care accessible and affordable for every woman. We eliminate middleman fees to offer genuine brand products with fast, reliable local shipping.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="border-t border-[#EFECE6] pt-12 mb-16">
          <h3 className="font-display text-2xl font-semibold text-[#1A1A1A] mb-8 text-center sm:text-left">
            Why Beauty Lovers Trust Us
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Value 1 */}
            <div className="glass-card p-6 border border-[#EFECE6] bg-white text-center space-y-3 shadow-sm">
              <div className="p-3 bg-[#F9F7F3] rounded-full border border-[#C9A94E20] text-[#9A7B2F] inline-block">
                <ShieldCheck size={24} />
              </div>
              <h4 className="font-semibold text-sm text-[#1A1A1A]">100% Genuine Brands</h4>
              <p className="text-xs text-[#706A60] font-light leading-relaxed">
                We source products directly from manufacturers and official distributors to guarantee 100% authenticity.
              </p>
            </div>

            {/* Value 2 */}
            <div className="glass-card p-6 border border-[#EFECE6] bg-white text-center space-y-3 shadow-sm">
              <div className="p-3 bg-[#F9F7F3] rounded-full border border-[#C9A94E20] text-[#9A7B2F] inline-block">
                <Truck size={24} />
              </div>
              <h4 className="font-semibold text-sm text-[#1A1A1A]">Fast Delivery</h4>
              <p className="text-xs text-[#706A60] font-light leading-relaxed">
                Reliable standard and same-day delivery service across Mumbai, Thane, and Navi Mumbai regions.
              </p>
            </div>

            {/* Value 3 */}
            <div className="glass-card p-6 border border-[#EFECE6] bg-white text-center space-y-3 shadow-sm">
              <div className="p-3 bg-[#F9F7F3] rounded-full border border-[#C9A94E20] text-[#9A7B2F] inline-block">
                <Heart size={24} />
              </div>
              <h4 className="font-semibold text-sm text-[#1A1A1A]">Curated Skincare</h4>
              <p className="text-xs text-[#706A60] font-light leading-relaxed">
                Handpicked sets optimized to combat humidity and address skin concerns for diverse skin types.
              </p>
            </div>

            {/* Value 4 */}
            <div className="glass-card p-6 border border-[#EFECE6] bg-white text-center space-y-3 shadow-sm">
              <div className="p-3 bg-[#F9F7F3] rounded-full border border-[#C9A94E20] text-[#9A7B2F] inline-block">
                <Sparkles size={24} />
              </div>
              <h4 className="font-semibold text-sm text-[#1A1A1A]">Premium Support</h4>
              <p className="text-xs text-[#706A60] font-light leading-relaxed">
                Direct WhatsApp consultation with our curator team to answer product query calls and guide orders.
              </p>
            </div>
          </div>
        </div>

        {/* Curator Profile Section */}
        <div className="border-t border-[#EFECE6] pt-12">
          <div className="glass-card p-8 border border-[#EFECE6] bg-[#F9F7F3] rounded-2xl shadow-sm text-center max-w-2xl mx-auto space-y-6 relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#C9A94E] rounded-full filter blur-[80px] opacity-10" />
            
            <div className="w-20 h-20 bg-white rounded-full border-2 border-[#C9A94E] flex items-center justify-center mx-auto text-[#9A7B2F] shadow-sm">
              <User className="text-[#C9A94E]" size={36} />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-xl text-[#1A1A1A]">Pramod Thakur</h3>
              <span className="text-[10px] text-[#9A7B2F] uppercase tracking-wider font-semibold">Founder & Curator</span>
            </div>

            <p className="text-sm text-[#5C554D] max-w-lg mx-auto font-light leading-relaxed">
              "We built Beauty Looks Mumbai to bridge the gap between quality skincare and affordability. Our goal is to bring salon-quality treatments directly into your home with products that are tested, genuine, and trusted by hundreds of beauty enthusiasts across Mumbai."
            </p>

            <div className="flex justify-center space-x-4 pt-2">
              <a
                href="https://wa.me/918879655807"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-xs py-3 px-6 flex items-center space-x-2 shadow-sm"
              >
                <MessageCircle size={14} className="fill-current text-[#FFFFFF]" />
                <span>Chat with Pramod</span>
              </a>
              <a
                href="https://www.instagram.com/beauty.looks.mumbai?igsh=MTRjdHh6dDZjZ3UydQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-gold text-xs py-3 px-6 bg-white"
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
