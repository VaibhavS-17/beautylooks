'use client';

import React from 'react';
import { useCartStore } from '@/lib/store';
import { ShoppingBag } from 'lucide-react';

export default function ReorderButton({ orderItems }: { orderItems: any[] }) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const handleReorder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    orderItems.forEach((item) => {
      if (item.products) {
        const productForCart = {
          ...item.products,
          price: item.unit_price,
          salePrice: null
        };
        addItem(productForCart as any, item.quantity);
      }
    });
    
    openCart();
  };

  return (
    <button 
      onClick={handleReorder}
      className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1A1A1A] text-white rounded text-xs font-semibold uppercase tracking-wider hover:bg-[#C9A94E] transition-colors shadow-sm"
    >
      <ShoppingBag size={14} />
      <span className="hidden sm:inline">1-Click Reorder</span>
      <span className="sm:hidden">Reorder</span>
    </button>
  );
}
