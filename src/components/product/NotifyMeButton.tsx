'use client';

import React, { useState } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { subscribeRestockNotification } from '@/app/actions/notificationActions';
import { toast } from 'react-hot-toast';

interface NotifyMeButtonProps {
  productId: string;
  defaultEmail?: string;
  className?: string;
}

export function NotifyMeButton({ productId, defaultEmail = '', className = '' }: NotifyMeButtonProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [isExpanding, setIsExpanding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (emailToUse: string) => {
    if (!emailToUse || !emailToUse.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await subscribeRestockNotification({ productId, email: emailToUse });
      if (res.success) {
        setSubscribed(true);
        setIsExpanding(false);
        toast.success("We'll notify you as soon as this item is back in stock!", { duration: 4000 });
      } else {
        setError(res.error || 'Failed to subscribe');
        toast.error(res.error || 'Failed to subscribe');
      }
    } catch (err: any) {
      setError(err.message || 'Error subscribing');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (subscribed) return;
    if (defaultEmail && defaultEmail.trim() !== '') {
      handleSubscribe(defaultEmail);
    } else {
      setIsExpanding(true);
    }
  };

  if (subscribed) {
    return (
      <span className={`inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-600 ${className}`}>
        <Check size={12} />
        <span>Subscribed for Restock</span>
      </span>
    );
  }

  if (isExpanding) {
    return (
      <div className={`mt-1.5 flex flex-col space-y-1 ${className}`}>
        <div className="flex items-center space-x-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleSubscribe(email);
              }
            }}
            placeholder="Enter email..."
            required
            className="w-28 text-[11px] px-2 py-0.5 border border-border rounded focus:outline-none focus:border-[#C9A94E] bg-white text-text-main"
          />
          <button
            type="button"
            onClick={() => handleSubscribe(email)}
            disabled={loading}
            className="px-2 py-0.5 bg-[#C9A94E] text-white text-[11px] font-medium rounded hover:bg-[#b0923e] transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
          >
            {loading ? <Loader2 size={10} className="animate-spin" /> : 'Submit'}
          </button>
        </div>
        {error && <span className="text-[10px] text-red-500">{error}</span>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`mt-1.5 flex items-center space-x-1 text-[11px] font-semibold text-accent hover:text-accent/80 transition-colors ${className}`}
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Bell size={12} />}
      <span>Notify Me</span>
    </button>
  );
}
