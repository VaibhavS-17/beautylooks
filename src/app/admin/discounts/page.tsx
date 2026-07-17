import React from 'react';
import { createClient } from '@/lib/supabase/server';
import DiscountsClient from './DiscountsClient';

export const dynamic = 'force-dynamic';

export default async function AdminDiscountsPage() {
  const supabase = await createClient();

  const { data: discountsData, error } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin discount codes:', error);
  }

  const mappedDiscounts = (discountsData || []).map((d: any) => ({
    id: d.id,
    code: d.code,
    discount_percent: d.discount_percent,
    valid_until: d.valid_until,
    usage_limit: d.usage_limit,
    usage_count: d.usage_count || 0,
    is_active: d.is_active,
    created_at: d.created_at
  }));

  return <DiscountsClient initialDiscountCodes={mappedDiscounts} />;
}
