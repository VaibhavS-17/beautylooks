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
    <div className="flex flex-col h-full bg-white border-r border-[#EFECE6] w-full md:w-72 flex-shrink-0">
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
      <nav className="flex-1 overflow-y-auto py-4">
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
  );
}
