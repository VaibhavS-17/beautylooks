'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, ShieldCheck, Truck, RotateCcw, Sparkles } from 'lucide-react';

interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'Orders & Shipping',
    question: 'How long does delivery take within Mumbai?',
    answer:
      'Standard shipping across Mumbai typically takes 2–4 business days. For select Mumbai pincodes, express same-day or next-day delivery is available at checkout. Orders over ₹499 qualify for complimentary standard shipping.',
  },
  {
    category: 'Orders & Shipping',
    question: 'Do you ship outside Mumbai?',
    answer:
      'Yes! While our flagship logistics center is based in Mumbai, we ship all across India. All-India standard shipping takes 4–6 business days depending on your location.',
  },
  {
    category: 'Orders & Shipping',
    question: 'How can I track my order status?',
    answer:
      'Once your order is dispatched, you will receive an SMS and email notification with your live tracking link. You can also view real-time updates in your account order history.',
  },
  {
    category: 'Returns & Refunds',
    question: 'What is your return policy?',
    answer:
      'We accept returns of unopened, unused products in their original packaging within 7 days of delivery. Due to strict hygiene protocols for skincare and cosmetics, opened or tested items cannot be returned unless damaged in transit.',
  },
  {
    category: 'Returns & Refunds',
    question: 'What if I receive a damaged or incorrect product?',
    answer:
      'If your parcel arrives damaged or with an incorrect item, please contact our support team within 48 hours of delivery with clear photographs of the packaging and product. We will arrange a free replacement or instant refund.',
  },
  {
    category: 'Product & Formulation',
    question: 'Are Beauty Looks Mumbai products dermatologically tested?',
    answer:
      'Yes, every formula undergoes rigorous dermatological safety testing. However, we always recommend performing a patch test on the inner forearm 24 hours prior to full face application.',
  },
  {
    category: 'Product & Formulation',
    question: 'Are your products 100% vegan and cruelty-free?',
    answer:
      'Absolutely. We are proud to be 100% certified cruelty-free. We never test on animals at any stage of development, and our formulations are 100% vegan.',
  },
  {
    category: 'Product & Formulation',
    question: 'Can I layer these products with other skincare active ingredients?',
    answer:
      'Yes! Our serums, creams, and cleansers are formulated to integrate smoothly into any daily regimen. For best absorption, apply products from thinnest to thickest consistency.',
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Orders & Shipping', 'Returns & Refunds', 'Product & Formulation'];

  const filteredFaqs = selectedCategory === 'All'
    ? FAQ_ITEMS
    : FAQ_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-brand-light py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent block mb-3">
            Customer Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-text-main font-bold tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-text-muted mt-4 max-w-xl mx-auto font-light leading-relaxed">
            Everything you need to know about our formulations, Mumbai shipping timelines, and returns.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setOpenIndex(null);
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? 'bg-text-main text-white shadow-md'
                  : 'bg-white border border-border text-text-muted hover:text-text-main hover:border-text-main'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <details
                key={idx}
                className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                open={isOpen}
                onToggle={(e) => {
                  if ((e.target as HTMLDetailsElement).open) {
                    setOpenIndex(idx);
                  } else if (openIndex === idx) {
                    setOpenIndex(null);
                  }
                }}
              >
                <summary
                  className="w-full flex items-center justify-between p-6 text-left gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent list-none [&::-webkit-details-marker]:hidden"
                >
                  <span className="text-sm sm:text-base font-semibold text-text-main">
                    {faq.question}
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-open:bg-text-main group-open:text-white group-open:rotate-180 bg-secondary text-text-muted"
                  >
                    <ChevronDown size={16} />
                  </div>
                </summary>
                <div className="px-6 pb-6 pt-1 border-t border-border/40 text-sm text-text-muted font-light leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            );
          })}
        </div>

        {/* Still need help CTA */}
        <div className="mt-16 bg-white border border-border rounded-3xl p-8 sm:p-10 text-center">
          <HelpCircle className="w-10 h-10 text-accent mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text-main mb-2">Still Have Questions?</h3>
          <p className="text-sm text-text-muted font-light max-w-md mx-auto mb-6">
            Our beauty specialists are available Monday to Saturday to assist you with personalized recommendations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 bg-text-main text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/shipping"
              className="px-6 py-3 border border-border text-text-main text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-secondary transition-colors"
            >
              Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
