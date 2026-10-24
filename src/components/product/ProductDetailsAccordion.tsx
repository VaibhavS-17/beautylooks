'use client';
import React, { useState } from 'react';
import { ChevronDown, CheckCircle2, ShieldCheck, Truck, RefreshCw, MessageCircle } from 'lucide-react';
import { Product } from '@/lib/types';

interface ProductDetailsAccordionProps {
  product: Product;
  commonFaqs?: Array<{ question: string; answer: string }>;
}

export function ProductDetailsAccordion({ product, commonFaqs }: ProductDetailsAccordionProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const DEFAULT_FAQS = [
    {
      question: 'How do I know this product is 100% authentic?',
      answer: 'Beauty Looks Mumbai sources inventory directly from official brand distributors and manufacturer-authorized partners. Every kit and serum includes genuine brand packaging and batch verification codes.',
    },
    {
      question: 'What are your delivery timelines across Mumbai and India?',
      answer: 'Orders are dispatched within 24 hours directly from our Mumbai hub. Standard delivery takes 2-4 business days across India, with expedited same-day/next-day options available for Mumbai, Thane, and Navi Mumbai.',
    },
    {
      question: 'Can I get product guidance or recommendations?',
      answer: 'Yes! Our beauty curators provide complimentary consultation via WhatsApp to help you choose the right facial kit, skin regime, or salon-grade treatment for your skin concern.',
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 7-day hassle-free return or replacement policy on unopened, intact items in their original packaging. For hygiene reasons, opened cosmetic and skincare items cannot be accepted.',
    },
  ];

  const faqsToRender = product.faqs && Array.isArray(product.faqs) && product.faqs.length > 0
    ? product.faqs.map((f: { question: string; answer: string }) => ({ question: f.question, answer: f.answer }))
    : (commonFaqs && Array.isArray(commonFaqs) && commonFaqs.length > 0 ? commonFaqs : DEFAULT_FAQS);

  const isHaircare = product.category?.toLowerCase().includes('hair') || 
                     product.name.toLowerCase().includes('shampoo') || 
                     product.name.toLowerCase().includes('keratin');

  const defaultDescription = isHaircare 
    ? "Crafted with professional-grade salon botanicals and restorative proteins to nourish scalp health and strengthen hair fibers. Sourced directly from verified salon supply distributors."
    : "Professional salon-quality formulation crafted for targeted skin rejuvenation. Tested by beauty professionals and trusted by salons across Mumbai.";

  return (
    <div className="mt-16 sm:mt-20 space-y-16">
      {/* Formulation & Sourcing */}
      <div className="pt-10 border-t border-border">
        <h2 className="font-serif text-2xl text-text-main mb-6 font-normal">Formulation &amp; Professional Standard</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          <div className="md:col-span-7 space-y-4">
            <p className="text-sm sm:text-base text-text-muted font-light leading-relaxed">
              {product.description}
            </p>
            <p className="text-sm text-text-muted font-light leading-relaxed">
              {defaultDescription}
            </p>
            <div className="pt-4 space-y-2.5">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-accent shrink-0" />
                <span className="text-sm text-text-main">100% Genuine product sourced directly from official brand distributors</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-accent shrink-0" />
                <span className="text-sm text-text-main">Fresh batch stock with intact seal and manufacturer warranty</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-accent shrink-0" />
                <span className="text-sm text-text-main">Direct Mumbai dispatch with careful protective packaging</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 space-y-6 bg-secondary/40 p-6 sm:p-8 rounded-2xl border border-border">
            <div>
              <h3 className="text-[10px] font-bold text-accent mb-3 uppercase tracking-widest">Targeted Actives</h3>
              <div className="flex flex-wrap gap-2">
                {isHaircare ? (
                  <>
                    <span className="px-3 py-1.5 border border-border text-[10px] font-semibold text-text-main tracking-widest uppercase bg-white rounded-lg">Keratin</span>
                    <span className="px-3 py-1.5 border border-border text-[10px] font-semibold text-text-main tracking-widest uppercase bg-white rounded-lg">Argan Oil</span>
                    <span className="px-3 py-1.5 border border-border text-[10px] font-semibold text-text-main tracking-widest uppercase bg-white rounded-lg">Biotin</span>
                  </>
                ) : (
                  <>
                    <span className="px-3 py-1.5 border border-border text-[10px] font-semibold text-text-main tracking-widest uppercase bg-white rounded-lg">Hyaluronic</span>
                    <span className="px-3 py-1.5 border border-border text-[10px] font-semibold text-text-main tracking-widest uppercase bg-white rounded-lg">Vitamin C</span>
                    <span className="px-3 py-1.5 border border-border text-[10px] font-semibold text-text-main tracking-widest uppercase bg-white rounded-lg">Botanical Actives</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-accent mb-3 uppercase tracking-widest">Our Authenticity Guarantee</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-accent shrink-0" />
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-text-main">Genuine Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={15} className="text-accent shrink-0" />
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-text-main">Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw size={15} className="text-accent shrink-0" />
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-text-main">7-Day Return</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle size={15} className="text-accent shrink-0" />
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-text-main">Curator Advice</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="pt-10 border-t border-border">
        <h2 className="font-serif text-2xl text-text-main mb-4 font-normal">Complete Ingredients &amp; Usage</h2>
        <div className="max-w-3xl text-sm text-text-muted font-light leading-relaxed space-y-3">
          <p>
            {product.ingredients || 'Aqua, Glycerin, Niacinamide, Sodium Hyaluronate, Botanical Extracts, Tocopherol Acetate, Panthenol, Phenoxyethanol.'}
          </p>
          <p className="italic text-xs text-text-muted/80">
            Always inspect physical product packaging for the batch-specific ingredient list and instructions for use.
          </p>
        </div>
      </div>

      {/* FAQs */}
      <div className="pt-10 border-t border-border" id="faqs">
        <h2 className="font-serif text-2xl text-text-main mb-6 font-normal">Frequently Asked Questions</h2>
        <div className="space-y-3 max-w-3xl">
          {faqsToRender.map((faq, idx) => (
            <div key={idx} className="border border-border rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                id={`faq-btn-${idx}`}
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-secondary/30 hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-expanded={openFaqIndex === idx}
                aria-controls={`faq-panel-${idx}`}
              >
                <span className="text-sm font-medium text-text-main">{faq.question}</span>
                <ChevronDown
                  size={16}
                  className={`text-text-muted transition-transform duration-300 shrink-0 ${
                    openFaqIndex === idx ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
              <div
                id={`faq-panel-${idx}`}
                role="region"
                aria-labelledby={`faq-btn-${idx}`}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  openFaqIndex === idx ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden min-h-0">
                  <p className="p-4 sm:p-5 text-sm text-text-muted font-light leading-relaxed border-t border-border/50">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
