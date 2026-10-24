'use client';

import React, { useEffect, useRef, useState } from 'react';
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

  // Swipe-to-close touch gesture states
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchCurrentXRef = useRef(0);
  const isSwipingRef = useRef(false);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchCurrentXRef.current = e.touches[0].clientX;
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartXRef.current;
    const deltaY = currentY - touchStartYRef.current;

    // Detect horizontal swipe to close (swiping left, deltaX < 0)
    if (!isSwipingRef.current) {
      if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < -8) {
        isSwipingRef.current = true;
        setIsDragging(true);
      }
    }

    if (isSwipingRef.current && deltaX < 0) {
      touchCurrentXRef.current = currentX;
      setDragOffset(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (isSwipingRef.current) {
      const deltaX = touchCurrentXRef.current - touchStartXRef.current;
      if (deltaX < -70) {
        onClose();
      }
    }
    setIsDragging(false);
    isSwipingRef.current = false;
    setDragOffset(0);
  };

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
      className={`fixed inset-0 z-50 md:hidden transition-colors ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      onKeyDown={handleTabKey}
      ref={drawerRef}
    >
      {/* Decoupled backdrop with pure in-place fade */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container with physical ease-drawer transition and swipe gesture */}
      <div 
        className={`absolute inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col border-r border-[var(--color-border)] transform transition-transform duration-300 ease-drawer ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          transform: isDragging && dragOffset < 0 ? `translateX(${dragOffset}px)` : undefined,
          transition: isDragging ? 'none' : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
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
            suppressHydrationWarning
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-6 space-y-2">
          {links.map((link, index) => (
            <div
              key={link.name}
              className="transform transition-all duration-300 ease-out"
              style={{
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateX(0)' : 'translateX(-16px)',
                transitionDelay: `${isOpen ? index * 30 : 0}ms`
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

        <div 
          className="p-5 pb-safe bg-[var(--color-primary)] border-t border-[var(--color-border)]"
          style={{ paddingBottom: 'max(1.25rem, calc(1.25rem + env(safe-area-inset-bottom, 0px)))' }}
        >
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
