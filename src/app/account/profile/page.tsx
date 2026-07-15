import { createClient } from '@/lib/supabase/server';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import ProfileManager from './ProfileManager';
import SecurityManager from './SecurityManager';

export const runtime = 'edge';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const userProfile = {
    fullName: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    phone: profile?.phone || user.user_metadata?.phone || '',
    role: profile?.role || 'customer',
    createdAt: user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Recently joined',
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <ProfileManager userProfile={userProfile} />
      <SecurityManager />

      {userProfile.role === 'admin' && (
        <Link
          href="/admin"
          className="flex items-center justify-between p-5 mt-4 glass-gold rounded-2xl group overflow-hidden relative bg-gradient-to-r from-[#F9F7F3] to-[#FCFBF9] border border-[#C9A94E40]"
        >
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center border border-[#C9A94E] group-hover:border-[#9A7B2F] transition-colors duration-500 shadow-sm">
              <ShieldCheck size={20} className="text-[#9A7B2F] group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <span className="text-base font-semibold text-[#1A1A1A] block font-display tracking-wide group-hover:text-[#9A7B2F] transition-all duration-500">Admin Dashboard</span>
              <span className="text-sm text-[#706A60] font-light">Manage products, orders, and analytics</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/50 border border-[#EFECE6] flex items-center justify-center group-hover:bg-[#9A7B2F] group-hover:border-[#9A7B2F] transition-all duration-500 relative z-10">
            <span className="text-[#706A60] group-hover:text-white text-lg font-semibold group-hover:translate-x-0.5 transition-all duration-500">→</span>
          </div>
        </Link>
      )}
    </div>
  );
}
