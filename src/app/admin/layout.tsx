import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

export const metadata = {
  title: 'Admin Management Console | Beauty Looks Mumbai',
  description: 'Store management console for Beauty Looks Mumbai.'
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/admin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/account');
  }

  // Fetch lightweight counts for navigation badges
  const [
    { count: ordersCount },
    { count: productsCount },
    { count: reviewsCount },
    { count: categoriesCount },
    { count: brandsCount },
    { count: blogsCount },
    { count: discountsCount }
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('brands').select('*', { count: 'exact', head: true }),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
    supabase.from('discount_codes').select('*', { count: 'exact', head: true }),
  ]);

  const counts = {
    orders: ordersCount || 0,
    products: productsCount || 0,
    reviews: reviewsCount || 0,
    categories: categoriesCount || 0,
    brands: brandsCount || 0,
    blogs: blogsCount || 0,
    discounts: discountsCount || 0,
  };

  return (
    <div className="w-full h-screen bg-[#FBF9F6] text-[#1C1917] flex flex-col md:flex-row font-sans overflow-hidden">
      <AdminSidebar counts={counts} />
      <main className="flex-1 overflow-y-auto flex flex-col justify-between">
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
        <footer className="mt-16 text-center text-[10px] uppercase font-bold tracking-widest text-[#8A8177] select-none border-t border-[#EFECE6] py-4 bg-[#FBF9F6]">
          Beauty Looks Mumbai · Admin Management Console
        </footer>
      </main>
    </div>
  );
}
