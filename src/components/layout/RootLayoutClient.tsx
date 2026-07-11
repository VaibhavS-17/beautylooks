'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ScrollToTop from "@/components/layout/ScrollToTop";


export default function RootLayoutClient({ children, categories = [] }: { children: React.ReactNode, categories?: { id: string, name: string, slug: string }[] }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <div className="w-full min-h-screen bg-[#FBF9F6]">{children}</div>;
  }

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
      <Suspense fallback={<div className="h-20 bg-[var(--color-primary)]" />}>
        <Navbar categories={categories} />
      </Suspense>
      <main className="flex-grow pb-24 md:pb-0">{children}</main>
      <Footer categories={categories} />
      <MobileBottomNav />
      <CartDrawer />
      <ScrollToTop />
    </>
  );
}
