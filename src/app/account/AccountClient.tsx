'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User, ShoppingBag, MapPin, LogOut, Package, ShieldCheck, 
  Crown, Mail, Phone as PhoneIcon, Calendar, X, Plus, Trash2, MapPinned, Loader2,
  FileText, Printer, CheckCircle2, Circle, Truck, MessageCircle
} from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { signOut } from '@/app/actions/auth';
import { createAddress, deleteAddress } from '@/app/actions/accountActions';

interface AddressItem {
  id?: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface OrderItem {
  id: string;
  date: string;
  total: number;
  status: string;
  shippingAddress?: Record<string, string> | null;
  items: { name: string; qty: number; price: number; image?: string | null }[];
}

interface AccountClientProps {
  user: {
    fullName: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
  };
  initialAddresses: AddressItem[];
  initialOrders: OrderItem[];
}

// --- Order Status Stepper ---
const ORDER_STEPS = ['Order Placed', 'Confirmed', 'Shipped', 'Delivered'] as const;

function getStepIndex(status: string): number {
  const map: Record<string, number> = {
    'pending': 0,
    'order_placed': 0,
    'confirmed': 1,
    'shipped': 2,
    'out_for_delivery': 2,
    'delivered': 3,
  };
  return map[status.toLowerCase()] ?? 0;
}

function OrderStepper({ status }: { status: string }) {
  if (status.toLowerCase() === 'cancelled') {
    return (
      <div className="flex items-center space-x-2 py-2">
        <X size={16} className="text-red-600" />
        <span className="text-xs font-semibold text-red-600 uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded border border-red-200">
          Order Cancelled
        </span>
      </div>
    );
  }

  const currentStep = getStepIndex(status);

  return (
    <div className="py-3">
      <div className="flex items-center w-full">
        {ORDER_STEPS.map((step, idx) => {
          const isCompleted = idx <= currentStep;
          const isLast = idx === ORDER_STEPS.length - 1;

          return (
            <React.Fragment key={step}>
              {/* Step circle + label */}
              <div className="flex flex-col items-center min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-[#C9A94E] text-white'
                      : 'bg-[#F9F7F3] border-2 border-[#EFECE6] text-[#BFBAB2]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={14} strokeWidth={2.5} />
                  ) : (
                    <Circle size={10} strokeWidth={2} />
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1.5 text-center leading-tight whitespace-nowrap font-medium ${
                    isCompleted ? 'text-[#9A7B2F]' : 'text-[#BFBAB2]'
                  }`}
                >
                  {step}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-1 mt-[-14px] ${
                    idx < currentStep ? 'bg-[#C9A94E]' : 'bg-[#EFECE6]'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// --- Invoice Modal ---
function InvoiceModal({ order, onClose }: { order: OrderItem; onClose: () => void }) {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal >= 499 ? 0 : 49;
  const total = order.total;
  const addr = order.shippingAddress;

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #invoice-modal-content, #invoice-modal-content * {
            visibility: visible !important;
          }
          #invoice-modal-content {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 40px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in no-print-backdrop">
        <div
          id="invoice-modal-content"
          className="bg-white border border-[#EFECE6] w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden text-left relative flex flex-col max-h-[90vh]"
        >
          {/* Modal Header (non-printable controls) */}
          <div className="p-5 border-b border-[#EFECE6] flex justify-between items-center bg-[#FCFBF9] no-print">
            <h3 className="font-display font-semibold text-lg text-[#9A7B2F] tracking-wide">Invoice</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 text-sm font-semibold text-[#9A7B2F] hover:text-[#C9A94E] px-3 py-1.5 rounded-lg hover:bg-[#F9F7F3] transition-colors"
              >
                <Printer size={14} />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={onClose}
                className="text-[#4E463F] hover:text-[#1A1A1A] p-1.5 rounded-full hover:bg-[#EFECE6]"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Invoice Content (printable) */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-[#EFECE6] pb-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#1A1A1A]">Beauty Looks Mumbai</h2>
                <p className="text-sm text-[#706A60] mt-1">Premium Beauty & Skincare</p>
              </div>
              <div className="text-left sm:text-right">
                <h3 className="text-lg font-display font-semibold text-[#9A7B2F] uppercase tracking-wider">Invoice</h3>
                <p className="text-sm text-[#706A60] mt-1">Date: {order.date}</p>
                <p className="text-sm text-[#706A60]">Order: <span className="font-mono text-[#1A1A1A] font-medium">{order.id}</span></p>
              </div>
            </div>

            {/* Shipping Address */}
            {addr && (
              <div className="bg-[#FCFBF9] border border-[#EFECE6] rounded-xl p-4">
                <h4 className="text-xs font-semibold text-[#9A7B2F] uppercase tracking-wider mb-2">Ship To</h4>
                <div className="text-sm text-[#5C554D] space-y-0.5">
                  {addr.fullName && <p className="font-semibold text-[#1A1A1A]">{addr.fullName}</p>}
                  {addr.addressLine1 && <p>{addr.addressLine1}</p>}
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  {(addr.city || addr.state || addr.pincode) && (
                    <p>{[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</p>
                  )}
                  {addr.phone && <p>📞 +91 {addr.phone}</p>}
                </div>
              </div>
            )}

            {/* Items Table */}
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[#EFECE6] text-[#706A60] text-xs uppercase tracking-wider">
                    <th className="text-left py-3 font-semibold">Product</th>
                    <th className="text-center py-3 font-semibold w-16">Qty</th>
                    <th className="text-right py-3 font-semibold w-24">Unit Price</th>
                    <th className="text-right py-3 font-semibold w-24">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6]">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 text-[#1A1A1A] font-medium">
                        <div className="flex items-center space-x-3">
                          {item.image && (
                            <div className="relative w-8 h-8 rounded-md overflow-hidden border border-[#EFECE6] flex-shrink-0">
                              <Image src={item.image} alt={item.name} fill sizes="32px" className="object-cover" />
                            </div>
                          )}
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center text-[#5C554D]">{item.qty}</td>
                      <td className="py-3 text-right text-[#5C554D]">{formatPrice(item.price)}</td>
                      <td className="py-3 text-right font-medium text-[#1A1A1A]">{formatPrice(item.price * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="border-t-2 border-[#EFECE6] pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-[#706A60]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#706A60]">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Complimentary' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#1A1A1A] border-t border-[#EFECE6] pt-3 mt-2">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-[#EFECE6] pt-4">
              <p className="text-sm text-[#9A7B2F] font-display font-medium">Thank you for your purchase!</p>
              <p className="text-xs text-[#706A60] mt-1">For queries, contact us at beautylooksmumbai@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


export default function AccountClient({ user, initialAddresses, initialOrders }: AccountClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const tabParam = searchParams.get('tab') as 'profile' | 'orders' | 'addresses' | null;
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');

  useEffect(() => {
    if (tabParam && ['profile', 'orders', 'addresses'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'profile' | 'orders' | 'addresses') => {
    setActiveTab(tab);
    router.push(`?tab=${tab}`, { scroll: false });
  };
  const [addresses, setAddresses] = useState<AddressItem[]>(initialAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Invoice Modal State
  const [invoiceOrder, setInvoiceOrder] = useState<OrderItem | null>(null);

  // Address Modal State for Pincode
  const [newAddressForm, setNewAddressForm] = useState({ city: '', state: '', pincode: '' });
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pin = e.target.value;
    setNewAddressForm(prev => ({ ...prev, pincode: pin }));
    
    if (pin.length === 6 && /^\d+$/.test(pin)) {
      setPincodeLoading(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();
        if (data && data[0] && data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setNewAddressForm(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State
          }));
        }
      } catch (err) {
        console.error("Failed to fetch pincode details", err);
      }
      setPincodeLoading(false);
    }
  };

  const handleDeleteAddress = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to remove this address?')) return;

    const res = await deleteAddress(id);
    if (res.error) {
      alert(res.error);
    } else {
      setAddresses(addresses.filter(addr => addr.id !== id));
    }
  };

  const handleAddAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setModalLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createAddress(formData);

    if (res.error) {
      setError(res.error);
      setModalLoading(false);
    } else {
      setIsModalOpen(false);
      setModalLoading(false);
      setNewAddressForm({ city: '', state: '', pincode: '' });
      
      if (res.data) {
        const newAddr: AddressItem = {
          id: res.data.id,
          label: res.data.label,
          fullName: res.data.full_name,
          phone: res.data.phone,
          line1: res.data.line1,
          line2: res.data.line2 || undefined,
          city: res.data.city,
          state: res.data.state,
          pincode: res.data.pincode,
          isDefault: res.data.is_default
        };
        
        setAddresses(prev => {
          const updated = newAddr.isDefault 
            ? prev.map(a => ({ ...a, isDefault: false })) 
            : prev;
          return [newAddr, ...updated];
        });
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FCFBF9] py-12 text-left relative" suppressHydrationWarning>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-[#EFECE6] pb-6 mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold font-display text-gold-gradient">
            My Account
          </h1>
          <p className="text-sm text-[#4E463F] mt-2 font-light">
            Manage your profile, shipping addresses, and review order histories.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" suppressHydrationWarning>
          
          {/* Navigation Sidebar */}
          <aside id="account-sidebar" suppressHydrationWarning className="lg:col-span-3 glass-card border border-[#EFECE6] bg-white overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#EFECE6] text-center space-y-3">
              <div className="relative mx-auto w-fit">
                <div className="w-16 h-16 bg-[#F9F7F3] rounded-full border border-[#C9A94E] flex items-center justify-center text-[#C9A94E]">
                  <User size={32} />
                </div>
                {user.role === 'admin' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#9A7B2F] rounded-full flex items-center justify-center shadow-md">
                    <ShieldCheck size={13} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-display font-medium text-base text-[#1A1A1A]">{user.fullName}</h3>
                <span className={`inline-flex items-center space-x-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  user.role === 'admin'
                    ? 'bg-[#9A7B2F10] text-[#9A7B2F] border border-[#C9A94E40]'
                    : 'bg-[#F9F7F3] text-[#4E463F] border border-[#EFECE6]'
                }`}>
                  {user.role === 'admin' && <Crown size={10} />}
                  <span>{user.role === 'admin' ? 'Administrator' : 'Member'}</span>
                </span>
              </div>
            </div>

            <div className="p-2 flex flex-col space-y-1" suppressHydrationWarning>
              <button
                suppressHydrationWarning
                onClick={() => handleTabChange('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all duration-300 ${
                  activeTab === 'profile' ? 'bg-[#F9F7F3] text-[#9A7B2F] border-l-2 border-[#C9A94E] font-semibold' : 'text-[#5C554D] hover:text-[#C9A94E] hover:bg-[#F9F7F350]'
                }`}
              >
                <User size={16} />
                <span>Profile Details</span>
              </button>
              <button
                suppressHydrationWarning
                onClick={() => handleTabChange('orders')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all duration-300 ${
                  activeTab === 'orders' ? 'bg-[#F9F7F3] text-[#9A7B2F] border-l-2 border-[#C9A94E] font-semibold' : 'text-[#5C554D] hover:text-[#C9A94E] hover:bg-[#F9F7F350]'
                }`}
              >
                <ShoppingBag size={16} />
                <span>My Orders</span>
              </button>
              <button
                suppressHydrationWarning
                onClick={() => handleTabChange('addresses')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all duration-300 ${
                  activeTab === 'addresses' ? 'bg-[#F9F7F3] text-[#9A7B2F] border-l-2 border-[#C9A94E] font-semibold' : 'text-[#5C554D] hover:text-[#C9A94E] hover:bg-[#F9F7F350]'
                }`}
              >
                <MapPin size={16} />
                <span>Addresses</span>
              </button>
              <form action={signOut} suppressHydrationWarning>
                <button
                  suppressHydrationWarning
                  type="submit"
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm text-[#C62828] hover:bg-[#C6282810]"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </aside>

          {/* Main Dashboard Content */}
          <main suppressHydrationWarning className="lg:col-span-9 glass-card p-6 sm:p-8 border border-[#EFECE6] bg-white min-h-[400px] shadow-sm">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center justify-between border-b border-[#EFECE6] pb-4">
                  <h3 className="font-display text-xl font-semibold tracking-wide text-[#1A1A1A]">
                    Personal Information
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#FCFBF9] border border-[#EFECE6] rounded-2xl p-5 hover:shadow-md transition-shadow group">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-[#F9F7F3] border border-[#C9A94E30] flex items-center justify-center text-[#9A7B2F] group-hover:scale-110 transition-transform">
                        <User size={20} />
                      </div>
                      <div>
                        <span className="block text-xs text-[#706A60] uppercase tracking-wider font-semibold">Full Name</span>
                        <span className="text-[#1A1A1A] font-medium text-lg mt-0.5 block">{user.fullName}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#FCFBF9] border border-[#EFECE6] rounded-2xl p-5 hover:shadow-md transition-shadow group">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-[#F9F7F3] border border-[#C9A94E30] flex items-center justify-center text-[#9A7B2F] group-hover:scale-110 transition-transform">
                        <Mail size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs text-[#706A60] uppercase tracking-wider font-semibold">Email Address</span>
                        <span className="text-[#1A1A1A] font-medium text-lg mt-0.5 block truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#FCFBF9] border border-[#EFECE6] rounded-2xl p-5 hover:shadow-md transition-shadow group">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-[#F9F7F3] border border-[#C9A94E30] flex items-center justify-center text-[#9A7B2F] group-hover:scale-110 transition-transform">
                        <PhoneIcon size={20} />
                      </div>
                      <div>
                        <span className="block text-xs text-[#706A60] uppercase tracking-wider font-semibold">Contact Phone</span>
                        <span className="text-[#1A1A1A] font-medium text-lg mt-0.5 block">{user.phone ? `+91 ${user.phone}` : 'Not set'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#FCFBF9] border border-[#EFECE6] rounded-2xl p-5 hover:shadow-md transition-shadow group">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-[#F9F7F3] border border-[#C9A94E30] flex items-center justify-center text-[#9A7B2F] group-hover:scale-110 transition-transform">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <span className="block text-xs text-[#706A60] uppercase tracking-wider font-semibold">Member Since</span>
                        <span className="text-[#1A1A1A] font-medium text-lg mt-0.5 block capitalize">{user.createdAt}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center justify-between p-5 mt-4 glass-gold rounded-2xl group overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-accent/30 transition-colors duration-500"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3"></div>
                    
                    <div className="flex items-center space-x-4 relative z-10">
                      <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center backdrop-blur-md border border-accent/20 group-hover:border-accent transition-colors duration-500 shadow-sm">
                        <ShieldCheck size={20} className="text-accent group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div>
                        <span className="text-base font-semibold text-text-main block font-display tracking-wide group-hover:text-accent transition-all duration-500">Admin Dashboard</span>
                        <span className="text-sm text-text-muted font-light">Manage products, orders, and analytics</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/50 border border-border flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:shadow-[0_0_15px_rgb(202,138,4,0.3)] transition-all duration-500 relative z-10">
                      <span className="text-text-muted group-hover:text-white text-lg font-semibold group-hover:translate-x-0.5 transition-all duration-500">→</span>
                    </div>
                  </Link>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h3 className="font-display text-lg font-semibold tracking-wider text-[#9A7B2F] uppercase border-b border-[#EFECE6] pb-3">
                  Order History
                </h3>

                {initialOrders.length === 0 ? (
                  <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-full bg-[#F9F7F3] border border-[#EFECE6] flex items-center justify-center mx-auto text-[#4E463F]">
                      <ShoppingBag size={24} strokeWidth={1.25} />
                    </div>
                    <div>
                      <h4 className="font-display font-medium text-base text-[#1A1A1A]">No Orders Yet</h4>
                      <p className="text-sm text-[#4E463F] mt-1 font-light leading-relaxed">
                        Once you purchase your favorite premium skincare or facial kits, they will appear here.
                      </p>
                    </div>
                    <Link href="/products" className="btn-gold text-sm inline-block py-2.5 px-6 shadow-sm">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {initialOrders.map((order) => (
                      <div key={order.id} className="border border-[#EFECE6] rounded-xl p-5 bg-[#FCFBF9] space-y-4 shadow-sm">
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#EFECE6] pb-3 text-sm">
                          <div>
                            <span className="text-[#706A60]">Order ID: </span>
                            <span className="font-bold text-[#1A1A1A]">{order.id}</span>
                          </div>
                          <div>
                            <span className="text-[#706A60]">Date: </span>
                            <span className="text-[#1A1A1A] font-medium">{order.date}</span>
                          </div>
                          <div>
                            <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                              order.status === 'confirmed' || order.status === 'delivered'
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : order.status === 'cancelled'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-[#C9A94E15] text-[#9A7B2F] border border-[#C9A94E30]'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Shipment Tracking Stepper */}
                        <OrderStepper status={order.status} />

                        {/* Items */}
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm text-[#5C554D]">
                              <div className="flex items-center space-x-2">
                                {item.image ? (
                                  <div className="relative w-8 h-8 rounded-md overflow-hidden border border-[#EFECE6] flex-shrink-0">
                                    <Image src={item.image} alt={item.name} fill sizes="32px" className="object-cover" />
                                  </div>
                                ) : (
                                  <Package size={14} className="text-[#9A7B2F] flex-shrink-0" />
                                )}
                                <span>{item.name} <strong className="text-[#1A1A1A]">x {item.qty}</strong></span>
                              </div>
                              <span className="font-semibold text-[#1A1A1A]">{formatPrice(item.price * item.qty)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-[#EFECE6] pt-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-[#706A60]">Total paid amount</span>
                            <span className="text-sm font-bold text-[#9A7B2F]">{formatPrice(order.total)}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <a 
                              href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi, I would like to track my order: ${order.id}`)}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1.5 text-xs font-semibold text-[#25D366] hover:text-[#1da851] px-3 py-1.5 rounded-lg border border-[#25D366]/30 hover:bg-[#25D366]/10 transition-colors w-full sm:w-auto justify-center"
                            >
                              <MessageCircle size={13} />
                              <span>Track via WhatsApp</span>
                            </a>
                            <button
                              onClick={() => setInvoiceOrder(order)}
                              className="flex items-center space-x-1.5 text-xs font-semibold text-[#9A7B2F] hover:text-[#C9A94E] px-3 py-1.5 rounded-lg border border-[#C9A94E30] hover:bg-[#C9A94E08] transition-colors w-full sm:w-auto justify-center"
                            >
                              <FileText size={13} />
                              <span>View Invoice</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#EFECE6] pb-3">
                  <h3 className="font-display text-lg font-semibold tracking-wider text-[#9A7B2F] uppercase">
                    Shipping Addresses
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-sm text-[#9A7B2F] hover:text-[#C9A94E] font-bold flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add New</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-full bg-[#F9F7F3] border border-[#EFECE6] flex items-center justify-center mx-auto text-[#4E463F]">
                      <MapPinned size={24} strokeWidth={1.25} />
                    </div>
                    <div>
                      <h4 className="font-display font-medium text-base text-[#1A1A1A]">No Addresses Found</h4>
                      <p className="text-sm text-[#4E463F] mt-1 font-light leading-relaxed">
                        Add a shipping address to speed up your checkout process next time.
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(true)} 
                      className="btn-gold text-sm inline-block py-2.5 px-6 shadow-sm"
                    >
                      Add shipping address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="border border-[#EFECE6] rounded-xl p-5 bg-[#FCFBF9] text-sm space-y-3 relative shadow-sm hover:border-[#C9A94E40] transition-colors">
                        {addr.isDefault && (
                          <span className="absolute top-4 right-4 bg-[#C9A94E15] text-[#9A7B2F] text-xs font-semibold py-0.5 px-2 rounded-full uppercase border border-[#C9A94E30]">
                            Default
                          </span>
                        )}
                        
                        <div className="flex items-center space-x-2 text-[#9A7B2F] font-semibold text-sm">
                          <MapPin size={14} />
                          <span>{addr.label}</span>
                        </div>
                        
                        <div className="space-y-1 text-[#5C554D] font-light text-left">
                          <span className="block font-semibold text-[#1A1A1A]">{addr.fullName}</span>
                          <span className="block">{addr.line1}</span>
                          {addr.line2 && <span className="block">{addr.line2}</span>}
                          <span className="block">{addr.city}, {addr.state} - {addr.pincode}</span>
                          <span className="block pt-1">📞 +91 {addr.phone}</span>
                        </div>

                        <div className="flex justify-between items-center border-t border-[#EFECE6] pt-3 text-xs">
                          <span className="text-[#9A7B2F] font-semibold">Verified Address</span>
                          <button 
                            onClick={() => handleDeleteAddress(addr.id)} 
                            className="text-[#C62828] hover:text-red-700 font-semibold flex items-center space-x-1"
                          >
                            <Trash2 size={12} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </main>

        </div>
      </div>

      {/* Add Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-[#EFECE6] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden text-left relative flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FCFBF9]">
              <div>
                <h3 className="font-display font-semibold text-lg text-[#9A7B2F] tracking-wide">Add New Address</h3>
                <p className="text-xs text-[#4E463F] mt-0.5">Please provide your valid shipping details</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[#4E463F] hover:text-[#1A1A1A] p-1.5 rounded-full hover:bg-[#EFECE6]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddAddress} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col col-span-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Address Label</label>
                  <select name="label" defaultValue="Home" className="w-full input-dark text-sm py-2">
                    <option value="Home">Home</option>
                    <option value="Office">Office / Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col col-span-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Full Name</label>
                  <input type="text" name="fullName" placeholder="e.g. Priya Sharma" required className="w-full input-dark text-sm py-2" />
                </div>

                <div className="flex flex-col col-span-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Phone Number</label>
                  <input type="tel" name="phone" placeholder="e.g. 9876543210" required className="w-full input-dark text-sm py-2" />
                </div>

                <div className="flex flex-col col-span-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Street Address</label>
                  <input type="text" name="line1" placeholder="Flat, House no., Building, Company" required className="w-full input-dark text-sm py-2 mb-2" />
                  <input type="text" name="line2" placeholder="Area, Colony, Street, Sector" className="w-full input-dark text-sm py-2" />
                </div>

                <div className="flex flex-col col-span-2 relative">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Pincode</label>
                  <input type="text" name="pincode" placeholder="e.g. 400050" required className="w-full input-dark text-sm py-2" value={newAddressForm.pincode} onChange={handlePincodeChange} maxLength={6} />
                  {pincodeLoading && <Loader2 size={14} className="absolute right-3 top-[34px] animate-spin text-[#9A7B2F]" />}
                </div>

                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">City</label>
                  <input type="text" name="city" placeholder="e.g. Mumbai" required className="w-full input-dark text-sm py-2 bg-[#F9F7F3]" value={newAddressForm.city} onChange={e => setNewAddressForm(prev => ({...prev, city: e.target.value}))} />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">State</label>
                  <input type="text" name="state" placeholder="e.g. Maharashtra" required className="w-full input-dark text-sm py-2 bg-[#F9F7F3]" value={newAddressForm.state} onChange={e => setNewAddressForm(prev => ({...prev, state: e.target.value}))} />
                </div>

                <div className="flex items-center space-x-2 col-span-2 pt-2">
                  <input type="checkbox" name="isDefault" value="true" id="isDefault" className="rounded border-border text-[#C9A94E] focus:ring-[#C9A94E]" />
                  <label htmlFor="isDefault" className="text-sm text-[#5C554D] font-light cursor-pointer select-none">Set as default shipping address</label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-[#EFECE6] mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-[#EFECE6] rounded-xl text-sm font-semibold text-[#4E463F] hover:bg-[#F9F7F3] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={modalLoading}
                  className="btn-gold px-6 py-2.5 text-sm font-semibold flex items-center space-x-2"
                >
                  {modalLoading && <Loader2 size={12} className="animate-spin" />}
                  <span>{modalLoading ? 'Adding...' : 'Save Address'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceOrder && (
        <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
      )}
    </div>
  );
}
