'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, ShieldCheck, Loader2, MapPin, Smartphone, Monitor, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/data';
import { createUpiOrder, submitPaymentReference } from '@/app/actions/orderActions';
import { createClient } from '@/lib/supabase/client';

interface SavedAddress {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

// Simple mobile detection
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    setIsMobile(check);
  }, []);
  return isMobile;
}

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const isMobile = useIsMobile();
  const fallbackProductImage = '/images/products/facial-kit-1.png';

  // Form State
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '',
    addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
  });

  // Checkout flow states
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'payment' | 'success'>('form');
  const [orderId, setOrderId] = useState('');
  const [upiString, setUpiString] = useState('');
  const [utrInput, setUtrInput] = useState('');
  const [placedFinalTotal, setPlacedFinalTotal] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(true);

  const totalPrice = getTotalPrice();
  const shippingCharge = totalPrice >= 499 ? 0 : 49;
  const finalTotal = totalPrice + shippingCharge;

  const indianStates = [
    'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat',
    'Telangana', 'Uttar Pradesh', 'Rajasthan', 'West Bengal', 'Other'
  ];

  // Load saved addresses
  useEffect(() => {
    async function loadSavedAddresses() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setIsLoggedIn(false); setAddressesLoading(false); return; }
        setIsLoggedIn(true);
        if (user.email) setFormData(prev => ({ ...prev, email: user.email! }));
        const { data: addresses } = await supabase
          .from('addresses').select('*').eq('user_id', user.id)
          .order('is_default', { ascending: false });
        if (addresses && addresses.length > 0) setSavedAddresses(addresses);
      } catch (err) { console.error('Failed to load addresses:', err); }
      finally { setAddressesLoading(false); }
    }
    loadSavedAddresses();
  }, []);

  const handleSelectAddress = (address: SavedAddress) => {
    setSelectedAddressId(address.id);
    setFormData(prev => ({
      ...prev, fullName: address.full_name, phone: address.phone,
      addressLine1: address.line1, addressLine2: address.line2 || '',
      city: address.city, state: address.state, pincode: address.pincode,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (selectedAddressId && name !== 'email') setSelectedAddressId(null);
  };

  // Step 1: Create order and get UPI string
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsProcessing(true);

    try {
      const orderItems = items.map(item => ({ productId: item.product.id, quantity: item.quantity }));
      const res = await createUpiOrder({ items: orderItems, shippingAddress: formData, totalAmount: finalTotal });

      if (!res.success) throw new Error(res.error || 'Failed to create order');

      setOrderId(res.orderId!);
      setUpiString(res.upiString!);
      setPlacedFinalTotal(finalTotal);
      setCheckoutStep('payment');
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: User submits UTR after paying
  const handleSubmitUtr = async () => {
    setErrorMessage('');
    setIsSubmittingUtr(true);
    try {
      const res = await submitPaymentReference({ order_id: orderId, utr: utrInput });
      if (!res.success) throw new Error(res.error || 'Failed to submit');
      clearCart();
      setCheckoutStep('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong');
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Success Screen ──
  if (checkoutStep === 'success') {
    return (
      <div className="w-full min-h-screen bg-primary py-24 text-center flex flex-col items-center justify-center px-4">
        <div className="max-w-xl space-y-8">
          <div className="flex justify-center">
            <CheckCircle2 size={64} strokeWidth={1} className="text-accent" />
          </div>
          <h2 className="font-display text-4xl text-text-main">Order Placed Successfully</h2>
          <p className="text-sm text-text-muted font-light max-w-md mx-auto leading-relaxed">
            Your payment reference has been submitted. We will verify it and confirm your order shortly. A confirmation will be sent to <strong>{formData.email}</strong>.
          </p>
          <div className="bg-secondary border border-border p-8 text-left space-y-4 text-sm text-text-muted rounded-2xl shadow-sm">
            <div className="flex justify-between border-b border-border pb-4 font-semibold text-text-main">
              <span>Order Reference</span><span>{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span>UTR Submitted</span><span className="font-medium text-text-main">{utrInput}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-border pt-4 mt-2">
              <span>Total Amount</span><span className="text-text-main">{formatPrice(placedFinalTotal)}</span>
            </div>
          </div>
          <div className="pt-8 flex flex-col space-y-4 justify-center items-center">
            <Link href="/products" className="btn-primary w-full sm:w-64 justify-center">Continue Shopping</Link>
            <Link href="/" className="text-xs font-semibold uppercase tracking-widest text-text-muted hover:text-text-main transition-colors py-2">Return Home</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Payment Screen (UPI QR / Intent) ──
  if (checkoutStep === 'payment') {
    return (
      <div className="w-full min-h-screen bg-primary py-12">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="border-b border-border pb-6 mb-8 flex items-center">
            <button onClick={() => setCheckoutStep('form')} className="text-text-main hover:opacity-60 transition-opacity mr-6">
              <ArrowLeft size={24} strokeWidth={1.5} />
            </button>
            <div>
              <h1 className="text-3xl font-display text-text-main">Complete Payment</h1>
              <p className="text-xs text-text-muted mt-1 tracking-widest uppercase font-semibold">
                Pay {formatPrice(placedFinalTotal)} via UPI
              </p>
            </div>
          </div>

          {/* UPI Payment Card */}
          <div className="bg-secondary border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">

            {/* Device-specific payment method */}
            {isMobile ? (
              /* ── Mobile: UPI Intent Button ── */
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-xs text-text-muted uppercase tracking-widest font-semibold">
                  <Smartphone size={14} className="text-accent" />
                  <span>Pay with UPI App</span>
                </div>
                <a
                  href={upiString}
                  className="btn-primary w-full justify-center flex items-center space-x-2 text-base py-4"
                >
                  <span>Open UPI App & Pay {formatPrice(placedFinalTotal)}</span>
                </a>
                <p className="text-[11px] text-text-muted font-light">
                  Opens Google Pay, PhonePe, Paytm, or any installed UPI app.
                </p>
              </div>
            ) : (
              /* ── Desktop: QR Code ── */
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-xs text-text-muted uppercase tracking-widest font-semibold">
                  <Monitor size={14} className="text-accent" />
                  <span>Scan QR to Pay</span>
                </div>
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-xl inline-block shadow-sm border border-border">
                    <QRCodeSVG value={upiString} size={200} level="H" />
                  </div>
                </div>
                <p className="text-[11px] text-text-muted font-light">
                  Open any UPI app on your phone and scan this QR code to pay.
                </p>
                <button onClick={handleCopyUpi} className="text-xs text-accent hover:text-text-main transition-colors inline-flex items-center space-x-1">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied!' : 'Copy UPI Link'}</span>
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-semibold text-text-main mb-1">After paying, enter your UTR below</h3>
              <p className="text-[11px] text-text-muted font-light mb-4">
                Your UTR / Transaction ID is a 12-digit number found in your UPI app&apos;s payment confirmation screen.
              </p>
              <input
                type="text"
                placeholder="Enter 12-digit UTR / Transaction ID"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                maxLength={20}
                className="w-full border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm mb-4"
              />
              <button
                onClick={handleSubmitUtr}
                disabled={isSubmittingUtr || utrInput.trim().length < 10}
                className={`btn-primary w-full justify-center flex items-center space-x-2 ${
                  utrInput.trim().length < 10 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmittingUtr && <Loader2 size={16} className="animate-spin" />}
                <span>{isSubmittingUtr ? 'Submitting...' : 'Confirm Payment'}</span>
              </button>
            </div>

            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs border border-red-200 shadow-sm">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-center space-x-2 text-xs text-text-muted font-light pt-2">
              <ShieldCheck size={14} strokeWidth={1.5} className="text-accent" />
              <span>Payments are processed securely via UPI</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout Form ──
  return (
    <div className="w-full min-h-screen bg-primary py-12">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="border-b border-border pb-6 mb-12 flex items-center">
          <Link href="/cart" className="text-text-main hover:opacity-60 transition-opacity mr-6">
            <ArrowLeft size={24} strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-4xl font-display text-text-main">Checkout</h1>
            <p className="text-xs text-text-muted mt-2 tracking-widest uppercase font-semibold">Secure your order</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-secondary rounded-2xl max-w-md mx-auto space-y-8 shadow-sm">
            <h3 className="font-display text-3xl text-text-main">No items to checkout</h3>
            <p className="text-sm text-text-muted font-light">Add items to your bag before proceeding.</p>
            <Link href="/products" className="btn-primary inline-flex">Go Shopping</Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Form Column */}
            <div className="lg:col-span-8 space-y-12">

              {/* Saved Addresses Section */}
              {isLoggedIn && !addressesLoading && savedAddresses.length > 0 && (
                <div>
                  <h3 className="font-display text-xl text-text-main border-b border-border pb-4 mb-6 flex items-center space-x-3">
                    <MapPin size={20} strokeWidth={1.5} className="text-[#C9A94E]" />
                    <span>Saved Addresses</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => (
                      <button type="button" key={addr.id} onClick={() => handleSelectAddress(addr)}
                        className={`text-left border rounded-xl p-4 transition-all duration-200 space-y-2 relative ${
                          selectedAddressId === addr.id
                            ? 'border-[#C9A94E] bg-[#C9A94E08] ring-1 ring-[#C9A94E] shadow-md'
                            : 'border-border bg-secondary hover:border-[#C9A94E60] shadow-sm'
                        }`}>
                        {selectedAddressId === addr.id && (
                          <div className="absolute top-3 right-3"><CheckCircle2 size={18} className="text-[#C9A94E]" /></div>
                        )}
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-[#9A7B2F] uppercase tracking-wider">{addr.label}</span>
                          {addr.is_default && (
                            <span className="text-[10px] bg-[#C9A94E15] text-[#9A7B2F] px-1.5 py-0.5 rounded-full border border-[#C9A94E30] font-semibold uppercase">Default</span>
                          )}
                        </div>
                        <div className="text-sm space-y-0.5">
                          <p className="font-semibold text-text-main">{addr.full_name}</p>
                          <p className="text-text-muted font-light">{addr.line1}</p>
                          {addr.line2 && <p className="text-text-muted font-light">{addr.line2}</p>}
                          <p className="text-text-muted font-light">{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-text-muted font-light text-xs pt-1">📞 +91 {addr.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-3 font-light">Select a saved address to auto-fill, or type a new address below.</p>
                </div>
              )}

              {isLoggedIn && addressesLoading && (
                <div className="flex items-center space-x-2 text-sm text-text-muted py-4">
                  <Loader2 size={14} className="animate-spin text-[#C9A94E]" />
                  <span>Loading your saved addresses...</span>
                </div>
              )}

              {/* Shipping Information */}
              <div>
                <h3 className="font-display text-xl text-text-main border-b border-border pb-4 mb-8">Shipping Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Full Name *</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Contact Phone *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
                  </div>
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
                  </div>
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Street Address *</label>
                    <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} required className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
                  </div>
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Apartment, Suite, etc. (Optional)</label>
                    <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">City *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">State *</label>
                    <select name="state" value={formData.state} onChange={handleInputChange} required className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors appearance-none shadow-sm">
                      <option value="">Select State</option>
                      {indianStates.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Pincode *</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} required className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4 sticky top-32 space-y-6">
              <div className="bg-secondary/80 p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border backdrop-blur-md">
                <h3 className="font-display text-xl text-text-main border-b border-border pb-4 mb-6">Order Review</h3>
                <div className="divide-y divide-border max-h-96 overflow-y-auto no-scrollbar mb-8">
                  {items.map((item) => (
                    <div key={item.product.id} className="py-4 flex items-start justify-between text-sm">
                      <div className="flex items-start space-x-4">
                        <div className="relative w-16 h-16 bg-primary rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-border">
                          <Image src={item.product.images?.[0] || fallbackProductImage} alt={item.product.name} fill sizes="64px" className="object-cover" />
                        </div>
                        <div className="text-left">
                          <span className="block font-medium text-text-main mb-1">{item.product.name}</span>
                          <span className="block text-[10px] text-text-muted uppercase tracking-widest font-semibold">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-medium text-text-main">{formatPrice((item.product.salePrice || item.product.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-6 space-y-4 text-sm font-light text-text-muted">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(totalPrice)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{totalPrice >= 499 ? 'Complimentary' : formatPrice(shippingCharge)}</span></div>
                </div>
                <div className="border-t border-border pt-6 mt-6 mb-8 flex justify-between items-center text-base font-semibold text-text-main">
                  <span>Final Total</span><span>{formatPrice(finalTotal)}</span>
                </div>
                <button type="submit" disabled={isProcessing} className="btn-primary w-full justify-center flex items-center space-x-2 mb-6">
                  {isProcessing && <Loader2 size={16} className="animate-spin" />}
                  <span>{isProcessing ? 'Processing...' : 'Proceed to UPI Payment'}</span>
                </button>
              </div>
              <div className="space-y-3 text-center px-4">
                <div className="flex items-center justify-center space-x-2 text-xs text-text-main font-semibold uppercase tracking-widest">
                  <ShieldCheck size={14} strokeWidth={1.5} className="text-accent" />
                  <span>UPI Secure Payment</span>
                </div>
                <p className="text-[11px] text-text-muted font-light leading-relaxed">
                  Pay directly via any UPI app — Google Pay, PhonePe, Paytm, or BHIM. Zero transaction fees.
                </p>
                {errorMessage && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs border border-red-200 mt-2 text-left shadow-sm">{errorMessage}</div>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
