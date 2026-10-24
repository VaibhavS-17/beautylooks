import { createClient } from '@supabase/supabase-js';

// Stateless, cookie-free Supabase client for public catalog data
// (categories, products, site settings, blog posts)
// This client NEVER accesses incoming request cookies or headers,
// allowing Next.js and Vercel to pre-render pages statically (SSG)
// and cache them at the global Edge CDN using Incremental Static Regeneration (ISR).
export function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
