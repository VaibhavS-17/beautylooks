'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { Product, CartItem, RestockNotificationRequest } from './types';
import React from 'react';

interface CartState {
  items: CartItem[];
  buyNowItem: CartItem | null;
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  setBuyNowItem: (item: CartItem | null) => void;
  clearBuyNowItem: () => void;
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
      buyNowItem: null,
      isOpen: false,

      setBuyNowItem: (item: CartItem | null) => set({ buyNowItem: item }),
      clearBuyNowItem: () => set({ buyNowItem: null }),

      addItem: (product: Product, quantity: number = 1) => {
        const showAddedToast = () => {
          toast.custom(
            (t) =>
              React.createElement(
                'div',
                {
                  className: `${
                    t.visible ? 'animate-fade-in-up' : 'opacity-0 translate-y-2'
                  } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto border border-border/80 overflow-hidden`,
                },
                // Top row: checkmark + text
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
                        width: 22,
                        height: 22,
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
                          'text-sm font-bold text-[#0C0A09]',
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
                  )
                ),
                // Bottom row: two action buttons
                React.createElement(
                  'div',
                  { className: 'flex items-center gap-2 px-4 pb-4 pt-1 border-t border-border/40' },
                  React.createElement(
                    'a',
                    {
                      href: '/products',
                      onClick: () => toast.dismiss(t.id),
                      className:
                        'flex-1 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest border border-border rounded-xl text-[#0C0A09] hover:bg-[#FAFAF9] transition-colors no-underline',
                    },
                    'View all products'
                  ),
                  React.createElement(
                    'button',
                    {
                      onClick: () => {
                        toast.dismiss(t.id);
                        get().openCart();
                      },
                      className:
                        'flex-1 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest bg-[#CA8A04] text-white rounded-xl hover:bg-[#0C0A09] transition-colors',
                    },
                    'View Cart'
                  )
                )
              ),
            { duration: 4000, position: 'top-center' }
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
              const noun = product.stockQuantity === 1 ? 'item' : 'items';
              toast.error(`Only ${product.stockQuantity} ${noun} available in stock`, { id: `stock-limit-${product.id}` });
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
            const noun = product.stockQuantity === 1 ? 'item' : 'items';
            toast.error(`Only ${product.stockQuantity} ${noun} available in stock`, { id: `stock-limit-${product.id}` });
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
            if (existingItem.product.stockQuantity <= 0) {
              toast.error("This product is out of stock", { id: `stock-limit-${existingItem.product.id}` });
              return { items: state.items.filter(item => item.product.id !== productId) };
            }
            const noun = existingItem.product.stockQuantity === 1 ? 'item' : 'items';
            toast.error(`Only ${existingItem.product.stockQuantity} ${noun} available in stock`, { id: `stock-limit-${existingItem.product.id}` });
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
          const price = item.product.salePrice ?? item.product.price;
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

import { addWishlistItemToDB, removeWishlistItemFromDB, syncWishlistWithDB } from '@/app/actions/wishlistActions';

// Wishlist Store
interface WishlistState {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  syncWithDB: () => Promise<void>;
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
        // Fire and forget DB update
        addWishlistItemToDB(productId).catch(console.error);
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }));
        // Fire and forget DB update
        removeWishlistItemFromDB(productId).catch(console.error);
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

      syncWithDB: async () => {
        const localItems = get().items;
        try {
          const res = await syncWishlistWithDB(localItems);
          if (res.success && res.items) {
            set({ items: res.items });
          }
        } catch (err) {
          console.error('Failed to sync wishlist with DB', err);
        }
      },
    }),
    {
      name: 'blm-wishlist',
    }
  )
);

// Notification Store — tracks restock notification subscriptions
interface NotificationState {
  requests: RestockNotificationRequest[];
  addRequest: (productId: string, productName: string, email: string) => void;
  isSubscribed: (productId: string, email: string) => boolean;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      requests: [],

      addRequest: (productId: string, productName: string, email: string) => {
        set((state) => ({
          requests: [
            ...state.requests,
            {
              id: `${productId}-${email}-${Date.now()}`,
              productId,
              productName,
              email: email.toLowerCase().trim(),
              createdAt: new Date().toISOString(),
              status: 'pending' as const,
            },
          ],
        }));
      },

      isSubscribed: (productId: string, email: string) =>
        get().requests.some(
          (r) =>
            r.productId === productId &&
            r.email.toLowerCase() === email.toLowerCase().trim()
        ),
    }),
    {
      name: 'blm-notifications',
    }
  )
);
