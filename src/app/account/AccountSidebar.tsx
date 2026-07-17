'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, MapPin, LogOut } from 'lucide-react';
import { signOut } from '@/app/actions/auth';

const NAV_ITEMS = [
  { id: 'profile', label: 'Profile Details', icon: User, href: '/account/profile' },
  { id: 'orders', label: 'My Orders', icon: Package, href: '/account/orders' },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPin, href: '/account/addresses' },
];

export default function AccountSidebar({
  user,
}: {
  user: {
    fullName: string;
    email: string;
    role: string;
    createdAt: string;
  };
}) {
  const pathname = usePathname();

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <div className="hidden md:flex flex-col w-full sticky top-[120px] sm:top-[128px] max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
        {/* User Profile Summary */}
        <div className="p-6 border-b border-[#EFECE6] bg-[#FCFBF9]">
          <div className="w-16 h-16 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#706A60] font-display text-2xl font-medium mb-4">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <h2 className="font-display text-lg font-semibold text-[#1A1A1A]">
            {user.fullName}
          </h2>
          <p className="text-sm text-[#706A60] truncate">{user.email}</p>
          <div className="mt-3 inline-flex items-center space-x-1.5 bg-[#F9F7F3] px-2.5 py-1 rounded-md border border-[#EFECE6]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9A7B2F]"></span>
            <span className="text-[10px] font-semibold text-[#9A7B2F] uppercase tracking-wider">
              {user.role}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-[#1A1A1A] text-white shadow-md'
                        : 'text-[#5C554D] hover:bg-[#F9F7F3] hover:text-[#1A1A1A]'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-[#C9A94E]' : 'text-[#706A60]'} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#EFECE6]">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* --- MOBILE NAVIGATION BAR --- */}
      <div className="md:hidden flex flex-col w-full border-b border-[#EFECE6]">
        <nav className="flex items-center overflow-x-auto p-3 sm:px-4 space-x-2 no-scrollbar bg-[#FCFBF9]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 border ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm'
                    : 'bg-white text-[#5C554D] border-[#EFECE6]'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#C9A94E]' : 'text-[#706A60]'} />
                <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={() => signOut()}
            className="flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 border bg-white text-red-600 border-[#EFECE6]"
          >
            <LogOut size={16} />
            <span className="font-medium text-sm whitespace-nowrap">Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
}
