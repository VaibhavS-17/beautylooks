import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AccountSidebar from './AccountSidebar';
import { Menu } from 'lucide-react';

export const runtime = 'edge';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile from the profiles table
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    const newProfile = {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      phone: user.user_metadata?.phone || null,
      avatar_url: user.user_metadata?.avatar_url || null,
    };
    await supabase.from('profiles').upsert(newProfile);
    profile = newProfile as any;
  }

  const userProfile = {
    fullName: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    phone: profile?.phone || user.user_metadata?.phone || '',
    role: profile?.role || 'customer',
    createdAt: user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Recently joined',
  };

  return (
    <div className="min-h-screen bg-[#F9F7F3] pt-6 sm:pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Header / Title */}
        <div className="md:hidden mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-[#1A1A1A]">My Account</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#EFECE6] overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="md:w-72 flex-shrink-0 border-b md:border-b-0 md:border-r border-[#EFECE6] bg-white">
             <AccountSidebar user={userProfile} />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-x-hidden">
            <div className="p-4 sm:p-6 md:p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
