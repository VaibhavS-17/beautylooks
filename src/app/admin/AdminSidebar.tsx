'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Star,
  HelpCircle,
  Tag,
  Award,
  FileText,
  Percent,
  Settings,
  Menu,
  X,
  LogOut,
  ExternalLink
} from 'lucide-react';

interface AdminSidebarProps {
  counts: {
    orders: number;
    products: number;
    reviews: number;
    categories: number;
    brands: number;
    blogs: number;
    discounts: number;
  };
}

export default function AdminSidebar({ counts }: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin', count: null },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, href: '/admin/orders', count: counts.orders },
    { id: 'products', label: 'Products', icon: Package, href: '/admin/products', count: counts.products },
    { id: 'reviews', label: 'Reviews', icon: Star, href: '/admin/reviews', count: counts.reviews },
    { id: 'faqs', label: 'Common FAQs', icon: HelpCircle, href: '/admin/faqs', count: null },
    { id: 'categories', label: 'Categories', icon: Tag, href: '/admin/categories', count: counts.categories },
    { id: 'brands', label: 'Brands', icon: Award, href: '/admin/brands', count: counts.brands },
    { id: 'blogs', label: 'Journal', icon: FileText, href: '/admin/blogs', count: counts.blogs },
    { id: 'discounts', label: 'Discounts', icon: Percent, href: '/admin/discounts', count: counts.discounts },
    { id: 'settings', label: 'Store Settings', icon: Settings, href: '/admin/settings', count: null },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-[#1C1917] text-white px-4 py-3 flex items-center justify-between border-b border-[#2A2725]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
            <img src="/images/brand/logo.png" alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-xs tracking-wide text-white">Beauty Looks</h1>
            <p className="text-[8px] text-[#CA8A04] tracking-widest uppercase font-bold">Store Management</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1C1917] text-white flex flex-col justify-between shrink-0 border-r border-[#2A2725] select-none h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transform transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
          <div className="p-6 border-b border-[#2A2725] flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shrink-0 shadow-sm border border-stone-200 overflow-hidden">
              <img
                src="/images/brand/logo.png"
                alt="Beauty Looks Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h1 className="font-display font-semibold text-sm tracking-wide text-white">Beauty Looks</h1>
              <p className="text-[9px] text-[#CA8A04] tracking-widest uppercase font-bold">Store Management</p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map(tab => {
              const Icon = tab.icon;
              const isActive = tab.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(tab.href);

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all text-left ${
                    isActive 
                      ? 'bg-[#CA8A04] text-white shadow-md' 
                      : 'text-[#9CA3AF] hover:bg-[#2A2725] hover:text-white'
                  }`}
                >
                  <span className="flex items-center space-x-3">
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </span>
                  {tab.count !== null && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#2A2725] text-[#9CA3AF]'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#2A2725] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-[#CA8A04] hover:bg-[#2A2725] transition-colors"
          >
            <span>View Storefront</span>
            <ExternalLink size={14} />
          </Link>
          <Link
            href="/account/orders"
            className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:bg-[#2A2725] hover:text-white transition-colors"
          >
            <LogOut size={16} />
            <span>Exit Admin</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
