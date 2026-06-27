'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const whatsappNumber = '918879655807';
  const message = encodeURIComponent('Hi! I would like to know more about your beauty products and facial kits.');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-[#F5F0E8] rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_30px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 group animate-bounce"
      aria-label="Contact us on WhatsApp"
      style={{ animationDuration: '3s' }}
    >
      {/* Pulse Effect */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping group-hover:opacity-60"></span>
      
      <MessageCircle size={28} className="relative z-10 fill-current" />
      
      {/* Tooltip on hover */}
      <span className="absolute right-16 scale-0 group-hover:scale-100 bg-[#1A1A1A] text-[#C9A94E] text-xs font-medium py-2 px-3 rounded-lg border border-rgba(201,169,78,0.3) shadow-lg whitespace-nowrap transition-all duration-300 origin-right">
        Chat with us! 💬
      </span>
    </a>
  );
}
