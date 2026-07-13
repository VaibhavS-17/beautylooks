import { createClient } from '@/lib/supabase/server';
import { User, Mail, PhoneIcon, Calendar, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

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
      <div className="flex items-center justify-between border-b border-[#EFECE6] pb-4">
        <h3 className="font-display text-xl font-semibold tracking-wide text-[#1A1A1A]">
          Personal Information
        </h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#FCFBF9] border border-[#EFECE6] rounded-2xl p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#F9F7F3] border border-[#C9A94E30] flex items-center justify-center text-[#9A7B2F] group-hover:scale-110 transition-transform">
              <User size={20} />
            </div>
            <div>
              <span className="block text-xs text-[#706A60] uppercase tracking-wider font-semibold">Full Name</span>
              <span className="text-[#1A1A1A] font-medium text-lg mt-0.5 block">{userProfile.fullName}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[#FCFBF9] border border-[#EFECE6] rounded-2xl p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#F9F7F3] border border-[#C9A94E30] flex items-center justify-center text-[#9A7B2F] group-hover:scale-110 transition-transform">
              <Mail size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs text-[#706A60] uppercase tracking-wider font-semibold">Email Address</span>
              <span className="text-[#1A1A1A] font-medium text-lg mt-0.5 block truncate">{userProfile.email}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[#FCFBF9] border border-[#EFECE6] rounded-2xl p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#F9F7F3] border border-[#C9A94E30] flex items-center justify-center text-[#9A7B2F] group-hover:scale-110 transition-transform">
              <PhoneIcon size={20} />
            </div>
            <div>
              <span className="block text-xs text-[#706A60] uppercase tracking-wider font-semibold">Contact Phone</span>
              <span className="text-[#1A1A1A] font-medium text-lg mt-0.5 block">{userProfile.phone ? `+91 ${userProfile.phone}` : 'Not set'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[#FCFBF9] border border-[#EFECE6] rounded-2xl p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#F9F7F3] border border-[#C9A94E30] flex items-center justify-center text-[#9A7B2F] group-hover:scale-110 transition-transform">
              <Calendar size={20} />
            </div>
            <div>
              <span className="block text-xs text-[#706A60] uppercase tracking-wider font-semibold">Member Since</span>
              <span className="text-[#1A1A1A] font-medium text-lg mt-0.5 block capitalize">{userProfile.createdAt}</span>
            </div>
          </div>
        </div>
      </div>

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
