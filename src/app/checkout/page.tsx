'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import { ArrowLeft, CheckCircle2, ShieldCheck, Loader2, MapPin, Smartphone, CreditCard, MessageCircle, Check, Plus, Trash2, Edit2, X } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/data';
import { createRazorpayOrder, verifyPayment, recordPaymentFailure } from '@/app/actions/orderActions';
import { validateDiscountCode } from '@/app/actions/discountActions';
import { createAddress, updateAddress, deleteAddress, upgradeGuestToAccount } from '@/app/actions/accountActions';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';

const shippingSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  email: z.string().email('Valid email address is required'),
  addressLine1: z.string().min(5, 'Street address is required'),
  addressLine2: z.string().min(2, 'Area/Sector is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid 6-digit pincode is required')
});

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

declare global {
  interface Window {
    Razorpay: any;
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get('mode') === 'buynow';
  
  const { items: cartItems, buyNowItem, getTotalPrice: getCartTotalPrice, clearCart, clearBuyNowItem } = useCartStore();
  const fallbackProductImage = '/images/products/facial-kit-1.png';

  const checkoutItems = isBuyNow ? (buyNowItem ? [buyNowItem] : []) : cartItems;

  // Form State
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '',
    addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
  });

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'standard'>('upi');

  // Checkout flow states
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'success'>('form');
  const [orderId, setOrderId] = useState('');
  const [placedFinalTotal, setPlacedFinalTotal] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  
  // Refs for auto-scrolling
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | null>>({});

  // Guest conversion state
  const [conversionPassword, setConversionPassword] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(true);

  // Modals & Scrolling
  const paymentRef = useRef<HTMLDivElement>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  // Discount Codes
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{code: string, percent: number} | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  // Pricing Logic
  const totalPrice = isBuyNow 
    ? (buyNowItem ? (buyNowItem.product.salePrice ?? buyNowItem.product.price) * buyNowItem.quantity : 0)
    : getCartTotalPrice();
    
  const shippingCharge = totalPrice >= 499 ? 0 : 49;
  const baseFinalTotal = totalPrice + shippingCharge;
  const couponDiscountAmount = appliedDiscount ? baseFinalTotal * (appliedDiscount.percent / 100) : 0;
  
  const totalAfterCoupon = baseFinalTotal - couponDiscountAmount;
  const upiDiscountAmount = paymentMethod === 'upi' ? totalAfterCoupon * 0.02 : 0;
  
  const finalTotal = totalAfterCoupon - upiDiscountAmount;

  const handleApplyDiscount = async () => {
    if (!discountCodeInput.trim()) {
      setDiscountError('Please enter a code');
      return;
    }
    setIsApplyingDiscount(true);
    setDiscountError('');
    try {
      const res = await validateDiscountCode(discountCodeInput.trim());
      if (res.error) {
        setDiscountError(res.error);
        setAppliedDiscount(null);
      } else if (res.success && res.discount) {
        setAppliedDiscount({ code: res.discount.code, percent: res.discount.discount_percent });
        setDiscountError('');
      }
    } catch (err) {
      setDiscountError('Failed to apply discount');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCodeInput('');
    setDiscountError('');
  };

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
    
    // Auto-scroll to payment section
    setTimeout(() => {
      if (paymentRef.current) {
        paymentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (selectedAddressId && name !== 'email') setSelectedAddressId(null);
  };

  // Address CRUD Handlers
  const handleAddressSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    const formDataObj = new FormData(e.currentTarget);
    
    let res;
    if (editingAddress) {
      res = await updateAddress(editingAddress.id, formDataObj);
    } else {
      res = await createAddress(formDataObj);
    }

    if (res.error) {
      setModalError(res.error);
    } else if (res.data) {
      setIsAddressModalOpen(false);
      
      const newAddr: SavedAddress = {
        id: res.data.id,
        label: res.data.label,
        full_name: res.data.full_name,
        phone: res.data.phone,
        line1: res.data.line1,
        line2: res.data.line2,
        city: res.data.city,
        state: res.data.state,
        pincode: res.data.pincode,
        is_default: res.data.is_default
      };

      if (editingAddress) {
        setSavedAddresses(prev => prev.map(a => a.id === editingAddress.id ? newAddr : (newAddr.is_default ? { ...a, is_default: false } : a)));
      } else {
        setSavedAddresses(prev => {
          const updated = newAddr.is_default ? prev.map(a => ({ ...a, is_default: false })) : prev;
          return [newAddr, ...updated];
        });
      }
    }
    setModalLoading(false);
  };

  const handleDeleteAddress = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent address selection
    if (!confirm('Are you sure you want to remove this address?')) return;

    const res = await deleteAddress(id);
    if (res.error) {
      alert(res.error);
    } else {
      setSavedAddresses(prev => prev.filter(addr => addr.id !== id));
      if (selectedAddressId === id) setSelectedAddressId(null);
    }
  };

  const openAddressModal = (address: SavedAddress | null = null) => {
    setEditingAddress(address);
    setModalError(null);
    setIsAddressModalOpen(true);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setFormErrors({});
    setIsProcessing(true);

    if (!window.Razorpay) {
      setErrorMessage('Payment gateway is loading. Please try again in a few seconds.');
      setIsProcessing(false);
      return;
    }

    // Validate using Zod
    const parsed = shippingSchema.safeParse(formData);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      let firstErrorField: string | null = null;
      
      parsed.error.issues.forEach(issue => {
        const field = issue.path[0] as string;
        if (!errors[field]) {
          errors[field] = issue.message;
          if (!firstErrorField) firstErrorField = field;
        }
      });
      
      setFormErrors(errors);
      setErrorMessage('Please complete all required shipping and contact fields correctly before proceeding.');
      setIsProcessing(false);
      
      // Auto-scroll to the first invalid field
      if (firstErrorField && inputRefs.current[firstErrorField]) {
        inputRefs.current[firstErrorField]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inputRefs.current[firstErrorField]?.focus();
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    try {
      const orderItems = checkoutItems.map(item => ({ productId: item.product.id, quantity: item.quantity }));
      const res = await createRazorpayOrder({ 
        items: orderItems, 
        shippingAddress: formData,
        paymentMethod,
        discountCode: appliedDiscount?.code,
        expectedTotal: finalTotal // Pass expected total for server validation
      });

      if (!res.success || !res.razorpayOrderId) {
        throw new Error(res.error || 'Failed to create order');
      }

      setOrderId(res.orderId!);
      setPlacedFinalTotal(finalTotal);

      const options: any = {
        key: res.keyId || 'rzp_test_dummy', 
        amount: res.amount,
        currency: 'INR',
        name: 'Beauty Looks Mumbai',
        description: 'Order Payment',
        order_id: res.razorpayOrderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#C9A94E',
        },
        handler: async function (response: any) {
          setIsProcessing(true);
          try {
            const verifyRes = await verifyPayment({
              order_id: res.orderId!,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.success) {
              if (isBuyNow) {
                clearBuyNowItem();
              } else {
                clearCart();
              }
              setCheckoutStep('success');
            } else {
              setErrorMessage(verifyRes.error || 'Payment verification failed.');
              setIsProcessing(false);
            }
          } catch (error) {
            setErrorMessage('Payment verification error.');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: async function () {
            setIsProcessing(false);
            if (res.orderId) {
              await recordPaymentFailure({ order_id: res.orderId, reason: 'User dismissed checkout modal' });
            }
          }
        }
      };

      if (paymentMethod === 'upi') {
        options.config = {
          display: {
            blocks: {
              upi: {
                name: 'UPI Options',
                instruments: [
                  { method: 'upi' }
                ]
              }
            },
            sequence: ['block.upi'],
            preferences: {
              show_default_blocks: false
            }
          }
        };
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response: any) {
        setErrorMessage(response.error?.description || 'Payment failed.');
        setIsProcessing(false);
        if (res.orderId) {
          await recordPaymentFailure({ order_id: res.orderId, reason: response.error?.description || 'Payment failed' });
        }
      });
      rzp.open();

    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong');
      setIsProcessing(false);
    }
  };

  const handleGuestConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversionPassword) return;
    
    setIsConverting(true);
    setConversionStatus(null);
    
    const res = await upgradeGuestToAccount(formData.email, conversionPassword, formData.fullName, formData.phone);
    if (res.success) {
      setConversionStatus({ type: 'success', message: 'Account created successfully! Please check your email to verify your account.' });
    } else {
      setConversionStatus({ type: 'error', message: res.error || 'Failed to create account.' });
    }
    setIsConverting(false);
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
            Your payment has been successfully processed and your order is confirmed! A receipt will be sent to <strong>{formData.email}</strong>.
          </p>
          <div className="bg-secondary border border-border p-8 text-left space-y-4 text-sm text-text-muted rounded-2xl shadow-sm">
            <div className="flex justify-between border-b border-border pb-4 font-semibold text-text-main">
              <span>Order ID</span><span>{orderId}</span>
            </div>
            <div className="flex justify-between font-semibold border-border pt-2">
              <span>Total Paid</span><span className="text-text-main">{formatPrice(placedFinalTotal)}</span>
            </div>
          </div>
          
          {!isLoggedIn && !conversionStatus?.type && (
            <div className="bg-primary border border-[#C9A94E30] p-8 text-left space-y-4 rounded-2xl shadow-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C9A94E] to-[#9A7B2F]" />
              <div className="flex flex-col space-y-1">
                <h3 className="font-display text-xl text-text-main">Save your details for next time?</h3>
                <p className="text-xs text-text-muted">Set a password to create an account with <strong>{formData.email}</strong> to track orders and save time at checkout.</p>
              </div>
              <form onSubmit={handleGuestConversion} className="flex flex-col space-y-3 pt-2">
                <input 
                  type="password" 
                  placeholder="Set a strong password" 
                  value={conversionPassword}
                  onChange={(e) => setConversionPassword(e.target.value)}
                  required
                  minLength={8}
                  className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A94E] transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={isConverting || conversionPassword.length < 8}
                  className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm py-3"
                >
                  {isConverting ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            </div>
          )}
          
          {conversionStatus?.type === 'success' && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-sm flex items-start space-x-3 text-left">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <p>{conversionStatus.message}</p>
            </div>
          )}
          
          {conversionStatus?.type === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl text-sm flex items-start space-x-3 text-left">
              <span className="text-red-600 shrink-0 mt-0.5 font-bold">!</span>
              <p>{conversionStatus.message}</p>
            </div>
          )}

          <div className="pt-4 flex flex-col space-y-4 justify-center items-center">
            <a 
              href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi, I would like to track my order: ${orderId}`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary w-full sm:w-64 justify-center !bg-[#25D366] !text-white hover:opacity-90 flex items-center space-x-2 border-none shadow-[0_8px_20px_rgba(37,211,102,0.3)]"
            >
              <MessageCircle size={18} />
              <span>Track via WhatsApp</span>
            </a>
            <Link href="/products" className="btn-primary w-full sm:w-64 justify-center bg-white text-text-main hover:bg-secondary">Continue Shopping</Link>
            <Link href="/" className="text-xs font-semibold uppercase tracking-widest text-text-muted hover:text-text-main transition-colors py-2">Return Home</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout Form ──
  return (
    <div className="w-full min-h-screen bg-primary py-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" onLoad={() => setIsRazorpayLoaded(true)} />
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

        {checkoutItems.length === 0 ? (
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
                  <h3 className="font-display text-xl text-text-main border-b border-border pb-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin size={20} strokeWidth={1.5} className="text-[#C9A94E]" />
                      <span>Saved Addresses</span>
                    </div>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => (
                      <button type="button" key={addr.id} onClick={() => handleSelectAddress(addr)}
                        className={`text-left border rounded-xl p-4 transition-all duration-200 space-y-2 relative flex flex-col justify-between ${
                          selectedAddressId === addr.id
                            ? 'border-[#C9A94E] bg-[#C9A94E08] ring-1 ring-[#C9A94E] shadow-md'
                            : 'border-border bg-secondary hover:border-[#C9A94E60] shadow-sm'
                        }`}>
                        {selectedAddressId === addr.id && (
                          <div className="absolute top-3 right-3"><CheckCircle2 size={18} className="text-[#C9A94E]" /></div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-[#9A7B2F] uppercase tracking-wider">{addr.label}</span>
                            {addr.is_default && (
                              <span className="text-[10px] bg-[#C9A94E15] text-[#9A7B2F] px-1.5 py-0.5 rounded-full border border-[#C9A94E30] font-semibold uppercase">Default</span>
                            )}
                          </div>
                          <div className="text-sm space-y-0.5 mt-2">
                            <p className="font-semibold text-text-main">{addr.full_name}</p>
                            <p className="text-text-muted font-light">{addr.line1}</p>
                            {addr.line2 && <p className="text-text-muted font-light">{addr.line2}</p>}
                            <p className="text-text-muted font-light">{addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-text-muted font-light text-xs pt-1">📞 +91 {addr.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between w-full pt-3 mt-2 border-t border-black/5">
                          <span className="text-xs font-medium text-[#C9A94E]">
                            {selectedAddressId === addr.id ? 'Selected' : 'Select'}
                          </span>
                          <div className="flex items-center space-x-3">
                            <div
                              onClick={(e) => { e.stopPropagation(); openAddressModal(addr); }}
                              className="text-text-muted hover:text-text-main transition-colors p-1"
                            >
                              <Edit2 size={14} />
                            </div>
                            <div
                              onClick={(e) => handleDeleteAddress(e, addr.id)}
                              className="text-text-muted hover:text-red-600 transition-colors p-1"
                            >
                              <Trash2 size={14} />
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <p className="text-xs text-text-muted font-light">Select a saved address or add a new one.</p>
                    <button 
                      type="button" 
                      onClick={() => openAddressModal()}
                      className="text-sm font-semibold text-[#9A7B2F] hover:text-[#C9A94E] flex items-center space-x-1"
                    >
                      <Plus size={16} />
                      <span>Add New Address</span>
                    </button>
                  </div>
                </div>
              )}

              {isLoggedIn && addressesLoading && (
                <div className="flex items-center space-x-2 text-sm text-text-muted py-4">
                  <Loader2 size={14} className="animate-spin text-[#C9A94E]" />
                  <span>Loading your saved addresses...</span>
                </div>
              )}

              {/* Shipping Information (Manual Form) */}
              {(!isLoggedIn || savedAddresses.length === 0 || showManualForm) ? (
                <div>
                  <h3 className="font-display text-xl text-text-main border-b border-border pb-4 mb-8 flex justify-between items-center">
                    <span>Shipping Information</span>
                    {savedAddresses.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowManualForm(false);
                          if (savedAddresses.length > 0) handleSelectAddress(savedAddresses[0]);
                        }}
                        className="text-xs font-medium text-text-muted hover:text-text-main underline"
                      >
                        Cancel Manual Entry
                      </button>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Full Name *</label>
                      <input ref={(el) => { inputRefs.current['fullName'] = el; }} type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} aria-invalid={!!formErrors.fullName} className={`border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors shadow-sm ${formErrors.fullName ? 'border-red-500 focus:border-red-600 bg-red-50/10' : 'border-border focus:border-text-main'}`} />
                      {formErrors.fullName && <span className="text-red-500 text-[10px] mt-1">{formErrors.fullName}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Contact Phone *</label>
                      <input ref={(el) => { inputRefs.current['phone'] = el; }} type="tel" name="phone" value={formData.phone} onChange={handleInputChange} aria-invalid={!!formErrors.phone} className={`border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors shadow-sm ${formErrors.phone ? 'border-red-500 focus:border-red-600 bg-red-50/10' : 'border-border focus:border-text-main'}`} />
                      {formErrors.phone && <span className="text-red-500 text-[10px] mt-1">{formErrors.phone}</span>}
                    </div>
                    <div className="flex flex-col sm:col-span-2">
                      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Email Address *</label>
                      <input ref={(el) => { inputRefs.current['email'] = el; }} type="email" name="email" value={formData.email} onChange={handleInputChange} aria-invalid={!!formErrors.email} className={`border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors shadow-sm ${formErrors.email ? 'border-red-500 focus:border-red-600 bg-red-50/10' : 'border-border focus:border-text-main'}`} />
                      {formErrors.email && <span className="text-red-500 text-[10px] mt-1">{formErrors.email}</span>}
                    </div>
                    <div className="flex flex-col sm:col-span-2">
                      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Street Address *</label>
                      <input ref={(el) => { inputRefs.current['addressLine1'] = el; }} type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} aria-invalid={!!formErrors.addressLine1} className={`border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors shadow-sm ${formErrors.addressLine1 ? 'border-red-500 focus:border-red-600 bg-red-50/10' : 'border-border focus:border-text-main'}`} />
                      {formErrors.addressLine1 && <span className="text-red-500 text-[10px] mt-1">{formErrors.addressLine1}</span>}
                    </div>
                    <div className="flex flex-col sm:col-span-2">
                      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Area, Colony, Street, Sector *</label>
                      <input ref={(el) => { inputRefs.current['addressLine2'] = el; }} type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} aria-invalid={!!formErrors.addressLine2} className={`border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors shadow-sm ${formErrors.addressLine2 ? 'border-red-500 focus:border-red-600 bg-red-50/10' : 'border-border focus:border-text-main'}`} />
                      {formErrors.addressLine2 && <span className="text-red-500 text-[10px] mt-1">{formErrors.addressLine2}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">City *</label>
                      <input ref={(el) => { inputRefs.current['city'] = el; }} type="text" name="city" value={formData.city} onChange={handleInputChange} aria-invalid={!!formErrors.city} className={`border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors shadow-sm ${formErrors.city ? 'border-red-500 focus:border-red-600 bg-red-50/10' : 'border-border focus:border-text-main'}`} />
                      {formErrors.city && <span className="text-red-500 text-[10px] mt-1">{formErrors.city}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">State *</label>
                      <select ref={(el) => { inputRefs.current['state'] = el; }} name="state" value={formData.state} onChange={handleInputChange} aria-invalid={!!formErrors.state} className={`border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none appearance-none transition-colors shadow-sm ${formErrors.state ? 'border-red-500 focus:border-red-600 bg-red-50/10' : 'border-border focus:border-text-main'}`}>
                        <option value="">Select State</option>
                        {indianStates.map((s) => (<option key={s} value={s}>{s}</option>))}
                      </select>
                      {formErrors.state && <span className="text-red-500 text-[10px] mt-1">{formErrors.state}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Pincode *</label>
                      <input ref={(el) => { inputRefs.current['pincode'] = el; }} type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} aria-invalid={!!formErrors.pincode} className={`border bg-primary rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors shadow-sm ${formErrors.pincode ? 'border-red-500 focus:border-red-600 bg-red-50/10' : 'border-border focus:border-text-main'}`} />
                      {formErrors.pincode && <span className="text-red-500 text-[10px] mt-1">{formErrors.pincode}</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden">
                  {/* Keep inputs in DOM if needed by form submit, though we handle placing order directly via state */}
                </div>
              )}

              {/* Payment Method Selection */}
              <div ref={paymentRef} className="scroll-mt-24">
                <h3 className="font-display text-xl text-text-main border-b border-border pb-4 mb-6 flex items-center space-x-3">
                  <ShieldCheck size={20} strokeWidth={1.5} className="text-[#C9A94E]" />
                  <span>Payment Method</span>
                </h3>
                <div className="space-y-4">
                  {/* UPI Option */}
                  <label className={`cursor-pointer block border rounded-xl p-5 transition-all duration-200 ${
                    paymentMethod === 'upi'
                      ? 'border-[#C9A94E] bg-[#C9A94E08] ring-1 ring-[#C9A94E] shadow-md'
                      : 'border-border bg-secondary hover:border-[#C9A94E60] shadow-sm'
                  }`}>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center space-x-4">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          paymentMethod === 'upi' ? 'border-[#C9A94E]' : 'border-border'
                        }`}>
                          {paymentMethod === 'upi' && <div className="w-3 h-3 bg-[#C9A94E] rounded-full" />}
                        </div>
                        <div className="flex items-center space-x-3">
                          <Smartphone size={24} className="text-text-main" strokeWidth={1.5} />
                          <div>
                            <span className="block font-semibold text-text-main">UPI Payment</span>
                            <span className="block text-[11px] text-text-muted font-light mt-0.5">Google Pay, PhonePe, Paytm</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#16a34a15] text-[#16a34a] border border-[#16a34a30] px-3.5 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 shrink-0">
                        <Check size={13} />
                        <span>Save 2% Instantly</span>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="upi" 
                      checked={paymentMethod === 'upi'} 
                      onChange={(e) => setPaymentMethod(e.target.value as 'upi')} 
                      className="hidden" 
                    />
                  </label>

                  {/* Standard Option */}
                  <label className={`cursor-pointer block border rounded-xl p-5 transition-all duration-200 ${
                    paymentMethod === 'standard'
                      ? 'border-text-main bg-white shadow-md'
                      : 'border-border bg-secondary hover:border-text-main shadow-sm'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'standard' ? 'border-text-main' : 'border-border'
                      }`}>
                        {paymentMethod === 'standard' && <div className="w-3 h-3 bg-text-main rounded-full" />}
                      </div>
                      <div className="flex items-center space-x-3">
                        <CreditCard size={24} className="text-text-main" strokeWidth={1.5} />
                        <div>
                          <span className="block font-semibold text-text-main">Credit/Debit Cards & Netbanking</span>
                          <span className="block text-[11px] text-text-muted font-light mt-0.5">All major cards supported</span>
                        </div>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="standard" 
                      checked={paymentMethod === 'standard'} 
                      onChange={(e) => setPaymentMethod(e.target.value as 'standard')} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4 sticky top-32 space-y-6">
              <div className="bg-secondary/80 p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border backdrop-blur-md">
                <h3 className="font-display text-xl text-text-main border-b border-border pb-4 mb-6">Order Review</h3>
                <div className="divide-y divide-border max-h-96 overflow-y-auto no-scrollbar mb-8">
                  {checkoutItems.map((item) => (
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
                      <span className="font-medium text-text-main">{formatPrice((item.product.salePrice ?? item.product.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-6 space-y-4 text-sm font-light text-text-muted">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(totalPrice)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{totalPrice >= 499 ? 'Complimentary' : formatPrice(shippingCharge)}</span></div>
                  
                  {/* Dynamic Discount Rows */}
                  {appliedDiscount && (
                    <div className="flex justify-between text-[#16a34a] font-medium">
                      <span>Coupon ({appliedDiscount.code})</span>
                      <span>- {formatPrice(couponDiscountAmount)}</span>
                    </div>
                  )}
                  {paymentMethod === 'upi' && (
                    <div className="flex justify-between text-[#16a34a] font-medium">
                      <span>UPI 2% Discount</span>
                      <span>- {formatPrice(upiDiscountAmount)}</span>
                    </div>
                  )}
                </div>
                
                {/* Apply Coupon Section */}
                <div className="border-t border-border pt-6">
                  <h4 className="text-sm font-semibold text-text-main mb-3">Apply Coupon</h4>
                  {appliedDiscount ? (
                    <div className="flex items-center justify-between bg-green-50/50 border border-green-200 p-3 rounded-xl">
                      <div className="flex items-center space-x-2 text-green-700">
                        <CheckCircle2 size={16} />
                        <span className="text-sm font-medium">{appliedDiscount.code} applied</span>
                      </div>
                      <button type="button" onClick={removeDiscount} className="text-xs text-red-500 hover:text-red-600 font-medium">Remove</button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={discountCodeInput}
                          onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="flex-1 input-field uppercase py-2.5 text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleApplyDiscount}
                          disabled={isApplyingDiscount || !discountCodeInput.trim()}
                          className="btn-secondary px-4 py-2.5 text-sm whitespace-nowrap disabled:opacity-50"
                        >
                          {isApplyingDiscount ? '...' : 'Apply'}
                        </button>
                      </div>
                      {discountError && <p className="text-xs text-red-500 mt-2">{discountError}</p>}
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-6 mt-6 mb-8 flex justify-between items-center text-base font-semibold text-text-main">
                  <span>Final Total</span><span>{formatPrice(finalTotal)}</span>
                </div>
                <button type="submit" disabled={isProcessing || !isRazorpayLoaded} className="btn-primary w-full justify-center flex items-center space-x-2 mb-6 text-base py-4 disabled:opacity-70 disabled:cursor-not-allowed transition-all relative overflow-hidden">
                  {(!isRazorpayLoaded || isProcessing) && (
                    <div className="absolute inset-0 bg-[#0C0A09] flex items-center justify-center">
                      <Loader2 size={20} className="animate-spin text-[#C9A94E]" />
                    </div>
                  )}
                  <span className={(!isRazorpayLoaded || isProcessing) ? 'opacity-0' : 'opacity-100'}>
                    Place Order & Pay
                  </span>
                </button>
              </div>
              <div className="space-y-3 text-center px-4">
                <div className="flex items-center justify-center space-x-2 text-xs text-text-main font-semibold uppercase tracking-widest">
                  <ShieldCheck size={14} strokeWidth={1.5} className="text-accent" />
                  <span>Secure Encrypted Payment</span>
                </div>
                <p className="text-[11px] text-text-muted font-light leading-relaxed">
                  Your payment information is processed securely by Razorpay. We do not store your card details.
                </p>
                {errorMessage && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs border border-red-200 mt-2 text-left shadow-sm">{errorMessage}</div>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
      
      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-primary rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative no-scrollbar">
            <div className="sticky top-0 bg-primary/90 backdrop-blur-md z-10 px-6 py-5 border-b border-border flex justify-between items-center">
              <h3 className="font-display text-xl text-text-main">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button 
                onClick={() => setIsAddressModalOpen(false)}
                className="text-text-muted hover:text-text-main transition-colors p-2 -mr-2"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddressSubmit} className="p-6 space-y-6">
              {modalError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-200">
                  {modalError}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col sm:col-span-2">
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Address Label</label>
                  <select name="label" defaultValue={editingAddress?.label || 'Home'} required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors appearance-none shadow-sm">
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Full Name *</label>
                  <input type="text" name="fullName" defaultValue={editingAddress?.full_name || ''} required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Phone Number *</label>
                  <input type="tel" name="phone" defaultValue={editingAddress?.phone || ''} required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
                </div>
                <div className="flex flex-col sm:col-span-2">
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Street Address *</label>
                  <input type="text" name="line1" defaultValue={editingAddress?.line1 || ''} required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
                </div>
                <div className="flex flex-col sm:col-span-2">
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Apartment, Suite, etc. (Optional)</label>
                  <input type="text" name="line2" defaultValue={editingAddress?.line2 || ''} className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">City *</label>
                  <input type="text" name="city" defaultValue={editingAddress?.city || ''} required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">State *</label>
                  <select name="state" defaultValue={editingAddress?.state || ''} required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors appearance-none shadow-sm">
                    <option value="">Select State</option>
                    {indianStates.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Pincode *</label>
                  <input type="text" name="pincode" defaultValue={editingAddress?.pincode || ''} required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
                </div>
                
                <div className="flex items-center space-x-3 sm:col-span-2 pt-2">
                  <input type="checkbox" id="isDefault" name="isDefault" value="true" defaultChecked={editingAddress?.is_default || false} className="w-4 h-4 text-[#9A7B2F] border-border rounded focus:ring-[#9A7B2F]" />
                  <label htmlFor="isDefault" className="text-sm font-medium text-text-main">Set as default shipping address</label>
                </div>
              </div>
              
              <div className="pt-6 border-t border-border flex justify-end space-x-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddressModalOpen(false)}
                  disabled={modalLoading}
                  className="px-6 py-3 text-sm font-medium text-text-muted hover:text-text-main transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={modalLoading}
                  className="btn-primary py-3 px-8 text-sm flex items-center space-x-2"
                >
                  {modalLoading && <Loader2 size={16} className="animate-spin" />}
                  <span>{editingAddress ? 'Update Address' : 'Save Address'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-primary"><Loader2 size={32} className="animate-spin text-accent" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
