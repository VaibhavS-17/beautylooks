'use client'

import { useState, useEffect, useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronUp } from 'lucide-react'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function ScrollToTopOnMount() {
  useIsomorphicLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, []);

  return null;
}

export default function ScrollToTop() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useIsomorphicLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 w-12 h-12 rounded-full bg-brand-dark text-white shadow-lg border border-white/10 flex items-center justify-center hover:bg-accent hover:shadow-gold transition-all duration-300 ${
        visible
          ? 'opacity-100 pointer-events-auto translate-y-0'
          : 'opacity-0 pointer-events-none translate-y-4'
      }`}
    >
      <ChevronUp size={20} />
    </button>
  )
}

