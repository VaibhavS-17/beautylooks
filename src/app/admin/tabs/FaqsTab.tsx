'use client';

import React, { useState } from 'react';
import { Plus, Trash2, HelpCircle, Save, Loader2 } from 'lucide-react';
import { updateSiteSettings } from '@/app/actions/adminActions';

interface FaqsTabProps {
  siteSettings: {
    hero_title: string;
    hero_subtitle: string;
    hero_description: string;
    hero_image_url: string;
    hero_button_text: string;
    hero_button_link: string;
    common_faqs?: Array<{ question: string; answer: string }>;
  };
  triggerToast: (message: string, isError?: boolean) => void;
}

export default function FaqsTab({
  siteSettings,
  triggerToast,
}: FaqsTabProps) {
  const [faqsList, setFaqsList] = useState<Array<{ question: string; answer: string }>>(
    siteSettings.common_faqs || [
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
    ]
  );
  const [saving, setSaving] = useState(false);

  const handleSaveFaqs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    formData.append('heroTitle', siteSettings.hero_title || 'Beauty Looks Mumbai');
    formData.append('heroSubtitle', siteSettings.hero_subtitle || 'GENUINE • SIMPLE • AFFORDABLE');
    formData.append('heroDescription', siteSettings.hero_description || 'Curated luxury skincare and cosmetics.');
    formData.append('heroImageUrl', siteSettings.hero_image_url || '');
    formData.append('heroButtonText', siteSettings.hero_button_text || 'SHOP NOW');
    formData.append('heroButtonLink', siteSettings.hero_button_link || '/products');
    formData.append(
      'commonFaqs',
      JSON.stringify(faqsList.filter((f) => f.question.trim() && f.answer.trim()))
    );

    const res = await updateSiteSettings(formData);
    setSaving(false);

    if (res.error) {
      triggerToast(res.error, true);
    } else {
      triggerToast('Storewide Common FAQs updated successfully!');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="text-[#CA8A04]" size={24} />
            <h2 className="text-2xl font-bold font-display text-[#1C1917]">Storewide Common Product FAQs</h2>
          </div>
          <p className="text-sm text-[#8A8177]">
            Manage the universal frequently asked questions displayed across all product detail pages on the storefront.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFaqsList([...faqsList, { question: '', answer: '' }])}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#CA8A04] hover:bg-[#A16D03] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
        >
          <Plus size={16} /> Add New FAQ
        </button>
      </div>

      <div className="bg-white border border-[#EFECE6] p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
          <p className="font-semibold">💡 How Common FAQs Work:</p>
          <p>
            Every product detail page automatically displays these questions and answers at the bottom of the page, unless a product has its own custom FAQs defined inside the product editor.
          </p>
        </div>

        <form onSubmit={handleSaveFaqs} className="space-y-4">
          {faqsList.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-[#EFECE6] rounded-2xl text-[#8A8177]">
              <HelpCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No common FAQs configured yet.</p>
              <button
                type="button"
                onClick={() => setFaqsList([{ question: '', answer: '' }])}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1C1917] text-white text-xs font-semibold rounded-xl"
              >
                <Plus size={14} /> Add First FAQ
              </button>
            </div>
          )}

          <div className="space-y-4">
            {faqsList.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#FBF9F6] border border-[#EFECE6] rounded-xl space-y-3 relative hover:border-[#CA8A04]/40 transition-colors"
              >
                <div className="flex justify-between items-center border-b border-[#EFECE6] pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#1C1917] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#CA8A04] text-white flex items-center justify-center text-[11px]">
                      {idx + 1}
                    </span>
                    Question #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFaqsList(faqsList.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove FAQ"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C554D] mb-1">
                    Question Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Is this product suitable for sensitive skin?"
                    value={faq.question}
                    onChange={(e) => {
                      const updated = [...faqsList];
                      updated[idx] = { ...updated[idx], question: e.target.value };
                      setFaqsList(updated);
                    }}
                    required
                    className="w-full text-sm font-medium py-2.5 px-3.5 bg-white border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C554D] mb-1">
                    Answer Content
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide a clear, helpful answer..."
                    value={faq.answer}
                    onChange={(e) => {
                      const updated = [...faqsList];
                      updated[idx] = { ...updated[idx], answer: e.target.value };
                      setFaqsList(updated);
                    }}
                    required
                    className="w-full text-sm py-2.5 px-3.5 bg-white border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-end border-t border-[#EFECE6]">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#CA8A04] hover:bg-[#A16D03] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving Common FAQs...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Storewide FAQs
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
