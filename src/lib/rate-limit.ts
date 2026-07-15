import { createAdminClient } from '@/lib/supabase/admin';

// Persistent rate limiter for Server Actions using Supabase
export async function rateLimit(key: string, limit: number = 10, windowMs: number = 60_000): Promise<{ success: boolean; remaining: number }> {
  // If no service role key is configured (e.g. local dev), bypass rate limiting
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Rate limiting bypassed: SUPABASE_SERVICE_ROLE_KEY is not defined.');
    return { success: true, remaining: 99 };
  }

  // Use admin client to bypass RLS for rate limit table
  const supabase = createAdminClient();
  
  const { data: record } = await supabase
    .from('rate_limits')
    .select('count, last_reset')
    .eq('key', key)
    .single();

  const now = new Date();

  if (!record || (now.getTime() - new Date(record.last_reset).getTime() > windowMs)) {
    await supabase.from('rate_limits').upsert({
      key,
      count: 1,
      last_reset: now.toISOString()
    });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  await supabase.from('rate_limits').update({
    count: record.count + 1
  }).eq('key', key);

  return { success: true, remaining: limit - record.count - 1 };
}
