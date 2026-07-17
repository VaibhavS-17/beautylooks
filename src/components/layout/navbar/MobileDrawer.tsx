'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import { NavLinkProps } from './NavLinks';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLinkProps[];
}

export default function MobileDrawer({ isOpen, onClose, links }: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Basic focus trap - focus the close button when opened
      const closeBtn = document.getElementById('mobile-drawer-close');
      if (closeBtn) closeBtn.focus();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Focus trap
  const handleTabKey = (e: React.KeyboardEvent) => {
    if (!drawerRef.current) return;
    
    const focusableElements = drawerRef.current.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) md:hidden`}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      onKeyDown={handleTabKey}
      ref={drawerRef}
    >
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col border-r border-[var(--color-border)]">
        <div className="px-6 py-6 flex justify-between items-center border-b border-[var(--color-border)]">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="relative h-9 w-9 overflow-hidden">
              <Image
                src="/images/brand/logo.png"
                alt="Beauty Looks Mumbai"
                fill
                sizes="36px"
                className="object-contain"
              />
            </div>
            <div>
              <div className="text-[var(--color-text-main)] font-semibold text-sm font-display mb-0.5" style={{ fontFamily: 'var(--font-playfair), serif' }}>Beauty Looks</div>
              <div className="text-[8px] text-[var(--color-accent)] tracking-[0.15em] uppercase font-semibold">Premium Cosmetics</div>
            </div>
          </Link>
          <button
            id="mobile-drawer-close"
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors p-2 bg-[var(--color-primary)] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close menu"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-6 space-y-2">
          {links.map((link, index) => (
            <div
              key={link.name}
              className="transform transition-all duration-500"
              style={{
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateX(0)' : 'translateX(-20px)',
                transitionDelay: `${index * 60}ms`
              }}
            >
              <Link
                href={link.href}
                className="flex items-center justify-between py-3.5 px-4 rounded-xl hover:bg-[var(--color-primary)] text-[12px] tracking-[0.12em] uppercase font-semibold text-[var(--color-text-main)] hover:text-[var(--color-accent)] transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={onClose}
              >
                <span>{link.name}</span>
                <span className="text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            </div>
          ))}
        </div>

        <div className="p-5 bg-[var(--color-primary)] border-t border-[var(--color-border)]">
          <p className="text-[10px] tracking-[0.15em] text-[var(--color-text-muted)] text-center uppercase">
            Need help?{' '}
            <a href="tel:+918879655807" className="text-[var(--color-accent)] hover:text-[var(--color-text-main)] transition-colors font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
              8879655807
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
