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
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] bg-text-main text-white p-4 rounded-md shadow-lg font-bold">
        Skip to content
      </a>
      <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
      <Suspense fallback={<div className="h-20 bg-[var(--color-primary)]" />}>
        <Navbar categories={categories} />
      </Suspense>
      <main id="main-content" className="flex-grow pb-24 md:pb-0">{children}</main>
      <Footer categories={categories} />
      <MobileBottomNav />
      <CartDrawer />
      <ScrollToTop />
    </>
  );
}
