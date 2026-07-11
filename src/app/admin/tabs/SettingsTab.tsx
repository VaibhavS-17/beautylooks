'use client';

import React, { useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';

interface SettingsTabProps {
  siteSettings: {
    hero_title: string;
    hero_subtitle: string;
    hero_description: string;
    hero_image_url: string;
    hero_button_text: string;
    hero_button_link: string;
    common_faqs?: Array<{ question: string; answer: string }>;
  };
  handleSettingsSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
}

export default function SettingsTab({
  siteSettings,
  handleSettingsSubmit,
  loading
}: SettingsTabProps) {
  const [uploadedHeroImg, setUploadedHeroImg] = useState(siteSettings.hero_image_url);
  const [commonFaqsList, setCommonFaqsList] = useState<Array<{ question: string; answer: string }>>(
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

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <h2 className="text-2xl font-bold font-display">Store Showcase & Storewide FAQs Editor</h2>
        <p className="text-sm text-[#8A8177]">Edit homepage banners, call-to-actions, and storewide product FAQs.</p>
      </div>

      <form onSubmit={handleSettingsSubmit} className="bg-white border border-[#EFECE6] p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col col-span-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Hero Title</label>
            <input 
              type="text" 
              name="heroTitle" 
              defaultValue={siteSettings.hero_title} 
              required 
              className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" 
            />
          </div>

          <div className="flex flex-col col-span-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Hero Subtitle</label>
            <input 
              type="text" 
              name="heroSubtitle" 
              defaultValue={siteSettings.hero_subtitle} 
              required 
              className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" 
            />
          </div>

          <div className="flex flex-col col-span-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Hero Tagline / Description</label>
            <textarea 
              name="heroDescription" 
              defaultValue={siteSettings.hero_description} 
              required 
              rows={3} 
              className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" 
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Button Call-To-Action Text</label>
            <input 
              type="text" 
              name="heroButtonText" 
              defaultValue={siteSettings.hero_button_text} 
              required 
              className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" 
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Button Target Link</label>
            <input 
              type="text" 
              name="heroButtonLink" 
              defaultValue={siteSettings.hero_button_link} 
              required 
              className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" 
            />
          </div>

          <div className="col-span-2">
            <ImageUploader
              label="Hero Background Banner Image"
              folder="hero"
              currentValue={uploadedHeroImg}
              onChange={setUploadedHeroImg}
              required
            />
            <input type="hidden" name="heroImageUrl" value={uploadedHeroImg} />
          </div>
        </div>

        {/* Storewide Common Product FAQs Repeater */}
        <div className="space-y-4 pt-6 border-t border-[#EFECE6]">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#1C1917]">Storewide Common Product FAQs</h3>
              <p className="text-xs text-[#8A8177]">These FAQs appear on all product pages unless overridden by custom product-specific FAQs.</p>
            </div>
            <button
              type="button"
              onClick={() => setCommonFaqsList([...commonFaqsList, { question: '', answer: '' }])}
              className="text-xs font-bold uppercase tracking-wider text-[#CA8A04] hover:text-[#1C1917] transition-colors flex items-center gap-1.5 bg-[#FBF9F6] border border-[#EFECE6] px-3 py-1.5 rounded-lg"
            >
              <Plus size={14} /> Add FAQ
            </button>
          </div>

          <input
            type="hidden"
            name="commonFaqs"
            value={JSON.stringify(
              commonFaqsList.filter((f) => f.question.trim() && f.answer.trim())
            )}
          />

          <div className="space-y-3">
            {commonFaqsList.map((faq, idx) => (
              <div key={idx} className="p-4 bg-[#FBF9F6] border border-[#EFECE6] rounded-xl space-y-2 relative">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8177]">FAQ #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => setCommonFaqsList(commonFaqsList.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-700 text-xs p-1"
                    title="Remove FAQ"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Question (e.g. Is this product suitable for sensitive skin?)"
                  value={faq.question}
                  onChange={(e) => {
                    const updated = [...commonFaqsList];
                    updated[idx] = { ...updated[idx], question: e.target.value };
                    setCommonFaqsList(updated);
                  }}
                  className="w-full text-xs py-2 px-3 border border-[#EFECE6] rounded-lg focus:border-[#CA8A04] outline-none bg-white font-medium"
                />
                <textarea
                  rows={2}
                  placeholder="Answer..."
                  value={faq.answer}
                  onChange={(e) => {
                    const updated = [...commonFaqsList];
                    updated[idx] = { ...updated[idx], answer: e.target.value };
                    setCommonFaqsList(updated);
                  }}
                  className="w-full text-xs py-2 px-3 border border-[#EFECE6] rounded-lg focus:border-[#CA8A04] outline-none bg-white"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#EFECE6]">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#CA8A04] hover:bg-[#1C1917] text-white text-xs px-6 py-3 font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
          >
            {loading && <Loader2 size={12} className="animate-spin" />}
            <span>{loading ? 'Saving Settings...' : 'Save Settings & FAQs'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
