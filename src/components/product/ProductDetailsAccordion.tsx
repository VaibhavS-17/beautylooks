'use client';
import React, { useState } from 'react';
import { ChevronDown, CheckCircle2, Leaf, Ban, Rabbit, Sparkles } from 'lucide-react';
import { Product } from '@/lib/types';

interface ProductDetailsAccordionProps {
  product: Product;
  commonFaqs?: Array<{ question: string; answer: string }>;
}

export function ProductDetailsAccordion({ product, commonFaqs }: ProductDetailsAccordionProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const DEFAULT_FAQS = [
    {
      question: 'Is this product suitable for sensitive skin?',
      answer: 'Yes, all our formulations are dermatologically tested and crafted with gentle botanical actives. We recommend a quick patch test prior to full application.',
    },
    {
      question: 'What are your shipping timelines and return policy?',
      answer: 'We dispatch within 24 hours. Express delivery takes 2-4 business days across India. We offer a 7-day hassle-free return policy on unopened items.',
    },
    {
      question: 'Are your products 100% vegan and cruelty-free?',
      answer: 'Absolutely. Beauty Looks Mumbai is certified cruelty-free and 100% vegan with zero animal testing.',
    },
    {
      question: 'How long until I see visible results?',
      answer: 'Most users notice improved hydration and radiance immediately. For significant changes in tone and texture, consistent daily use for 2 to 4 weeks is recommended.',
    },
  ];

  const faqsToRender = product.faqs && Array.isArray(product.faqs) && product.faqs.length > 0
    ? product.faqs.map((f: { question: string; answer: string }) => ({ question: f.question, answer: f.answer }))
    : (commonFaqs && Array.isArray(commonFaqs) && commonFaqs.length > 0 ? commonFaqs : DEFAULT_FAQS);

  return (
    <div className="mt-20 space-y-20">
      <div className="pt-12 border-t border-border">
        <h2 className="font-display text-2xl text-text-main mb-8">Formulation &amp; Efficacy</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-7 space-y-6">
            <p className="text-base text-text-muted font-light leading-relaxed">
              {product.description}
            </p>
            <p className="text-sm text-text-muted font-light leading-relaxed">
              Crafted using clinical-grade botanicals and dermatologically verified actives, this formula penetrates deeply to nourish and restore balance. Formulated to integrate effortlessly into both morning and evening skincare rituals.
            </p>
            <div className="pt-4 space-y-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-accent shrink-0" />
                <span className="text-sm text-text-main">Dermatologically tested and non-comedogenic</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-accent shrink-0" />
                <span className="text-sm text-text-main">Free from artificial dyes, sulfates, and harsh fillers</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-accent shrink-0" />
                <span className="text-sm text-text-main">Eco-conscious glass vessel preserves active stability</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 space-y-8 bg-[#FAFAF9] p-8 border border-border">
            <div>
              <h3 className="text-[10px] font-bold text-text-muted mb-4 uppercase tracking-widest">Premium Actives</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 border border-border text-[10px] font-semibold text-text-main tracking-widest uppercase bg-white">Hyaluronic Acid</span>
                <span className="px-3 py-1.5 border border-border text-[10px] font-semibold text-text-main tracking-widest uppercase bg-white">Vitamin C</span>
                <span className="px-3 py-1.5 border border-border text-[10px] font-semibold text-text-main tracking-widest uppercase bg-white">24K Gold Extracts</span>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-text-muted mb-4 uppercase tracking-widest">Our Promise</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                <div className="flex items-center gap-2">
                  <Leaf size={14} className="text-text-muted" strokeWidth={1.5} />
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-text-main">100% Vegan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ban size={14} className="text-text-muted" strokeWidth={1.5} />
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-text-main">Paraben-Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <Rabbit size={14} className="text-text-muted" strokeWidth={1.5} />
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-text-main">Cruelty-Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-text-muted" strokeWidth={1.5} />
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-text-main">Authentic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-12 border-t border-border">
        <h2 className="font-display text-2xl text-text-main mb-6">Complete Ingredients</h2>
        <div className="max-w-3xl text-sm text-text-muted font-light leading-relaxed space-y-3">
          <p>
            {product.ingredients || 'Aqua/Water/Eau, Glycerin, Niacinamide, Squalane, Butylene Glycol, Caprylic/Capric Triglyceride, Sodium Hyaluronate, Tocopherol, Allantoin, Panthenol, Phenoxyethanol, Ethylhexylglycerin.'}
          </p>
          <p className="italic text-xs text-text-muted">
            Please refer to the physical product packaging for the most accurate and up-to-date list of ingredients.
          </p>
        </div>
      </div>

      <div className="pt-12 border-t border-border">
        <h2 className="font-display text-2xl text-text-main mb-6">Shipping &amp; Returns</h2>
        <div className="max-w-3xl text-sm text-text-muted font-light leading-relaxed space-y-4">
          <p>
            <strong>Standard Delivery:</strong> 2-4 business days across India. Complimentary shipping on orders above ₹499.
          </p>
          <p>
            <strong>Express Delivery:</strong> Same-day or next-day delivery available for select Mumbai and NCR pin codes.
          </p>
          <p>
            <strong>Returns Policy:</strong> We accept returns of unopened and unused items within 7 days of delivery. For hygiene and safety reasons, opened skincare products cannot be returned.
          </p>
        </div>
      </div>

      <div className="pt-12 border-t border-border" id="faqs">
        <h2 className="font-display text-2xl text-text-main mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3 max-w-3xl">
          {faqsToRender.map((faq, idx) => (
            <div key={idx} className="border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left bg-[#FAFAF9] hover:bg-white transition-colors"
              >
                <span className="text-sm font-medium text-text-main">{faq.question}</span>
                <ChevronDown
                  size={16}
                  className={`text-text-muted transition-transform duration-300 shrink-0 ${
                    openFaqIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  openFaqIndex === idx ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-5 pb-5 text-sm text-text-muted font-light leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
