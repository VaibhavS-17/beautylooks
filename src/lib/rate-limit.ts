import { createAdminClient } from '@/lib/supabase/admin';

export async function rateLimit(key: string, limit: number = 10, windowMs: number = 60_000): Promise<{ success: boolean; remaining: number }> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Rate limiting bypassed: SUPABASE_SERVICE_ROLE_KEY not set.');
    return { success: true, remaining: 99 };
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_key: key,
    p_limit: limit,
    p_window_ms: windowMs,
  });

  if (error) {
    console.error('Rate limit RPC error:', error);
    // Fail open: allow the request if rate limiting itself fails
    return { success: true, remaining: 99 };
  }

  return {
    success: data?.allowed ?? true,
    remaining: data?.remaining ?? 0,
  };
}
