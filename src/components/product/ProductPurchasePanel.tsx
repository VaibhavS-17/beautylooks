'use client';
import React, { useState, useEffect } from 'react';
import { Minus, Plus, Heart, Share2, Check, Bell } from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { Product } from '@/lib/types';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

interface ProductPurchasePanelProps {
  product: Product;
  quantity: number;
  setQuantity: (q: number) => void;
  isSubscription: boolean;
  setIsSubscription: (s: boolean) => void;
  handleShare: () => void;
  isShared: boolean;
  setNotifyModalOpen: (o: boolean) => void;
}

export function ProductPurchasePanel({
  product,
  quantity,
  setQuantity,
  isSubscription,
  setIsSubscription,
  handleShare,
  isShared,
  setNotifyModalOpen
}: ProductPurchasePanelProps) {
  const router = useRouter();
  const [peopleInCart, setPeopleInCart] = useState(0);
  const [countdownStr, setCountdownStr] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const setBuyNowItem = useCartStore((state) => state.setBuyNowItem);
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  const existingCartItem = cartItems.find((item) => item.product.id === product.id);
  const existingCartQty = existingCartItem ? existingCartItem.quantity : 0;
  const isMaxStockReached = (existingCartQty + quantity) > product.stockQuantity;
  const isWishlisted = wishlistItems.includes(product.id);

  useEffect(() => {
    const hash = product.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    setPeopleInCart((hash % 10) + 3);
    
    const updateCountdown = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(18, 0, 0, 0);
      if (now > cutoff) {
        cutoff.setDate(cutoff.getDate() + 1);
      }
      const diff = cutoff.getTime() - now.getTime();
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdownStr(`${hrs} hrs ${mins} mins`);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    
    const del = new Date();
    del.setDate(del.getDate() + 3);
    setDeliveryDate(del.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    
    return () => clearInterval(interval);
  }, [product.id]);

  return (
    <>
      <div className="mb-8 border border-border/60 rounded-xl overflow-hidden bg-[#FCFBF9]">
        <label className={`flex items-start p-4 cursor-pointer transition-colors ${!isSubscription ? 'bg-[#F4F1EB] border-b border-border/60' : ''}`}>
          <div className="flex-shrink-0 mt-0.5">
            <input type="radio" name="purchaseType" checked={!isSubscription} onChange={() => setIsSubscription(false)} className="w-4 h-4 text-accent border-border/60 focus:ring-accent" />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-text-main">One-time purchase</span>
              <span className="text-sm font-semibold text-text-main">
                {formatPrice(product.salePrice ?? product.price)}
              </span>
            </div>
          </div>
        </label>
        
        <label className={`flex items-start p-4 cursor-pointer transition-colors ${isSubscription ? 'bg-[#F4F1EB]' : ''}`}>
          <div className="flex-shrink-0 mt-0.5">
            <input type="radio" name="purchaseType" checked={isSubscription} onChange={() => setIsSubscription(true)} className="w-4 h-4 text-accent border-border/60 focus:ring-accent" />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-text-main">Subscribe & Save 15%</span>
              <span className="text-sm font-semibold text-text-main">
                {formatPrice((product.salePrice ?? product.price) * 0.85)}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">Deliver every 1, 2, or 3 months. Cancel anytime.</p>
          </div>
        </label>
      </div>

      <div className="flex flex-col gap-2 mb-8 bg-[#FDFBF7] p-4 border border-[#E8E2D9]/60 rounded-xl">
        <div className="flex items-center text-sm font-semibold text-[#DC2626]">
          <span className="mr-2 animate-pulse">🔥</span> 
          High demand: Currently in {peopleInCart} people's carts
        </div>
        <div className="text-sm text-text-muted font-medium">
          Want it by <strong className="text-text-main">{deliveryDate}</strong>? Order within <span className="text-[#CA8A04] font-bold">{countdownStr}</span>
        </div>
      </div>

      {product.stockQuantity > 0 ? (
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center border-t border-border/50">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <div className="flex gap-4 items-center w-full">
              <div className="flex-1 sm:w-36 flex items-center bg-white h-14 overflow-hidden border border-border shrink-0">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 sm:px-5 h-full flex items-center justify-center hover:bg-black/5 transition-colors text-text-main"
                >
                  <Minus size={16} />
                </button>
                <span className="flex-1 text-center text-base font-semibold text-text-main">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  disabled={quantity >= product.stockQuantity}
                  className={`w-12 sm:px-5 h-full flex items-center justify-center transition-colors ${
                    quantity >= product.stockQuantity 
                      ? 'text-border cursor-not-allowed' 
                      : 'hover:bg-black/5 text-text-main'
                  }`}
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <button 
                onClick={handleShare}
                className="sm:hidden h-14 w-14 shrink-0 flex items-center justify-center border border-border bg-white hover:bg-black/5 transition-colors"
                aria-label="Share product"
              >
                {isShared ? <Check size={22} className="text-green-600" strokeWidth={1.5} /> : <Share2 size={22} className="text-text-main" strokeWidth={1.5} />}
              </button>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className="sm:hidden h-14 w-14 shrink-0 rounded-xl flex items-center justify-center border border-border/50 bg-white/80 backdrop-blur shadow-sm hover:bg-black/5 transition-colors"
              >
                <Heart size={22} className={isWishlisted ? 'fill-accent text-accent' : 'text-text-main'} strokeWidth={1.5} />
              </button>
            </div>
            {product.stockQuantity === 1 && (
              <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest px-1">
                Only 1 left in stock
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4 sm:mt-0">
            <button 
              onClick={() => {
                addItem(product, quantity);
              }}
              disabled={isMaxStockReached}
              className={`w-full sm:w-1/2 h-14 shrink-0 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center border-2 ${
                isMaxStockReached
                  ? 'border-[#EFECE6] bg-[#FBF9F6] text-[#8C8885] cursor-not-allowed opacity-75'
                  : 'border-text-main bg-transparent text-text-main hover:bg-text-main hover:text-white'
              }`}
            >
              {isMaxStockReached ? 'Max Stock Reached' : 'Add to Cart'}
            </button>
            <button 
              onClick={() => {
                setBuyNowItem({ product, quantity });
                router.push('/checkout?mode=buynow');
              }}
              className="w-full sm:w-1/2 h-14 shrink-0 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center bg-accent text-white hover:bg-black hover:text-white shadow-gold hover:-translate-y-1"
            >
              Buy Now
            </button>
          </div>

          <div className="hidden sm:flex gap-4">
            <button 
              onClick={handleShare}
              className="h-14 w-14 shrink-0 rounded-xl items-center justify-center border border-border/50 bg-white/80 backdrop-blur shadow-sm hover:bg-black/5 transition-colors flex"
              aria-label="Share product"
            >
              {isShared ? <Check size={22} className="text-green-600" strokeWidth={1.5} /> : <Share2 size={22} className="text-text-main" strokeWidth={1.5} />}
            </button>
            <button 
              onClick={() => toggleWishlist(product.id)}
              className="h-14 w-14 shrink-0 rounded-xl items-center justify-center border border-border/50 bg-white/80 backdrop-blur shadow-sm hover:bg-black/5 transition-colors flex"
            >
              <Heart size={22} className={isWishlisted ? 'fill-accent text-accent' : 'text-text-main'} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-6 sm:pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <button
              onClick={() => setNotifyModalOpen(true)}
              className="w-full sm:w-auto h-14 px-10 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 bg-accent text-white hover:bg-black hover:text-white shadow-gold hover:-translate-y-1"
            >
              <Bell size={18} />
              Notify Me When Available
            </button>
            <div className="flex gap-4">
              <button 
                onClick={handleShare}
                className="h-14 w-14 shrink-0 rounded-xl items-center justify-center border border-border/50 bg-white/80 backdrop-blur shadow-sm hover:bg-black/5 transition-colors flex"
                aria-label="Share product"
              >
                {isShared ? <Check size={22} className="text-green-600" strokeWidth={1.5} /> : <Share2 size={22} className="text-text-main" strokeWidth={1.5} />}
              </button>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className="h-14 w-14 shrink-0 rounded-xl items-center justify-center border border-border/50 bg-white/80 backdrop-blur shadow-sm hover:bg-black/5 transition-colors flex"
              >
                <Heart size={22} className={isWishlisted ? 'fill-accent text-accent' : 'text-text-main'} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
