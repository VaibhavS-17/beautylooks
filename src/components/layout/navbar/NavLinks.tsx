'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export interface NavLinkProps {
  name: string;
  href: string;
}

export default function NavLinks({ links, isTransparent }: { links: NavLinkProps[], isTransparent?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center gap-6 lg:gap-10">
      {links.map((link) => {
        const [linkPath, linkQuery] = link.href.split('?');
        const isActive = pathname === linkPath && (
          !linkQuery 
            ? !searchParams.get('category') 
            : searchParams.get('category') === new URLSearchParams(linkQuery).get('category')
        );
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`relative text-[11px] tracking-[0.15em] uppercase font-semibold transition-all duration-300 group px-2 py-1 ${
              isActive 
                ? (isTransparent ? 'text-white' : 'text-[var(--color-accent)]') 
                : `${isTransparent ? 'text-white/80 hover:text-white' : 'text-[var(--color-text-main)] hover:text-[var(--color-accent)]'} hover:-translate-y-0.5`
            }`}
          >
            {link.name}
            <span className={`absolute -bottom-0.5 left-0 h-px transition-all duration-300 ${isTransparent ? 'bg-white' : 'bg-[var(--color-accent)]'} ${
              isActive ? 'w-full' : 'w-0 group-hover:w-full'
            }`} />
          </Link>
        );
      })}
    </div>
  );
}
