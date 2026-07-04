'use client';

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/data';

interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

interface OrdersTabProps {
  orders: AdminOrder[];
  updatingOrderId: string | null;
  handleOrderStatus: (id: string, status: any) => Promise<void>;
}

export default function OrdersTab({
  orders,
  updatingOrderId,
  handleOrderStatus
}: OrdersTabProps) {
  const [orderSearch, setOrderSearch] = useState('');
  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.id.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-display">Orders Portal</h2>
          <p className="text-sm text-[#8A8177]">Monitor client transactions and fulfillments.</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8177]" />
          <input
            type="text"
            placeholder="Search orders..."
            value={orderSearch}
            onChange={e => setOrderSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-[#EFECE6] rounded-xl text-xs focus:outline-none focus:border-[#CA8A04] bg-white w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#FBF9F6] border-b border-[#EFECE6] uppercase font-bold text-[#8A8177] tracking-wider">
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFECE6]">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#8C8885]">No orders match your search.</td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-[#FBF9F6]/50">
                  <td className="p-4 font-mono font-bold">#{order.id.slice(0, 8)}</td>
                  <td className="p-4">
                    <span className="font-semibold block">{order.customerName}</span>
                    <span className="text-[10px] text-[#8C8885] block">{order.customerEmail}</span>
                  </td>
                  <td className="p-4 font-bold text-[#CA8A04]">{formatPrice(order.amount)}</td>
                  <td className="p-4">
                    {updatingOrderId === order.id ? (
                      <Loader2 size={12} className="animate-spin text-[#CA8A04]" />
                    ) : (
                      <select
                        value={order.status}
                        onChange={e => handleOrderStatus(order.id, e.target.value)}
                        className="bg-[#FBF9F6] border border-[#EFECE6] py-1 px-2.5 rounded-lg text-xs font-semibold text-[#1C1917] outline-none focus:border-[#CA8A04]"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                  </td>
                  <td className="p-4 text-[#8C8885]">{order.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
