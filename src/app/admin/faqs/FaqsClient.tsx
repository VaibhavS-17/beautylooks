'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FaqsTab from '../tabs/FaqsTab';

interface SiteSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
    hero_image_url: string;
    hero_mobile_image_url?: string;
    hero_button_text: string;
    hero_button_link: string;
  common_faqs?: Array<{ question: string; answer: string }>;
}

export default function FaqsClient({ initialSettings }: { initialSettings: SiteSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);

  React.useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const triggerToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast(null);
    }, 4000);
    router.refresh();
  };

  return (
    <div className="relative">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-semibold flex items-center space-x-2 animate-fade-in ${
          toast.isError ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}
      <FaqsTab
        siteSettings={settings}
        triggerToast={triggerToast}
      />
    </div>
  );
}
