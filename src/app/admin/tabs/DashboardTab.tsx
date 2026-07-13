'use client';

import React from 'react';
import { DollarSign, TrendingUp, Package, Users, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatPrice } from '@/lib/data';

// Mock chart data for last 7 days
const salesData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 5000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 8890 },
  { name: 'Sat', sales: 13900 },
  { name: 'Sun', sales: 11490 },
];

interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

interface DashboardTabProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
    grossRevenue: number;
    activeCustomers: number;
  };
  orders: AdminOrder[];
  onViewAllOrders: () => void;
}

export default function DashboardTab({ stats, orders, onViewAllOrders }: DashboardTabProps) {
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

      {/* Sales Chart */}
      <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm p-6">
        <h3 className="font-display font-semibold text-lg mb-6">Revenue (Last 7 Days)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={salesData}
              margin={{
                top: 5,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A94E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#C9A94E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFECE6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8C8885', fontSize: 12}} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#8C8885', fontSize: 12}}
                tickFormatter={(value) => `₹${value / 1000}k`}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #EFECE6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                formatter={(value: any) => [formatPrice(value as number), 'Revenue']}
              />
              <Area type="monotone" dataKey="sales" stroke="#C9A94E" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Table Preview */}
      <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-semibold text-lg">Recent Customer Orders</h3>
          <button onClick={onViewAllOrders} className="text-xs font-semibold text-[#CA8A04] hover:underline flex items-center gap-1">
            <span>View all orders</span>
            <ChevronRight size={14} />
          </button>
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
                      order.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 text-[#8C8885]">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
