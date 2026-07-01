'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, ShoppingBag, MapPin, LogOut, Package, ShieldCheck, 
  Crown, Mail, Phone as PhoneIcon, Calendar, X, Plus, Trash2, MapPinned, Loader2 
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
  items: { name: string; qty: number; price: number }[];
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

export default function AccountClient({ user, initialAddresses, initialOrders }: AccountClientProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  const [addresses, setAddresses] = useState<AddressItem[]>(initialAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      window.location.reload(); // Hard refresh to load updated default address state from server
    }
  };

  // Safe loading handler fallback
  const [, setLoading] = useState(false);

  return (
    <div className="w-full min-h-screen bg-[#FCFBF9] py-12 text-left relative">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 glass-card border border-[#EFECE6] bg-white overflow-hidden shadow-sm">
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

            <div className="p-2 flex flex-col space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all duration-300 ${
                  activeTab === 'profile' ? 'bg-[#F9F7F3] text-[#9A7B2F] border-l-2 border-[#C9A94E] font-semibold' : 'text-[#5C554D] hover:text-[#C9A94E] hover:bg-[#F9F7F350]'
                }`}
              >
                <User size={16} />
                <span>Profile Details</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all duration-300 ${
                  activeTab === 'orders' ? 'bg-[#F9F7F3] text-[#9A7B2F] border-l-2 border-[#C9A94E] font-semibold' : 'text-[#5C554D] hover:text-[#C9A94E] hover:bg-[#F9F7F350]'
                }`}
              >
                <ShoppingBag size={16} />
                <span>My Orders</span>
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all duration-300 ${
                  activeTab === 'addresses' ? 'bg-[#F9F7F3] text-[#9A7B2F] border-l-2 border-[#C9A94E] font-semibold' : 'text-[#5C554D] hover:text-[#C9A94E] hover:bg-[#F9F7F350]'
                }`}
              >
                <MapPin size={16} />
                <span>Addresses</span>
              </button>
              <form action={signOut}>
                <button
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
          <main className="lg:col-span-9 glass-card p-6 sm:p-8 border border-[#EFECE6] bg-white min-h-[400px] shadow-sm">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <h3 className="font-display text-lg font-semibold tracking-wider text-[#9A7B2F] uppercase border-b border-[#EFECE6] pb-3">
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F9F7F3] border border-[#EFECE6] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={14} className="text-[#9A7B2F]" />
                    </div>
                    <div>
                      <span className="block text-sm text-[#4E463F] uppercase tracking-wider">Full Name</span>
                      <span className="text-[#1A1A1A] font-semibold mt-1 block">{user.fullName}</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F9F7F3] border border-[#EFECE6] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail size={14} className="text-[#9A7B2F]" />
                    </div>
                    <div>
                      <span className="block text-sm text-[#4E463F] uppercase tracking-wider">Email Address</span>
                      <span className="text-[#1A1A1A] font-semibold mt-1 block">{user.email}</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F9F7F3] border border-[#EFECE6] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <PhoneIcon size={14} className="text-[#9A7B2F]" />
                    </div>
                    <div>
                      <span className="block text-sm text-[#4E463F] uppercase tracking-wider">Contact Phone</span>
                      <span className="text-[#1A1A1A] font-semibold mt-1 block">{user.phone ? `+91 ${user.phone}` : 'Not set'}</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F9F7F3] border border-[#EFECE6] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar size={14} className="text-[#9A7B2F]" />
                    </div>
                    <div>
                      <span className="block text-sm text-[#4E463F] uppercase tracking-wider">Member Since</span>
                      <span className="text-[#1A1A1A] font-semibold mt-1 block capitalize">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Recently joined'}</span>
                    </div>
                  </div>
                </div>

                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center justify-between p-4 bg-[#F9F7F3] border border-[#EFECE6] rounded-xl hover:border-[#C9A94E60] transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-[#9A7B2F] flex items-center justify-center">
                        <ShieldCheck size={18} className="text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-[#1A1A1A] block">Admin Dashboard</span>
                        <span className="text-sm text-[#4E463F]">Manage products, orders, and analytics</span>
                      </div>
                    </div>
                    <span className="text-[#9A7B2F] text-sm font-semibold group-hover:translate-x-1 transition-transform">→</span>
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
                                : 'bg-[#C9A94E15] text-[#9A7B2F] border border-[#C9A94E30]'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm text-[#5C554D]">
                              <div className="flex items-center space-x-2">
                                <Package size={14} className="text-[#9A7B2F]" />
                                <span>{item.name} <strong className="text-[#1A1A1A]">x {item.qty}</strong></span>
                              </div>
                              <span className="font-semibold text-[#1A1A1A]">{formatPrice(item.price * item.qty)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer */}
                        <div className="flex justify-between items-center border-t border-[#EFECE6] pt-3 text-sm">
                          <span className="text-[#706A60]">Total paid amount</span>
                          <span className="text-sm font-bold text-[#9A7B2F]">{formatPrice(order.total)}</span>
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

                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">City</label>
                  <input type="text" name="city" placeholder="e.g. Mumbai" required className="w-full input-dark text-sm py-2" />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">State</label>
                  <input type="text" name="state" placeholder="e.g. Maharashtra" required className="w-full input-dark text-sm py-2" />
                </div>

                <div className="flex flex-col col-span-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Pincode</label>
                  <input type="text" name="pincode" placeholder="e.g. 400050" required className="w-full input-dark text-sm py-2" />
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
    </div>
  );
}
