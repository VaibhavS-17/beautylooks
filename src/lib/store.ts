'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { Product, CartItem } from './types';
import React from 'react';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product, quantity: number = 1) => {
        const showAddedToast = () => {
          toast.custom(
            (t) =>
              React.createElement(
                'div',
                {
                  className: `${
                    t.visible ? 'animate-fade-in-up' : 'opacity-0 translate-y-2'
                  } max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto border border-border/50 overflow-hidden`,
                },
                React.createElement(
                  'div',
                  { className: 'p-4 flex items-center gap-3' },
                  React.createElement(
                    'div',
                    {
                      className:
                        'flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center',
                    },
                    React.createElement(
                      'svg',
                      {
                        xmlns: 'http://www.w3.org/2000/svg',
                        width: 20,
                        height: 20,
                        viewBox: '0 0 24 24',
                        fill: 'none',
                        stroke: '#059669',
                        strokeWidth: 2.5,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                      },
                      React.createElement('polyline', { points: '20 6 9 17 4 12' })
                    )
                  ),
                  React.createElement(
                    'div',
                    { className: 'flex-1 min-w-0' },
                    React.createElement(
                      'p',
                      {
                        className:
                          'text-sm font-semibold text-[#0C0A09]',
                      },
                      'Added to cart'
                    ),
                    React.createElement(
                      'p',
                      {
                        className:
                          'text-xs text-[#44403C] mt-0.5 truncate',
                      },
                      product.name
                    )
                  ),
                  React.createElement(
                    'button',
                    {
                      onClick: () => {
                        toast.dismiss(t.id);
                        get().openCart();
                      },
                      className:
                        'flex-shrink-0 px-4 py-2 bg-[#0C0A09] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#CA8A04] transition-colors',
                    },
                    'View Cart'
                  )
                )
              ),
            { duration: 3000, position: 'top-center' }
          );
        };

        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );

          if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.stockQuantity) {
              if (product.stockQuantity === 0) {
                toast.error("This product is out of stock");
                return state;
              }
              toast.error(`Only ${product.stockQuantity} items in stock`);
              return {
                items: state.items.map((item) =>
                  item.product.id === product.id
                    ? { ...item, quantity: product.stockQuantity }
                    : item
                ),
              };
            }
            showAddedToast();
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            };
          }

          if (product.stockQuantity === 0) {
            toast.error("This product is currently out of stock");
            return state;
          }

          if (quantity > product.stockQuantity) {
            toast.error(`Only ${product.stockQuantity} items in stock`);
            return { items: [...state.items, { product, quantity: product.stockQuantity }] };
          }
          showAddedToast();
          return { items: [...state.items, { product, quantity }] };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => {
          const existingItem = state.items.find(i => i.product.id === productId);
          if (existingItem && quantity > existingItem.product.stockQuantity) {
            toast.error(`Only ${existingItem.product.stockQuantity} items in stock`);
            return {
              items: state.items.map((item) =>
                item.product.id === productId ? { ...item, quantity: existingItem.product.stockQuantity } : item
              ),
            };
          }

          return {
            items: state.items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.salePrice || item.product.price;
          return total + price * item.quantity;
        }, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          return total + item.product.price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'blm-cart',
    }
  )
);

// Wishlist Store
interface WishlistState {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId: string) => {
        set((state) => ({
          items: state.items.includes(productId)
            ? state.items
            : [...state.items, productId],
        }));
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }));
      },

      toggleItem: (productId: string) => {
        const { items } = get();
        if (items.includes(productId)) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.includes(productId);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'blm-wishlist',
    }
  )
);
