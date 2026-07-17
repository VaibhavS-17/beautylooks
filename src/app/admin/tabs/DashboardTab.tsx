'use client';

import React from 'react';
import Link from 'next/link';
import { DollarSign, TrendingUp, Package, Users, ChevronRight, AlertTriangle, Award } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatPrice } from '@/lib/data';

interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'pending' | 'payment_verifying' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'failed';
  date: string;
  failedAt?: string | null;
}

interface DashboardTabProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
    grossRevenue: number;
    activeCustomers: number;
  };
  orders: AdminOrder[];
  products?: Array<{ id: string; name: string; stockQuantity: number }>;
  salesData?: Array<{ name: string; date?: string; sales: number; ordersCount?: number }>;
  topProducts?: Array<{ id: string; name: string; quantity: number; revenue: number }>;
  onViewAllOrders?: () => void;
  onNavigateToProducts?: (filter?: string) => void;
}

export default function DashboardTab({
  stats,
  orders,
  products = [],
  salesData = [],
  topProducts = [],
  onViewAllOrders,
  onNavigateToProducts
}: DashboardTabProps) {
  // Fallback data if no recent sales recorded
  const chartSalesData = salesData.length > 0 ? salesData : [
    { name: 'Mon', sales: 0 },
    { name: 'Tue', sales: 0 },
    { name: 'Wed', sales: 0 },
    { name: 'Thu', sales: 0 },
    { name: 'Fri', sales: 0 },
    { name: 'Sat', sales: 0 },
    { name: 'Sun', sales: 0 },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-3xl font-bold font-display text-[#1C1917]">Dashboard Overview</h2>
          <p className="text-sm text-[#8A8177]">Real-time business performance & administrative controls.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Gross Revenue', value: formatPrice(stats.grossRevenue), desc: 'Excludes cancellations', icon: DollarSign, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Total Orders', value: stats.totalOrders.toString(), desc: 'Lifetime sales', icon: TrendingUp, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Active Products', value: stats.totalProducts.toString(), desc: 'Live in catalog', icon: Package, color: 'bg-amber-50 text-amber-700 border-amber-200' },
          { label: 'Registered Customers', value: stats.activeCustomers.toString(), desc: 'Account holders', icon: Users, color: 'bg-purple-50 text-purple-700 border-purple-200' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-[#EFECE6] shadow-sm flex flex-col justify-between h-40 transition-all hover:shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#8A8177]">{stat.label}</span>
                <div className={`p-2 rounded-xl border ${stat.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <span className="text-3xl font-bold font-display text-[#1C1917]">{stat.value}</span>
              <span className="text-xs text-[#8C8885]">{stat.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Low Stock Alerts */}
      {(() => {
        const lowStockProducts = products.filter(p => p.stockQuantity < 5);
        if (lowStockProducts.length === 0) return null;
        return (
          <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200/80 rounded-2xl p-6 shadow-sm animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-red-900">
                    Low Inventory Alert — {lowStockProducts.length} {lowStockProducts.length === 1 ? 'Product' : 'Products'}
                  </h3>
                  <p className="text-xs text-red-700/80 mt-0.5 font-light">
                    These products have fewer than 5 units remaining and may need restocking.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {lowStockProducts.slice(0, 8).map(item => (
                      <span
                        key={item.id}
                        className="px-2.5 py-1 bg-white/90 border border-red-200 rounded-lg text-xs font-semibold text-[#1C1917] flex items-center gap-1.5 shadow-xs"
                      >
                        <span className="truncate max-w-[140px]">{item.name}</span>
                        <span className="bg-red-600 text-white text-[9px] px-1.5 py-px rounded font-bold shrink-0">
                          {item.stockQuantity} left
                        </span>
                      </span>
                    ))}
                    {lowStockProducts.length > 8 && (
                      <Link
                        href="/admin/products?filter=low-stock"
                        className="px-2.5 py-1 bg-white/80 hover:bg-white border border-red-200 rounded-lg text-xs text-red-700 font-semibold transition-colors cursor-pointer shadow-2xs"
                      >
                        +{lowStockProducts.length - 8} more →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              <Link
                href="/admin/products?filter=low-stock"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shrink-0 shadow-sm cursor-pointer"
              >
                Restock Now →
              </Link>
            </div>
          </div>
        );
      })()}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm p-6">
          <h3 className="font-display font-semibold text-lg mb-6">Revenue (Last 7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartSalesData}
                margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CA8A04" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#CA8A04" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFECE6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8C8885', fontSize: 12 }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8C8885', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000) + 'k' : value}`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #EFECE6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: any) => [formatPrice(Number(value)), 'Revenue']}
                />
                <Area type="monotone" dataKey="sales" stroke="#CA8A04" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products Chart */}
        <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
              <Award size={18} className="text-[#CA8A04]" />
              <span>Top Selling Products</span>
            </h3>
            <span className="text-xs text-stone-500 font-medium">By Units Sold</span>
          </div>
          <div className="h-[300px] w-full">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 40, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#EFECE6" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#8C8885', fontSize: 12 }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#1C1917', fontSize: 12, fontWeight: 500 }}
                    width={100}
                    tickFormatter={(val: any) => typeof val === 'string' && val.length > 15 ? `${val.slice(0, 15)}...` : val}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #EFECE6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: any, name: any) => [name === 'quantity' ? `${value} units` : formatPrice(Number(value)), name === 'quantity' ? 'Sold' : 'Revenue']}
                  />
                  <Bar dataKey="quantity" fill="#1C1917" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-400 text-xs">
                No completed orders yet to calculate top products.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table Preview */}
      <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-semibold text-lg">Recent Customer Orders</h3>
          <Link href="/admin/orders" className="text-xs font-semibold text-[#CA8A04] hover:underline flex items-center gap-1">
            <span>View all orders</span>
            <ChevronRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-xs">
            <thead>
              <tr className="bg-[#FBF9F6] border-b border-[#EFECE6] uppercase font-bold text-[#8A8177] tracking-wider">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE6]">
              {orders.slice(0, 5).map(order => (
                <tr key={order.id} className="hover:bg-[#FBF9F6]">
                  <td className="p-3 font-mono font-bold">#{order.id.slice(0, 8)}</td>
                  <td className="p-3 font-medium">{order.customerName}</td>
                  <td className="p-3 font-bold text-[#CA8A04]">{formatPrice(order.amount)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                      order.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                      order.status === 'cancelled' || order.status === 'failed' ? 'bg-red-50 text-red-700' : 
                      order.status === 'payment_verifying' ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 text-[#8C8885]">{order.date}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-stone-400">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
