'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { ArrowLeft, CheckCircle2, ShieldCheck, CreditCard, Loader2, MapPin } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/data';
import { createOrder, verifyPayment } from '@/app/actions/orderActions';
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

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart, getTotalItems } = useCartStore();
  const fallbackProductImage = '/images/products/facial-kit-1.png';
  
  // Checkout Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [placedFinalTotal, setPlacedFinalTotal] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(true);

  const totalPrice = getTotalPrice();
  const shippingCharge = totalPrice >= 499 ? 0 : 49;
  const finalTotal = totalPrice + shippingCharge;

  // Indian States
  const indianStates = [
    'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 
    'Telangana', 'Uttar Pradesh', 'Rajasthan', 'West Bengal', 'Other'
  ];

  // Fetch saved addresses on mount
  useEffect(() => {
    async function loadSavedAddresses() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoggedIn(false);
          setAddressesLoading(false);
          return;
        }

        setIsLoggedIn(true);

        // Pre-fill email from user profile
        if (user.email) {
          setFormData(prev => ({ ...prev, email: user.email! }));
        }

        const { data: addresses } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });

        if (addresses && addresses.length > 0) {
          setSavedAddresses(addresses);
        }
      } catch (err) {
        console.error('Failed to load saved addresses:', err);
      } finally {
        setAddressesLoading(false);
      }
    }

    loadSavedAddresses();
  }, []);

  const handleSelectAddress = (address: SavedAddress) => {
    setSelectedAddressId(address.id);
    setFormData(prev => ({
      ...prev,
      fullName: address.full_name,
      phone: address.phone,
      addressLine1: address.line1,
      addressLine2: address.line2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear selected address highlight when user manually edits the form
    if (selectedAddressId && name !== 'email') {
      setSelectedAddressId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsProcessing(true);
    
    try {
      // Create order on server
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const res = await createOrder({
        items: orderItems,
        shippingAddress: formData,
        totalAmount: finalTotal
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: res.keyId,
        amount: res.amount,
        currency: 'INR',
        name: 'Beauty Looks Mumbai',
        description: 'Premium Beauty Products',
        image: '/images/brand/logo.png',
        order_id: res.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Verify payment on server
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: res.orderId
            });

            if (verifyRes.success) {
              setOrderId(res.orderId);
              setPlacedFinalTotal(finalTotal);
              setOrderPlaced(true);
              clearCart();
            } else {
              setErrorMessage(verifyRes.error || 'Payment verification failed');
            }
          } catch (err: any) {
            setErrorMessage('Payment verification error: ' + err.message);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#CA8A04',
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        setErrorMessage(response.error.description);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Something went wrong');
      setIsProcessing(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="w-full min-h-screen bg-primary py-24 text-center flex flex-col items-center justify-center px-4">
        <div className="max-w-xl space-y-8 relative">
          <div className="flex justify-center">
            <CheckCircle2 size={64} strokeWidth={1} className="text-accent" />
          </div>
          <h2 className="font-display text-4xl text-text-main">Order Confirmed</h2>
          <p className="text-sm text-text-muted font-light max-w-md mx-auto leading-relaxed">
            Thank you for your purchase. Your order is being processed and a confirmation email has been sent to <strong>{formData.email}</strong>.
          </p>
          
          <div className="bg-secondary border border-border p-8 text-left space-y-4 text-sm text-text-muted rounded-2xl shadow-sm">
            <div className="flex justify-between border-b border-border pb-4 font-semibold text-text-main">
              <span>Order Reference</span>
              <span>{orderId}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span>Customer Name</span>
              <span className="font-medium text-text-main">{formData.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Address</span>
              <span className="font-medium text-text-main truncate max-w-[200px]">
                {formData.addressLine1}, {formData.city}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Contact Number</span>
              <span className="font-medium text-text-main">{formData.phone}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-border pt-4 mt-2">
              <span>Total Paid</span>
              <span className="text-text-main">{formatPrice(placedFinalTotal)}</span>
            </div>
          </div>

          <div className="pt-8 flex flex-col space-y-4 justify-center items-center">
            <Link href="/products" className="btn-primary w-full sm:w-64 justify-center">
              Continue Shopping
            </Link>
            <Link href="/" className="text-xs font-semibold uppercase tracking-widest text-text-muted hover:text-text-main transition-colors py-2">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="w-full min-h-screen bg-primary py-12">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="border-b border-border pb-6 mb-12 flex items-center">
          <Link href="/cart" className="text-text-main hover:opacity-60 transition-opacity mr-6">
            <ArrowLeft size={24} strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-4xl font-display text-text-main">
              Checkout
            </h1>
            <p className="text-xs text-text-muted mt-2 tracking-widest uppercase font-semibold">
              Secure your order
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-secondary rounded-2xl max-w-md mx-auto space-y-8 shadow-sm">
            <h3 className="font-display text-3xl text-text-main">No items to checkout</h3>
            <p className="text-sm text-text-muted font-light">Add items to your bag before proceeding.</p>
            <Link href="/products" className="btn-primary inline-flex">Go Shopping</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
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
                      <button
                        type="button"
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`text-left border rounded-xl p-4 transition-all duration-200 space-y-2 relative ${
                          selectedAddressId === addr.id
                            ? 'border-[#C9A94E] bg-[#C9A94E08] ring-1 ring-[#C9A94E] shadow-md'
                            : 'border-border bg-secondary hover:border-[#C9A94E60] shadow-sm'
                        }`}
                      >
                        {/* Selection indicator */}
                        {selectedAddressId === addr.id && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle2 size={18} className="text-[#C9A94E]" />
                          </div>
                        )}
                        
                        {/* Label & Default badge */}
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-[#9A7B2F] uppercase tracking-wider">{addr.label}</span>
                          {addr.is_default && (
                            <span className="text-[10px] bg-[#C9A94E15] text-[#9A7B2F] px-1.5 py-0.5 rounded-full border border-[#C9A94E30] font-semibold uppercase">
                              Default
                            </span>
                          )}
                        </div>

                        {/* Address details */}
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
                  <p className="text-xs text-text-muted mt-3 font-light">
                    Select a saved address to auto-fill, or type a new address below.
                  </p>
                </div>
              )}

              {/* Loading state for addresses */}
              {isLoggedIn && addressesLoading && (
                <div className="flex items-center space-x-2 text-sm text-text-muted py-4">
                  <Loader2 size={14} className="animate-spin text-[#C9A94E]" />
                  <span>Loading your saved addresses...</span>
                </div>
              )}
              
              {/* Shipping Information */}
              <div>
                <h3 className="font-display text-xl text-text-main border-b border-border pb-4 mb-8">
                  Shipping Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Name */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Contact Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm"
                    />
                  </div>

                  {/* Address 1 */}
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      required
                      className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm"
                    />
                  </div>

                  {/* Address 2 */}
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Apartment, Suite, etc. (Optional)</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm"
                    />
                  </div>

                  {/* City */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm"
                    />
                  </div>

                  {/* State */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">State *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors appearance-none shadow-sm"
                    >
                      <option value="">Select State</option>
                      {indianStates.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Pincode */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                      className="border border-border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4 sticky top-32 space-y-6">
              <div className="bg-secondary/80 p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border backdrop-blur-md">
              <h3 className="font-display text-xl text-text-main border-b border-border pb-4 mb-6">
                Order Review
              </h3>

              {/* List of items */}
              <div className="divide-y divide-border max-h-96 overflow-y-auto no-scrollbar mb-8">
                {items.map((item) => (
                  <div key={item.product.id} className="py-4 flex items-start justify-between text-sm">
                    <div className="flex items-start space-x-4">
                      <div className="relative w-16 h-16 bg-primary rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-border">
                        <Image
                          src={item.product.images?.[0] || fallbackProductImage}
                          alt={item.product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <span className="block font-medium text-text-main mb-1">{item.product.name}</span>
                        <span className="block text-[10px] text-text-muted uppercase tracking-widest font-semibold">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-medium text-text-main">
                      {formatPrice((item.product.salePrice || item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing list */}
              <div className="border-t border-border pt-6 space-y-4 text-sm font-light text-text-muted">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{totalPrice >= 499 ? 'Complimentary' : formatPrice(shippingCharge)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-border pt-6 mt-6 mb-8 flex justify-between items-center text-base font-semibold text-text-main">
                <span>Final Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="btn-primary w-full justify-center flex items-center space-x-2 mb-6"
              >
                {isProcessing && <Loader2 size={16} className="animate-spin" />}
                <span>{isProcessing ? 'Processing...' : 'Proceed to Payment'}</span>
              </button>

              </div>
              <div className="space-y-3 text-center px-4">
                <div className="flex items-center justify-center space-x-2 text-xs text-text-main font-semibold uppercase tracking-widest">
                  <ShieldCheck size={14} strokeWidth={1.5} className="text-accent" />
                  <span>Razorpay Secure</span>
                </div>
                <p className="text-[11px] text-text-muted font-light leading-relaxed">
                  You will be redirected to Razorpay to complete your payment securely via UPI, Cards, or Netbanking.
                </p>
                {errorMessage && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs border border-red-200 mt-2 text-left shadow-sm">
                    {errorMessage}
                  </div>
                )}
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
    </>
  );
}
