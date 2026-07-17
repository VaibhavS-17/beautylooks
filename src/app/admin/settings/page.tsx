import React from 'react';
import { createClient } from '@/lib/supabase/server';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: siteSettingsData, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  if (error) {
    console.error('Error fetching site settings:', error);
  }

  const mappedSettings = siteSettingsData ? {
    hero_title: siteSettingsData.hero_title || 'Beauty Looks Mumbai',
    hero_subtitle: siteSettingsData.hero_subtitle || 'GENUINE • SIMPLE • AFFORDABLE',
    hero_description: siteSettingsData.hero_description || 'Curated luxury skincare and cosmetics.',
    hero_image_url: siteSettingsData.hero_image_url || '',
    hero_button_text: siteSettingsData.hero_button_text || 'SHOP NOW',
    hero_button_link: siteSettingsData.hero_button_link || '/products',
    common_faqs: siteSettingsData.common_faqs || [],
  } : {
    hero_title: 'Beauty Looks Mumbai',
    hero_subtitle: 'GENUINE • SIMPLE • AFFORDABLE',
    hero_description: 'Curated luxury skincare and cosmetics.',
    hero_image_url: '',
    hero_button_text: 'SHOP NOW',
    hero_button_link: '/products',
    common_faqs: [],
  };

  return <SettingsClient initialSettings={mappedSettings} />;
}
