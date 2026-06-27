'use client';

import React from 'react';
import { Package, ShoppingBag, IndianRupee, Users, ArrowUpRight, Plus, RefreshCw, BarChart2 } from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { useAdminStore, AdminOrder } from '@/lib/adminStore';

export default function AdminDashboardPage() {
  const { 
    totalProducts, 
    totalOrders, 
    grossRevenue, 
    activeCustomers, 
    recentOrders,
    updateOrderStatus,
    addDiscountCode,
    syncSchema,
    addProduct
  } = useAdminStore();

  const stats = [
    { label: 'Total Products', value: totalProducts.toString(), icon: Package, change: '+2 new' },
    { label: 'Total Orders', value: totalOrders.toString(), icon: ShoppingBag, change: '+12 this week' },
    { label: 'Gross Revenue', value: formatPrice(grossRevenue), icon: IndianRupee, change: '+18% growth' },
    { label: 'Active Customers', value: activeCustomers.toString(), icon: Users, change: '+24 new signups' },
  ];

  const handleStatusChange = (orderId: string, currentStatus: string) => {
    const statuses: AdminOrder['status'][] = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(currentStatus as AdminOrder['status']);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    updateOrderStatus(orderId, nextStatus);
  };

  return (
    <div className="w-full min-h-screen bg-primary py-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold font-display text-text-main">
              Admin Dashboard
            </h1>
            <p className="text-xs text-text-muted mt-1 font-light">
              Overview of store operations, sales growth, and customer transactions.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => syncSchema()}
              className="btn-secondary text-xs py-2.5 px-4 flex items-center space-x-1.5"
            >
              <RefreshCw size={14} />
              <span>Sync Schema</span>
            </button>
            <button
              onClick={() => addProduct()}
              className="btn-primary text-xs py-2.5 px-4 flex items-center space-x-1.5"
            >
              <Plus size={14} />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Demo Notice Banner */}
        <div className="bg-secondary border border-accent/20 p-4 rounded-xl text-xs text-text-main mb-8 flex items-center space-x-2.5 shadow-sm">
          <span className="font-semibold text-accent">💡 Live Sandbox:</span>
          <span>This admin dashboard is now functionally connected to Zustand local storage. Try adding products or clicking order statuses to advance them!</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-2 text-left">
                  <span className="block text-xs text-text-muted font-medium uppercase tracking-wider">{stat.label}</span>
                  <span className="block text-2xl font-bold text-text-main font-display">{stat.value}</span>
                  <span className="block text-[10px] text-green-600 font-semibold">{stat.change}</span>
                </div>
                <div className="p-3 bg-secondary rounded-xl text-accent border border-border shadow-sm">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Table & Quick Action Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Recent Orders Table */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-display text-base font-semibold tracking-wider text-text-main uppercase">
                Recent Orders
              </h3>
              <button
                className="text-xs text-accent hover:text-text-main font-semibold flex items-center space-x-1 transition-colors"
              >
                <span>View All</span>
                <ArrowUpRight size={12} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-text-muted">
                <thead>
                  <tr className="border-b border-border text-text-main font-semibold uppercase tracking-wider text-[10px] bg-primary/50">
                    <th className="py-3 px-4 rounded-tl-lg">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 rounded-tr-lg">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-primary transition-colors">
                      <td className="py-3 px-4 font-bold text-text-main">{order.id}</td>
                      <td className="py-3 px-4 font-medium text-text-main">{order.customer}</td>
                      <td className="py-3 px-4 font-semibold text-accent">{formatPrice(order.amount)}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleStatusChange(order.id, order.status)}
                          className={`px-3 py-1 rounded-full text-[9px] font-semibold uppercase tracking-widest transition-colors ${
                            order.status === 'confirmed' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                            order.status === 'delivered' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                            'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {order.status}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-text-muted">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions & Analytics */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Actions Panel */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4 text-left">
              <h3 className="font-display text-base font-semibold tracking-wider text-text-main uppercase border-b border-border pb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-3 text-xs">
                <button onClick={() => addDiscountCode()} className="w-full text-left py-3 px-4 rounded-xl bg-primary hover:bg-secondary border border-border font-medium text-text-main transition-colors flex items-center justify-between group">
                  <span>Create discount code</span>
                  <Plus size={14} className="text-accent group-hover:text-text-main transition-colors" />
                </button>
                <button onClick={() => alert('Blog management opened')} className="w-full text-left py-3 px-4 rounded-xl bg-primary hover:bg-secondary border border-border font-medium text-text-main transition-colors flex items-center justify-between group">
                  <span>Write new blog post</span>
                  <ArrowUpRight size={14} className="text-accent group-hover:text-text-main transition-colors" />
                </button>
              </div>
            </div>

            {/* Basic analytics card */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <BarChart2 size={64} />
              </div>
              <div className="flex items-center space-x-2 text-accent font-semibold text-sm">
                <BarChart2 size={16} />
                <span className="font-display uppercase tracking-wider">Weekly Overview</span>
              </div>
              <p className="text-xs text-text-muted font-light leading-relaxed">
                Sales have grown by <strong className="text-text-main font-medium">+18%</strong> compared to the previous week. Most views originate from Carter Road and Bandra.
              </p>
              <div className="h-2 bg-primary rounded-full overflow-hidden border border-border">
                <div className="h-full bg-accent w-3/4 rounded-full" />
              </div>
              <div className="flex justify-between text-[10px] text-text-muted font-medium">
                <span>Conversion rate: 3.2%</span>
                <span>Goal: 4.0%</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
