'use client';
import React, { useState, useMemo } from 'react';
import { Minus, Plus, Heart, Share2, Check, Bell, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

interface ProductPurchasePanelProps {
  product: Product;
  quantity: number;
  setQuantity: (q: number) => void;
  isSubscription?: boolean;
  setIsSubscription?: (s: boolean) => void;
  handleShare: () => void;
  isShared: boolean;
  setNotifyModalOpen: (o: boolean) => void;
}

export function ProductPurchasePanel({
  product,
  quantity,
  setQuantity,
  handleShare,
  isShared,
  setNotifyModalOpen
}: ProductPurchasePanelProps) {
  const router = useRouter();

  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const setBuyNowItem = useCartStore((state) => state.setBuyNowItem);
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const [heartPopKey, setHeartPopKey] = useState(0);

  const deliveryDate = useMemo(() => {
    const del = new Date();
    del.setDate(del.getDate() + 3);
    return del.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }, []);

  const handleWishlistToggle = () => {
    toggleWishlist(product.id);
    setHeartPopKey((k) => k + 1);
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.([15]);
      } catch {
        // ignore vibrate failures
      }
    }
  };

  const existingCartItem = cartItems.find((item) => item.product.id === product.id);
  const existingCartQty = existingCartItem ? existingCartItem.quantity : 0;
  const isMaxStockReached = (existingCartQty + quantity) > product.stockQuantity;
  const isWishlisted = wishlistItems.includes(product.id);

  return (
    <>
      {/* Guarantees Box */}
      <div className="mb-8 p-4 rounded-2xl bg-secondary/60 border border-border space-y-3">
        <div className="flex items-center gap-2.5 text-xs font-medium text-text-main">
          <Truck size={16} className="text-accent shrink-0" />
          <span>Estimated Delivery by <strong className="font-semibold">{deliveryDate}</strong></span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-text-muted">
          <ShieldCheck size={16} className="text-accent shrink-0" />
          <span>100% Genuine • Free Delivery Above ₹499 • Sourced Direct</span>
        </div>
      </div>

      {product.stockQuantity > 0 ? (
        <div className="pt-6 flex flex-col gap-5 border-t border-border">
          <div className="flex items-center gap-4">
            {/* Quantity Selector */}
            <div className="w-36 flex items-center bg-white h-12 rounded-xl border border-border overflow-hidden shrink-0">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-11 h-full flex items-center justify-center hover:bg-secondary text-text-main transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span className="flex-1 text-center text-sm font-semibold text-text-main">{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                disabled={quantity >= product.stockQuantity}
                className={`w-11 h-full flex items-center justify-center transition-colors ${
                  quantity >= product.stockQuantity 
                    ? 'text-border cursor-not-allowed' 
                    : 'hover:bg-secondary text-text-main'
                }`}
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>

            {/* Wishlist & Share Buttons for Desktop and Mobile */}
            <div className="flex gap-2.5 ml-auto">
              <button 
                onClick={handleShare}
                className="h-12 w-12 rounded-xl flex items-center justify-center border border-border bg-white hover:bg-secondary text-text-main transition-colors"
                aria-label="Share product"
              >
                {isShared ? <Check size={18} className="text-emerald-600" /> : <Share2 size={18} />}
              </button>
              <button 
                onClick={handleWishlistToggle}
                className="h-12 w-12 rounded-xl flex items-center justify-center border border-border bg-white hover:bg-secondary transition-colors"
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  key={heartPopKey}
                  size={18}
                  className={`${isWishlisted ? 'fill-accent text-accent' : 'text-text-main'} ${heartPopKey > 0 ? 'animate-heart-pop' : ''}`}
                />
              </button>
            </div>
          </div>

          {product.stockQuantity === 1 && (
            <span className="text-amber-800 text-xs font-medium">
              Only 1 remaining in stock
            </span>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button 
              onClick={() => {
                addItem(product, quantity);
              }}
              disabled={isMaxStockReached}
              className={`h-13 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all duration-200 border ${
                isMaxStockReached
                  ? 'border-border bg-secondary text-text-muted cursor-not-allowed opacity-60'
                  : 'btn-secondary'
              }`}
            >
              {isMaxStockReached ? 'Max Stock in Bag' : 'Add to Cart'}
            </button>
            <button 
              onClick={() => {
                setBuyNowItem({ product, quantity });
                router.push('/checkout?mode=buynow');
              }}
              className="h-13 rounded-xl text-xs font-semibold uppercase tracking-widest btn-primary active:scale-[0.98] transition-transform duration-150"
            >
              Buy Now
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={() => setNotifyModalOpen(true)}
              className="w-full sm:flex-1 h-13 rounded-xl text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 btn-primary"
            >
              <Bell size={16} />
              Notify Me When Available
            </button>
            <div className="flex gap-2.5">
              <button 
                onClick={handleShare}
                className="h-13 w-13 rounded-xl flex items-center justify-center border border-border bg-white hover:bg-secondary text-text-main transition-colors"
                aria-label="Share product"
              >
                {isShared ? <Check size={18} className="text-emerald-600" /> : <Share2 size={18} />}
              </button>
              <button 
                onClick={handleWishlistToggle}
                className="h-13 w-13 rounded-xl flex items-center justify-center border border-border bg-white hover:bg-secondary transition-colors"
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  key={heartPopKey}
                  size={18}
                  className={`${isWishlisted ? 'fill-accent text-accent' : 'text-text-main'} ${heartPopKey > 0 ? 'animate-heart-pop' : ''}`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
