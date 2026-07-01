'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Package, ShoppingBag, IndianRupee, Users, ArrowUpRight, 
  Plus, RefreshCw, BarChart2, X, Loader2, Check 
} from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { createProduct, updateOrderStatusAdmin, syncMockData } from '@/app/actions/adminActions';

interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

interface CategoryBrandItem {
  id: string;
  name: string;
}

interface AdminClientProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
    grossRevenue: number;
    activeCustomers: number;
  };
  recentOrders: AdminOrder[];
  categories: CategoryBrandItem[];
  brands: CategoryBrandItem[];
}

export default function AdminClient({ stats, recentOrders, categories, brands }: AdminClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Status updating state
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    const res = await updateOrderStatusAdmin(orderId, newStatus);
    setUpdatingOrderId(null);

    if (res.error) {
      alert(res.error);
    } else {
      window.location.reload();
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createProduct(formData);

    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccessMsg('Product added successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg(null);
        window.location.reload();
      }, 1000);
    }
  };

  const handleSyncData = async () => {
    if (!confirm('This will seed the initial Categories & Brands if they are missing in the store configuration. Proceed?')) return;
    setSyncing(true);
    const res = await syncMockData();
    setSyncing(false);

    if (res.error) {
      alert(res.error);
    } else {
      alert('Mock categories and brands loaded successfully!');
      window.location.reload();
    }
  };

  const statItems = [
    { label: 'Total Products', value: stats.totalProducts.toString(), icon: Package, desc: 'Active in catalog' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, desc: 'Lifetime transactions' },
    { label: 'Gross Revenue', value: formatPrice(stats.grossRevenue), icon: IndianRupee, desc: 'Excludes cancellations' },
    { label: 'Active Customers', value: stats.activeCustomers.toString(), icon: Users, desc: 'Registered customer profiles' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FCFBF9] py-12 text-left relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EFECE6] pb-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold font-display text-gold-gradient">
              Admin Console
            </h1>
            <p className="text-sm text-[#4E463F] mt-1 font-light">
              Overview of premium store operations, sales growth, and real-time order fulfillments.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleSyncData}
              disabled={syncing}
              className="px-4 py-2.5 border border-[#EFECE6] rounded-xl text-sm font-semibold text-[#4E463F] hover:bg-[#F9F7F3] transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              <span>{syncing ? 'Initializing...' : 'Initialize Catalog'}</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-gold text-sm py-2.5 px-4 flex items-center space-x-1.5 shadow-sm"
            >
              <Plus size={14} />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statItems.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-[#EFECE6] flex items-center justify-between shadow-[0_4px_20px_-4px_rgba(44,30,22,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(44,30,22,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="space-y-1.5 text-left">
                  <span className="block text-xs text-[#4E463F] font-semibold uppercase tracking-wider">{stat.label}</span>
                  <span className="block text-2xl font-bold text-[#1A1A1A] font-display">{stat.value}</span>
                  <span className="block text-xs text-[#4E463F] font-light">{stat.desc}</span>
                </div>
                <div className="p-3 bg-[#F9F7F3] rounded-xl text-[#9A7B2F] border border-[#EFECE6] shadow-sm">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Main section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Recent Orders */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-[#EFECE6] shadow-[0_4px_20px_-4px_rgba(44,30,22,0.03)] space-y-6">
            <div className="flex justify-between items-center border-b border-[#EFECE6] pb-3">
              <h3 className="font-display text-base font-semibold tracking-wider text-[#9A7B2F] uppercase">
                Active Orders
              </h3>
              <span className="text-xs text-[#4E463F] uppercase tracking-wider font-semibold">Realtime</span>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#F9F7F3] border border-[#EFECE6] flex items-center justify-center mx-auto text-[#4E463F]">
                  <ShoppingBag size={22} strokeWidth={1.25} />
                </div>
                <div>
                  <h4 className="font-display font-medium text-sm text-[#1A1A1A]">No Orders Yet</h4>
                  <p className="text-sm text-[#4E463F] mt-1 font-light leading-relaxed">
                    Customer checkouts will populate this live order list.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#5C554D]">
                  <thead>
                    <tr className="border-b border-[#EFECE6] text-[#1A1A1A] font-semibold uppercase tracking-wider text-xs bg-[#FCFBF9]">
                      <th className="py-3 px-4 rounded-tl-lg">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 rounded-tr-lg">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFECE6]">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#FCFBF9]/50 transition-colors">
                        <td className="py-4 px-4 font-mono font-semibold text-[#1A1A1A] max-w-[100px] truncate" title={order.id}>
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-[#1A1A1A] block">{order.customerName}</span>
                          <span className="text-xs text-[#4E463F] block">{order.customerEmail}</span>
                        </td>
                        <td className="py-4 px-4 font-bold text-[#9A7B2F]">{formatPrice(order.amount)}</td>
                        <td className="py-4 px-4">
                          {updatingOrderId === order.id ? (
                            <span className="flex items-center space-x-1 text-sm text-[#4E463F]">
                              <Loader2 size={12} className="animate-spin" />
                              <span>Updating...</span>
                            </span>
                          ) : (
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="bg-[#FCFBF9] border border-[#EFECE6] text-xs uppercase font-semibold py-1.5 px-3 rounded-xl text-[#9A7B2F] focus:outline-none focus:border-[#C9A94E] cursor-pointer hover:bg-[#F9F7F3] transition-colors"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          )}
                        </td>
                        <td className="py-4 px-4 text-[#4E463F] whitespace-nowrap font-medium">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Merchant Actions & Support */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EFECE6] shadow-[0_4px_20px_-4px_rgba(44,30,22,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.015)] transition-all duration-300 space-y-4 text-left">
              <h3 className="font-display text-base font-semibold tracking-wider text-[#9A7B2F] uppercase border-b border-[#EFECE6] pb-3">
                Merchant Portal
              </h3>
              <p className="text-sm text-[#4E463F] font-light leading-relaxed">
                Welcome back to your store. Use this console to track customer orders, update product catalog inventories, and monitor revenue growth.
              </p>
              
              <div className="space-y-2 pt-2">
                <Link
                  href="/"
                  className="w-full flex items-center justify-between p-3 bg-[#FCFBF9] border border-[#EFECE6] rounded-xl hover:border-[#C9A94E60] transition-colors text-sm font-semibold text-[#1A1A1A]"
                >
                  <span>View Public Store</span>
                  <span className="text-[#9A7B2F]">→</span>
                </Link>
                <Link
                  href="/contact"
                  className="w-full flex items-center justify-between p-3 bg-[#FCFBF9] border border-[#EFECE6] rounded-xl hover:border-[#C9A94E60] transition-colors text-sm font-semibold text-[#1A1A1A]"
                >
                  <span>Support Helpline</span>
                  <span className="text-[#4E463F] text-xs font-semibold">8879655807</span>
                </Link>
              </div>
            </div>

            {/* Sales Target Overview */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EFECE6] shadow-[0_4px_20px_-4px_rgba(44,30,22,0.03)] space-y-4 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <BarChart2 size={64} />
              </div>
              <div className="flex items-center space-x-2 text-[#9A7B2F] font-semibold text-sm">
                <BarChart2 size={16} />
                <span className="font-display uppercase tracking-wider">Target Overview</span>
              </div>
              <p className="text-sm text-[#4E463F] font-light leading-relaxed">
                Sales overview metrics are computed dynamically in real-time. Monthly target goals are trackable below.
              </p>
              <div className="h-2 bg-[#F9F7F3] rounded-full overflow-hidden border border-[#EFECE6]">
                <div className="h-full bg-[#C9A94E] w-[65%] rounded-full animate-pulse" />
              </div>
              <div className="flex justify-between text-xs text-[#4E463F] font-semibold">
                <span>Monthly Target Goal: 65% Completed</span>
                <span>Active</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white/95 backdrop-blur-lg border border-[#EFECE6] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-left relative flex flex-col max-h-[90vh] scale-in duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FCFBF9]/80">
              <div>
                <h3 className="font-display font-semibold text-lg text-[#9A7B2F] tracking-wide">Add Catalog Product</h3>
                <p className="text-xs text-[#4E463F] mt-0.5">Insert a new premium product item into the shop catalog</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[#4E463F] hover:text-[#1A1A1A] p-1.5 rounded-full hover:bg-[#EFECE6]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Notifications */}
            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 text-green-750 text-sm rounded-lg flex items-center space-x-2">
                <Check size={14} className="text-green-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddProductSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                <div className="flex flex-col col-span-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Product Name *</label>
                  <input type="text" name="name" placeholder="e.g. O3+ Bridal Brightening Kit" required className="w-full input-dark text-sm py-2" />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Price (INR) *</label>
                  <input type="number" name="price" placeholder="1899" required min="0" className="w-full input-dark text-sm py-2" />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Sale Price (INR, Optional)</label>
                  <input type="number" name="salePrice" placeholder="1499" min="0" className="w-full input-dark text-sm py-2" />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Category</label>
                  <select name="categoryId" className="w-full input-dark text-sm py-2">
                    <option value="">No Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Brand</label>
                  <select name="brandId" className="w-full input-dark text-sm py-2">
                    <option value="">No Brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Skin Type Selection</label>
                  <select name="skinType" defaultValue="all" className="w-full input-dark text-sm py-2">
                    <option value="all">All Skin Types</option>
                    <option value="oily">Oily</option>
                    <option value="dry">Dry</option>
                    <option value="combination">Combination</option>
                    <option value="sensitive">Sensitive</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Stock Quantity</label>
                  <input type="number" name="stockQuantity" defaultValue="15" min="0" className="w-full input-dark text-sm py-2" />
                </div>

                <div className="flex flex-col col-span-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Short Description</label>
                  <input type="text" name="shortDescription" placeholder="Brief tagline of the product for preview cards" className="w-full input-dark text-sm py-2" />
                </div>

                <div className="flex flex-col col-span-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Detailed Description *</label>
                  <textarea name="description" placeholder="Write full product benefits, instructions, and ingredients here..." required rows={3} className="w-full input-dark text-sm py-2" />
                </div>

                <div className="flex flex-col col-span-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Catalog Image URL</label>
                  <input type="text" name="image" placeholder="/images/products/facial-kit-1.png" className="w-full input-dark text-sm py-2" />
                </div>

                <div className="flex items-center space-x-6 col-span-2 pt-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" name="isFeatured" value="true" id="isFeatured" defaultChecked className="rounded border-border text-[#C9A94E]" />
                    <label htmlFor="isFeatured" className="text-sm text-[#5C554D] font-light cursor-pointer select-none">Feature on Homepage</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" name="isActive" value="true" id="isActive" defaultChecked className="rounded border-border text-[#C9A94E]" />
                    <label htmlFor="isActive" className="text-sm text-[#5C554D] font-light cursor-pointer select-none">Active & Visible in Shop</label>
                  </div>
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
                  disabled={loading}
                  className="btn-gold px-6 py-2.5 text-sm font-semibold flex items-center space-x-2"
                >
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>{loading ? 'Adding...' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
