'use client';

import React, { useState } from 'react';
import { Search, Loader2, ChevronDown, ChevronUp, MapPin, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/data';

interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
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
              <th className="p-4 w-10"></th>
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
                            onClick={(e) => e.stopPropagation()}
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
                                        <span className="font-mono mt-0.5">{order.razorpayPaymentId || 'Pending/Failed'}</span>
                                      </p>
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
  );
}
