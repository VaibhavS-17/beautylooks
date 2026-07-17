'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SettingsTab from '../tabs/SettingsTab';
import { updateSiteSettings } from '@/app/actions/adminActions';

interface SiteSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_image_url: string;
  hero_button_text: string;
  hero_button_link: string;
  common_faqs?: Array<{ question: string; answer: string }>;
}

export default function SettingsClient({ initialSettings }: { initialSettings: SiteSettings }) {
  const router = useRouter();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSettings);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setSiteSettings(initialSettings);
  }, [initialSettings]);

  const handleSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await updateSiteSettings(formData);
      if (res && res.error) {
        alert(res.error);
      } else {
        alert('Settings updated successfully!');
        router.refresh();
      }
    } catch (err) {
      console.error('Save settings error:', err);
      alert('An error occurred while saving store settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsTab
      siteSettings={siteSettings}
      handleSettingsSubmit={handleSettingsSubmit}
      loading={loading}
    />
  );
}
