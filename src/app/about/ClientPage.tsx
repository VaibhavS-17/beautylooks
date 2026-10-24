'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, Sparkles, User, Heart, MessageCircle } from 'lucide-react';

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

        {/* Brand Mission & Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-sm">
            <Image
              src="/images/hero-beauty.png"
              alt="Beauty Looks Mumbai Cosmetics"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent block mb-1">
                Authentic Salon Formulations
              </span>
              <p className="font-serif text-lg md:text-xl font-normal leading-snug">
                Supplying verified salon aesthetics directly to beauty professionals and consumers across India.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <span className="subtitle block">Our Commitment</span>
            <h2 className="text-2xl sm:text-3xl font-serif text-text-main font-normal">
              Direct Access to Professional-Grade Formulations
            </h2>
            <div className="space-y-4 text-sm text-text-muted leading-relaxed font-light">
              <p>
                Founded in Mumbai, <strong className="text-text-main font-medium">Beauty Looks</strong> was established to bridge the gap between high-performance salon products and at-home beauty rituals. Many professional formulations—from Brazilian keratin treatments and herbal facials to salon bridal preparations—were previously difficult for individuals to purchase with authenticity guarantees.
              </p>
              <p>
                We work directly with authorized distributors and manufacturers including Oxylife, Raaga Professional, QOD Professional, Wella, Fem, and Luxliss. Every item in our catalog is guaranteed 100% genuine, stored in temperature-controlled facilities, and dispatched with fast courier tracking.
              </p>
              <p>
                Whether you run an independent salon or take pride in an advanced skincare regimen, we provide honest pricing, batch integrity, and direct guidance from beauty specialists.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="btn-primary text-xs uppercase tracking-widest px-6 py-3.5 rounded-full inline-block"
              >
                Explore The Catalog
              </Link>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs uppercase tracking-widest px-6 py-3.5 rounded-full inline-flex items-center gap-2"
              >
                <MessageCircle size={14} className="text-accent" />
                <span>Consult Our Curator</span>
              </a>
            </div>
          </div>
        </div>

        {/* Founder & Mumbai Roots */}
        <div className="my-16 p-8 md:p-12 rounded-2xl bg-secondary/70 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-1 text-center md:text-left">
              <div className="w-20 h-20 rounded-full bg-primary border border-border flex items-center justify-center mx-auto md:mx-0 mb-4 text-accent">
                <User size={36} />
              </div>
              <h3 className="font-serif text-xl text-text-main font-normal">Pramod Thakur</h3>
              <p className="text-xs uppercase tracking-widest text-accent mt-0.5 font-medium">Founder &amp; Managing Director</p>
              <p className="text-xs text-text-muted mt-2">Beauty Looks Mumbai</p>
            </div>
            <div className="md:col-span-2 space-y-3 text-sm text-text-muted font-light leading-relaxed">
              <p className="italic text-text-main font-serif text-base">
                &ldquo;Our promise has always been simple: zero counterfeits, honest salon pricing, and respectful guidance for everyone who trusts us with their beauty routine.&rdquo;
              </p>
              <p>
                Operating in the heart of Mumbai, Pramod oversees every brand partnership and supply-chain relationship personally. His focus is on ensuring that salon owners and individual clients alike receive the freshest batches, reliable doorstep delivery, and dedicated customer support.
              </p>
            </div>
          </div>
        </div>

        {/* Brand Pillars */}
        <div className="my-16">
          <div className="text-center mb-12">
            <span className="subtitle block mb-2">Why Choose Us</span>
            <h2 className="text-2xl sm:text-3xl font-serif text-text-main font-normal">
              Built on Trust &amp; Authenticity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-accent">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-serif text-lg text-text-main font-normal">100% Genuine Inventory</h4>
              <p className="text-xs text-text-muted leading-relaxed font-light">
                Directly procured from verified brand distributors with intact seal and batch verification numbers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-accent">
                <Truck size={20} />
              </div>
              <h4 className="font-serif text-lg text-text-main font-normal">Express Regional Shipping</h4>
              <p className="text-xs text-text-muted leading-relaxed font-light">
                Next-day dispatches across Mumbai and fast insured delivery across India with live order tracking.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-accent">
                <Sparkles size={20} />
              </div>
              <h4 className="font-serif text-lg text-text-main font-normal">Salon-Trained Support</h4>
              <p className="text-xs text-text-muted leading-relaxed font-light">
                Have questions about keratin aftercare or facial kit steps? Connect with our team for personalized recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Values Footer Banner */}
        <div className="mt-16 text-center border-t border-border pt-12">
          <Heart size={24} className="text-accent mx-auto mb-3" />
          <p className="text-xs uppercase tracking-[0.25em] text-text-muted">
            Crafted for salons. Perfected for you.
          </p>
        </div>

      </div>
    </div>
  );
}
