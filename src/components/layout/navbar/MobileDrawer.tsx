'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import { NavLinkProps } from './NavLinks';
import { lockScroll, unlockScroll } from '@/lib/scrollLock';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLinkProps[];
}

export default function MobileDrawer({ isOpen, onClose, links }: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerContentRef = useRef<HTMLDivElement>(null);

  // Swipe-to-close touch gesture refs (direct DOM manipulation for 120fps motion)
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchCurrentXRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const isSwipingRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      lockScroll();
      if (drawerContentRef.current) {
        drawerContentRef.current.style.transform = '';
        drawerContentRef.current.style.transition = '';
      }
      // Basic focus trap - focus the close button when opened
      const timer = setTimeout(() => {
        const closeBtn = document.getElementById('mobile-drawer-close');
        if (closeBtn) closeBtn.focus();
      }, 50);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        unlockScroll();
        clearTimeout(timer);
      };
    } else {
      unlockScroll();
      if (drawerContentRef.current) {
        drawerContentRef.current.style.transform = '';
        drawerContentRef.current.style.transition = '';
      }
    }
  }, [isOpen, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchCurrentXRef.current = e.touches[0].clientX;
    touchStartTimeRef.current = Date.now();
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
      }
    }

    if (isSwipingRef.current && deltaX < 0) {
      touchCurrentXRef.current = currentX;
      if (drawerContentRef.current) {
        drawerContentRef.current.style.transition = 'none';
        drawerContentRef.current.style.transform = `translateX(${deltaX}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (isSwipingRef.current) {
      isSwipingRef.current = false;
      const deltaX = touchCurrentXRef.current - touchStartXRef.current;
      const elapsedMs = Math.max(Date.now() - touchStartTimeRef.current, 1);
      const velocity = Math.abs(deltaX) / elapsedMs;

      if (deltaX < -70 || (deltaX < -20 && velocity > 0.11)) {
        // Smoothly dismiss by sliding straight left off-screen
        if (drawerContentRef.current) {
          drawerContentRef.current.style.transition = 'transform 300ms var(--ease-drawer, cubic-bezier(0.32, 0.72, 0, 1))';
          drawerContentRef.current.style.transform = 'translateX(-100%)';
        }
        onClose();
      } else {
        // Spring smoothly back into view
        if (drawerContentRef.current) {
          drawerContentRef.current.style.transition = 'transform 300ms var(--ease-drawer, cubic-bezier(0.32, 0.72, 0, 1))';
          drawerContentRef.current.style.transform = 'translateX(0)';
        }
      }
    }
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
      className={`fixed inset-0 z-50 md:hidden transition-[visibility] duration-300 ${
        isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
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
        ref={drawerContentRef}
        className={`absolute inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col border-r border-[var(--color-border)] transform transition-transform duration-300 ease-drawer ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
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
