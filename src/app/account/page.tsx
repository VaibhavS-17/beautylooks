'use client';

import React, { useState } from 'react';
import { User, ShoppingBag, MapPin, LogOut, Package, Star, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/data';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');

  // Sample User Details
  const user = {
    fullName: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '9876543210',
    role: 'customer',
  };

  // Sample Orders
  const sampleOrders = [
    {
      id: 'BLM-398274',
      date: '2026-06-25',
      total: 1499,
      status: 'confirmed',
      items: [
        { name: 'O3+ Bridal Facial Kit', qty: 1, price: 1499 }
      ]
    },
    {
      id: 'BLM-287361',
      date: '2026-05-18',
      total: 948,
      status: 'delivered',
      items: [
        { name: 'Plum 10% Niacinamide Serum', qty: 1, price: 549 },
        { name: 'Biotique Bio Dandelion Serum', qty: 1, price: 399 }
      ]
    }
  ];

  // Sample Addresses
  const sampleAddresses = [
    {
      id: 'addr-1',
      label: 'Home',
      line1: 'Flat 402, Sea Breeze Apartments',
      line2: 'Carter Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      isDefault: true
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#FCFBF9] py-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-[#EFECE6] pb-6 mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold font-display text-gold-gradient">
            My Account
          </h1>
          <p className="text-xs text-[#8A8177] mt-2 font-light">
            Manage your profile, shipping addresses, and review order histories.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 glass-card border border-[#EFECE6] bg-white overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#EFECE6] text-center space-y-3">
              <div className="w-16 h-16 bg-[#F9F7F3] rounded-full border border-[#C9A94E] flex items-center justify-center mx-auto text-[#C9A94E]">
                <User size={32} />
              </div>
              <div>
                <h3 className="font-display font-medium text-base text-[#1A1A1A]">{user.fullName}</h3>
                <span className="text-[10px] text-[#8A8177] uppercase tracking-wider font-semibold">{user.role}</span>
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
              <button
                onClick={() => alert('Sign out coming soon!')}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm text-[#C62828] hover:bg-[#C6282810]"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Main Dashboard Content */}
          <main className="lg:col-span-9 glass-card p-6 sm:p-8 border border-[#EFECE6] bg-white min-h-[400px] shadow-sm">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="font-display text-lg font-semibold tracking-wider text-[#9A7B2F] uppercase border-b border-[#EFECE6] pb-3">
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="block text-xs text-[#8A8177] uppercase tracking-wider">Full Name</span>
                    <span className="text-[#1A1A1A] font-semibold mt-1 block">{user.fullName}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-[#8A8177] uppercase tracking-wider">Email Address</span>
                    <span className="text-[#1A1A1A] font-semibold mt-1 block">{user.email}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-[#8A8177] uppercase tracking-wider">Contact Phone</span>
                    <span className="text-[#1A1A1A] font-semibold mt-1 block">+91 {user.phone}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#F9F7F3] border border-[#EFECE6] rounded-xl text-xs text-[#706A60] space-y-1">
                  <span className="font-semibold text-[#9A7B2F] block">💡 Database Note</span>
                  <p>All database connections are managed via Supabase RLS. You will be able to update your profile once a live client configuration is active.</p>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h3 className="font-display text-lg font-semibold tracking-wider text-[#9A7B2F] uppercase border-b border-[#EFECE6] pb-3">
                  Order History
                </h3>

                <div className="space-y-4">
                  {sampleOrders.map((order) => (
                    <div key={order.id} className="border border-[#EFECE6] rounded-xl p-5 bg-[#FCFBF9] space-y-4 shadow-sm">
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#EFECE6] pb-3 text-xs">
                        <div>
                          <span className="text-[#706A60]">Order ID: </span>
                          <span className="font-bold text-[#1A1A1A]">{order.id}</span>
                        </div>
                        <div>
                          <span className="text-[#706A60]">Date: </span>
                          <span className="text-[#1A1A1A] font-medium">{order.date}</span>
                        </div>
                        <div>
                          <span className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase ${
                            order.status === 'confirmed' ? 'bg-[#4CAF5015] text-[#2E7D32]' : 'bg-[#C9A94E15] text-[#9A7B2F]'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-[#5C554D]">
                            <div className="flex items-center space-x-2">
                              <Package size={14} className="text-[#9A7B2F]" />
                              <span>{item.name} <strong className="text-[#1A1A1A]">x {item.qty}</strong></span>
                            </div>
                            <span className="font-semibold text-[#1A1A1A]">{formatPrice(item.price * item.qty)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer */}
                      <div className="flex justify-between items-center border-t border-[#EFECE6] pt-3 text-xs">
                        <span className="text-[#706A60]">Total paid amount</span>
                        <span className="text-sm font-bold text-[#9A7B2F]">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
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
                    onClick={() => alert('Adding addresses coming soon!')}
                    className="text-xs text-[#9A7B2F] hover:text-[#C9A94E] font-bold"
                  >
                    + Add New
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sampleAddresses.map((addr) => (
                    <div key={addr.id} className="border border-[#EFECE6] rounded-xl p-5 bg-[#FCFBF9] text-xs space-y-3 relative shadow-sm">
                      {addr.isDefault && (
                        <span className="absolute top-4 right-4 bg-[#C9A94E15] text-[#9A7B2F] text-[9px] font-semibold py-0.5 px-2 rounded-full uppercase">
                          Default
                        </span>
                      )}
                      
                      <div className="flex items-center space-x-2 text-[#9A7B2F] font-semibold text-sm">
                        <MapPin size={14} />
                        <span>{addr.label}</span>
                      </div>
                      
                      <div className="space-y-1 text-[#5C554D] font-light text-left">
                        <span className="block font-semibold text-[#1A1A1A]">{user.fullName}</span>
                        <span className="block">{addr.line1}</span>
                        {addr.line2 && <span className="block">{addr.line2}</span>}
                        <span className="block">{addr.city}, {addr.state} - {addr.pincode}</span>
                        <span className="block pt-1">📞 +91 {user.phone}</span>
                      </div>

                      <div className="flex space-x-4 border-t border-[#EFECE6] pt-3 text-[10px] text-[#8A8177]">
                        <button onClick={() => alert('Edit address coming soon!')} className="hover:text-[#9A7B2F] font-semibold">Edit</button>
                        <button onClick={() => alert('Delete address coming soon!')} className="hover:text-[#C62828] font-semibold">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>

        </div>
      </div>
    </div>
  );
}

