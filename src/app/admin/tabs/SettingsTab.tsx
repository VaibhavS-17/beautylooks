'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';

interface SettingsTabProps {
  siteSettings: {
    hero_title: string;
    hero_subtitle: string;
    hero_description: string;
    hero_image_url: string;
    hero_mobile_image_url?: string;
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
  const [uploadedHeroMobileImg, setUploadedHeroMobileImg] = useState(siteSettings.hero_mobile_image_url || '');


  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <h2 className="text-2xl font-bold font-display">Store Showcase Editor</h2>
        <p className="text-sm text-[#8A8177]">Edit homepage banners and call-to-actions.</p>
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

          <div className="col-span-2 md:col-span-1">
            <ImageUploader
              label="Hero Background Banner Image (Desktop - 16:9 Landscape)"
              folder="hero"
              currentValue={uploadedHeroImg}
              onChange={setUploadedHeroImg}
              required
            />
            <input type="hidden" name="heroImageUrl" value={uploadedHeroImg} />
          </div>

          <div className="col-span-2 md:col-span-1">
            <ImageUploader
              label="Hero Background Banner Image (Mobile - 9:16 Portrait)"
              folder="hero"
              currentValue={uploadedHeroMobileImg}
              onChange={setUploadedHeroMobileImg}
            />
            <input type="hidden" name="heroMobileImageUrl" value={uploadedHeroMobileImg} />
          </div>
        </div>



        <div className="flex justify-end pt-4 border-t border-[#EFECE6]">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#CA8A04] hover:bg-[#1C1917] text-white text-xs px-6 py-3 font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
          >
            {loading && <Loader2 size={12} className="animate-spin" />}
            <span>{loading ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
