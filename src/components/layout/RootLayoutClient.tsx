'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import CartDrawer from "@/components/layout/CartDrawer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <div className="w-full min-h-screen bg-[#FBF9F6]">{children}</div>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow pb-24 md:pb-0">{children}</main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomNav />
      <CartDrawer />
    </>
  );
}
