'use client';

import React, { useState } from 'react';
import { Search, Loader2, ChevronDown, ChevronUp, MapPin, CreditCard, CheckSquare, Square } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/data';

interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'failed';
  date: string;
  failedAt?: string | null;
  shippingAddress?: any;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  items?: Array<{ name: string; quantity: number; unitPrice: number; image?: string }>;
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
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>('shipped');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.id.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleBulkAction = async () => {
    setIsBulkUpdating(true);
    try {
      for (const id of selectedOrders) {
        await handleOrderStatus(id, bulkStatus);
      }
      setSelectedOrders(new Set());
    } finally {
      setIsBulkUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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
            className="pl-9 pr-4 py-2 border border-[#EFECE6] rounded-xl text-xs focus:outline-none focus:border-[#CA8A04] bg-white w-full sm:w-64 shadow-sm"
          />
        </div>
      </div>

      {selectedOrders.size > 0 && (
        <div className="bg-[#1C1917] text-white p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-fade-in">
          <span className="text-xs font-semibold">{selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected</span>
          <div className="flex items-center gap-3">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="bg-white/10 text-white border border-white/20 rounded-lg py-1.5 px-3 text-xs outline-none"
            >
              <option value="shipped" className="text-black">Mark Shipped</option>
              <option value="delivered" className="text-black">Mark Delivered</option>
              <option value="cancelled" className="text-black">Mark Cancelled</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={isBulkUpdating}
              className="bg-[#CA8A04] hover:bg-amber-600 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isBulkUpdating && <Loader2 size={12} className="animate-spin" />}
              <span>Apply</span>
            </button>
            <button
              onClick={() => setSelectedOrders(new Set())}
              className="text-white/60 hover:text-white text-xs font-semibold transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-xs">
          <thead>
            <tr className="bg-[#FBF9F6] border-b border-[#EFECE6] uppercase font-bold text-[#8A8177] tracking-wider">
              <th className="p-4 w-10">
                <button onClick={toggleSelectAll} className="p-0.5 rounded hover:bg-[#EFECE6] transition-colors" type="button">
                  {selectedOrders.size === filteredOrders.length && filteredOrders.length > 0 ? (
                    <CheckSquare size={16} className="text-[#CA8A04]" />
                  ) : (
                    <Square size={16} className="text-[#8A8177]" />
                  )}
                </button>
              </th>
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
                <td colSpan={6} className="p-8 text-center text-[#8C8885]">No orders match your search.</td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const isExpanded = expandedOrders.has(order.id);
                const addr = order.shippingAddress;

                return (
                  <React.Fragment key={order.id}>
                    <tr className={`hover:bg-[#FBF9F6]/50 cursor-pointer ${isExpanded ? 'bg-[#FBF9F6]/30' : ''}`} onClick={() => toggleExpand(order.id)}>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleSelectOrder(order.id); }}
                            className="p-0.5 rounded hover:bg-[#EFECE6] transition-colors"
                          >
                            {selectedOrders.has(order.id) ? (
                              <CheckSquare size={15} className="text-[#CA8A04]" />
                            ) : (
                              <Square size={15} className="text-[#8A8177]" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleExpand(order.id); }}
                            className="p-1 rounded-md hover:bg-[#EFECE6] transition-colors"
                            aria-label={isExpanded ? 'Collapse order details' : 'Expand order details'}
                          >
                            {isExpanded ? (
                              <ChevronUp size={14} className="text-[#8A8177]" />
                            ) : (
                              <ChevronDown size={14} className="text-[#8A8177]" />
                            )}
                          </button>
                        </div>
                      </td>
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
                            disabled={order.status === 'failed' || order.status === 'cancelled'}
                            onClick={(e) => e.stopPropagation()}
                            onChange={e => handleOrderStatus(order.id, e.target.value)}
                            className={`py-1 px-2.5 rounded-lg text-xs font-semibold outline-none ${
                              order.status === 'failed'
                                ? 'bg-red-50 border border-red-200 text-red-700 cursor-not-allowed opacity-80'
                                : order.status === 'cancelled'
                                ? 'bg-stone-100 border border-stone-200 text-stone-600 cursor-not-allowed opacity-80'
                                : order.status === 'confirmed'
                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 focus:border-emerald-500'
                                : order.status === 'shipped'
                                ? 'bg-blue-50 border border-blue-200 text-blue-700 focus:border-blue-500'
                                : order.status === 'delivered'
                                ? 'bg-purple-50 border border-purple-200 text-purple-700 focus:border-purple-500'
                                : 'bg-amber-50 border border-amber-200 text-amber-700 focus:border-amber-500'
                            }`}
                          >
                            {order.status === 'pending' && <option value="pending" hidden>Pending (Auto)</option>}
                            {order.status === 'confirmed' && <option value="confirmed" hidden>Confirmed (Auto)</option>}
                            {order.status === 'failed' && <option value="failed" hidden>Failed (Auto)</option>}
                            {order.status === 'cancelled' && <option value="cancelled" hidden>Cancelled</option>}
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        )}
                      </td>
                      <td className="p-4 text-[#8C8885]">{order.date}</td>
                    </tr>

                    {/* Expanded Details Panel */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <div className="bg-[#FBF9F6] border-t border-b border-[#EFECE6] p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                              {/* Shipping Address */}
                              <div className="space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8A8177] flex items-center gap-1.5">
                                  <MapPin size={12} />
                                  Shipping Address
                                </h4>
                                {addr ? (
                                  <div className="text-xs text-[#1C1917] space-y-0.5 bg-white rounded-xl p-3 border border-[#EFECE6]">
                                    <p className="font-semibold">{addr.fullName || addr.full_name || '—'}</p>
                                    {(addr.phone) && <p className="text-[#8A8177]">📱 {addr.phone}</p>}
                                    <p>{addr.line1 || addr.address_line1 || '—'}</p>
                                    {(addr.line2 || addr.address_line2) && <p>{addr.line2 || addr.address_line2}</p>}
                                    <p>
                                      {addr.city || '—'}, {addr.state || '—'} — {addr.pincode || addr.zip || '—'}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-[#8C8885] italic">No shipping address on record.</p>
                                )}
                              </div>

                              {/* Payment Info */}
                              <div className="space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8A8177] flex items-center gap-1.5">
                                  <CreditCard size={12} />
                                  Payment Gateway
                                </h4>
                                <div className="text-xs text-[#1C1917] space-y-1.5 bg-white rounded-xl p-3 border border-[#EFECE6]">
                                  {order.razorpayOrderId ? (
                                    <>
                                      <p className="flex flex-col">
                                        <span className="text-[10px] text-[#8C8885] font-semibold uppercase tracking-wider">Razorpay Order ID</span>
                                        <span className="font-mono mt-0.5">{order.razorpayOrderId}</span>
                                      </p>
                                      <p className="flex flex-col border-t border-[#EFECE6] pt-1.5">
                                        <span className="text-[10px] text-[#8C8885] font-semibold uppercase tracking-wider">Razorpay Payment ID</span>
                                        <span className="font-mono mt-0.5">{order.razorpayPaymentId || (order.status === 'failed' ? 'FAILED' : 'Pending')}</span>
                                      </p>
                                      {order.failedAt && (
                                        <p className="flex flex-col border-t border-[#EFECE6] pt-1.5 text-red-600">
                                          <span className="text-[10px] font-semibold uppercase tracking-wider">Failed At</span>
                                          <span className="font-mono text-xs mt-0.5">{order.failedAt}</span>
                                        </p>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-[#8C8885] italic">No gateway reference found.</p>
                                  )}
                                </div>
                              </div>

                            </div>

                            {/* Ordered Items */}
                            {order.items && order.items.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8A8177]">
                                  Ordered Items ({order.items.length})
                                </h4>
                                <div className="bg-white rounded-xl border border-[#EFECE6] overflow-hidden">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="bg-[#FBF9F6] border-b border-[#EFECE6] text-[#8A8177] uppercase tracking-wider font-bold">
                                        <th className="p-3 text-left">Product</th>
                                        <th className="p-3 text-center">Qty</th>
                                        <th className="p-3 text-right">Unit Price</th>
                                        <th className="p-3 text-right">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#EFECE6]">
                                      {order.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-[#FBF9F6]/50">
                                          <td className="p-3 text-left">
                                            <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#FBF9F6] border border-[#EFECE6] shrink-0 relative">
                                                {item.image ? (
                                                  <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    sizes="40px"
                                                    className="object-cover"
                                                  />
                                                ) : (
                                                  <div className="w-full h-full flex items-center justify-center text-[#8A8177] text-[8px] font-bold">
                                                    N/A
                                                  </div>
                                                )}
                                              </div>
                                              <span className="font-semibold text-[#1C1917] line-clamp-1">{item.name}</span>
                                            </div>
                                          </td>
                                          <td className="p-3 text-center font-semibold">{item.quantity}</td>
                                          <td className="p-3 text-right text-[#8A8177]">{formatPrice(item.unitPrice)}</td>
                                          <td className="p-3 text-right font-bold text-[#CA8A04]">{formatPrice(item.unitPrice * item.quantity)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
