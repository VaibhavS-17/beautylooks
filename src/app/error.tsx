'use client'; // Error components must be Client Components

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error digest only (not the full error which may contain sensitive data)
    console.error('Global Error Boundary Caught:', error.digest || 'unknown');
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 py-12 bg-primary">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-12 text-center border border-border shadow-2xl relative overflow-hidden">
        
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-text-main/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-8 border border-border/50">
            <AlertCircle size={32} className="text-text-main opacity-80" />
          </div>
          
          <h1 className="text-3xl font-bold text-text-main mb-4 font-display" style={{ fontFamily: 'Playfair Display, serif' }}>
            We hit a snag.
          </h1>
          
          <p className="text-sm text-text-muted mb-10 leading-relaxed">
            Our systems are taking a little longer than expected to process your request. Please try again or head back home.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => reset()}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-text-main text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-text-main transition-colors duration-300 shadow-md active:scale-95"
            >
              <RotateCcw size={16} />
              Try Again
            </button>
            
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-secondary text-text-main rounded-xl border border-border/50 text-xs font-bold uppercase tracking-widest hover:border-text-main transition-colors duration-300 active:scale-95"
            >
              <Home size={16} />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
