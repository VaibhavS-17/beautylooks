'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Bell, Check, Mail } from 'lucide-react';

interface NotifyMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export default function NotifyMeModal({ isOpen, onClose, productName }: NotifyMeModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClose = useCallback(() => {
    setEmail('');
    setError('');
    setIsSuccess(false);
    onClose();
  }, [onClose]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Auto-close after success
  useEffect(() => {
    if (!isSuccess) return;

    const timer = setTimeout(() => {
      handleClose();
    }, 2500);

    return () => clearTimeout(timer);
  }, [isSuccess, handleClose]);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSuccess(true);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-text-muted" />
        </button>

        {isSuccess ? (
          /* Success State */
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs">
              We&apos;ll notify you when{' '}
              <span className="font-semibold text-text-main">{productName}</span>{' '}
              is back in stock!
            </p>
          </div>
        ) : (
          /* Form State */
          <div className="flex flex-col items-center">
            {/* Bell Icon */}
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-5">
              <Bell className="w-6 h-6 text-accent" />
            </div>

            {/* Heading */}
            <h2 className="font-display text-xl font-semibold text-text-main mb-1 text-center">
              Get Notified When Available
            </h2>

            {/* Product Name */}
            <p className="text-sm text-text-muted mb-6 text-center">{productName}</p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div>
                <label
                  htmlFor="notify-email"
                  className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50" />
                  <input
                    id="notify-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="your@email.com"
                    className="w-full border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all"
                  />
                </div>
                {error && (
                  <p className="text-xs text-red-500 mt-1.5">{error}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-accent text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all cursor-pointer"
              >
                Notify Me
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
