'use client';

import React, { useState } from 'react';
import { Search, Loader2, ChevronDown, ChevronUp, MapPin, CreditCard, CheckSquare, Square, Download, Filter, CheckCircle2, XCircle } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/data';
import AdminConfirmationModal from '../components/AdminConfirmationModal';
import { exportToCsv } from '../utils/exportToCsv';

interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'pending' | 'payment_verifying' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'failed';
  date: string;
  failedAt?: string | null;
  shippingAddress?: any;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  upiUtr?: string | null;
  utrStatus?: 'pending' | 'approved' | 'rejected' | null;
  utrVerifiedAt?: string | null;
  items?: Array<{ name: string; quantity: number; unitPrice: number; image?: string }>;
}

interface OrdersTabProps {
  orders: AdminOrder[];
  updatingOrderId: string | null;
  handleOrderStatus: (id: string, status: any) => Promise<void>;
  handleVerifyUtr?: (id: string, action: 'approve' | 'reject') => Promise<void>;
}

export default function OrdersTab({
  orders,
  updatingOrderId,
  handleOrderStatus,
  handleVerifyUtr
}: OrdersTabProps) {
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>('shipped');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDanger: boolean;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isDanger: false,
    action: async () => {},
  });
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.upiUtr && o.upiUtr.toLowerCase().includes(orderSearch.toLowerCase()));
      
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    
    let matchesDate = true;
    if (startDate || endDate) {
      const orderDate = new Date(o.date);
      if (startDate) matchesDate = matchesDate && orderDate >= new Date(startDate);
      if (endDate) matchesDate = matchesDate && orderDate <= new Date(endDate);
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Paginate filtered orders
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
    if (selectedOrders.size === paginatedOrders.length && paginatedOrders.length > 0) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(paginatedOrders.map((o) => o.id)));
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

  const requestStatusChange = (orderId: string, nextStatus: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Confirm Status Transition`,
      message: `Are you sure you want to change order #${orderId.slice(0, 8)} status to "${nextStatus.toUpperCase()}"?`,
      isDanger: nextStatus === 'cancelled' || nextStatus === 'failed',
      action: async () => {
        setIsModalLoading(true);
        await handleOrderStatus(orderId, nextStatus);
        setIsModalLoading(false);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const requestBulkAction = () => {
    setConfirmModal({
      isOpen: true,
      title: `Bulk Order Update`,
      message: `You are about to change the status of ${selectedOrders.size} selected orders to "${bulkStatus.toUpperCase()}". Proceed?`,
      isDanger: bulkStatus === 'cancelled',
      action: async () => {
        setIsModalLoading(true);
        setIsBulkUpdating(true);
        try {
          for (const id of selectedOrders) {
            await handleOrderStatus(id, bulkStatus);
          }
          setSelectedOrders(new Set());
        } finally {
          setIsBulkUpdating(false);
          setIsModalLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const requestVerifyUtr = (orderId: string, action: 'approve' | 'reject') => {
    if (!handleVerifyUtr) return;
    setConfirmModal({
      isOpen: true,
      title: action === 'approve' ? 'Approve UPI Payment (UTR)' : 'Reject UPI Payment (UTR)',
      message: action === 'approve'
        ? `Are you sure you want to approve this UTR payment for order #${orderId.slice(0, 8)}? The order will be marked as Confirmed.`
        : `Are you sure you want to reject this UTR payment? The order will be marked as Failed.`,
      isDanger: action === 'reject',
      action: async () => {
        setIsModalLoading(true);
        await handleVerifyUtr(orderId, action);
        setIsModalLoading(false);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleExportCsv = () => {
    const headers = ['Order ID', 'Customer Name', 'Customer Phone/Email', 'Amount', 'Status', 'Order Date', 'UPI UTR', 'UTR Status', 'Razorpay Order ID', 'Razorpay Payment ID'];
    const rows = filteredOrders.map(o => [
      o.id,
      o.customerName,
      o.customerEmail,
      o.amount,
      o.status,
      o.date,
      o.upiUtr || '',
      o.utrStatus || '',
      o.razorpayOrderId || '',
      o.razorpayPaymentId || ''
    ]);
    exportToCsv('beautylooks_orders', headers, rows);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left" suppressHydrationWarning>
      <AdminConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={confirmModal.isDanger}
        isLoading={isModalLoading}
        onConfirm={confirmModal.action}
        onClose={() => !isModalLoading && setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display">Orders Portal</h2>
          <p className="text-sm text-[#8A8177]">Monitor client transactions, manage UPI UTR verification, and fulfillments.</p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="px-4 py-2 bg-white border border-[#EFECE6] hover:bg-stone-50 rounded-xl text-xs font-semibold text-[#1C1917] flex items-center gap-2 shadow-sm transition-colors"
        >
          <Download size={14} />
          <span>Export CSV ({filteredOrders.length})</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8177]" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer, Phone, or UPI UTR..."
            value={orderSearch}
            onChange={e => { setOrderSearch(e.target.value); setCurrentPage(1); }}
            className="pl-9 pr-4 py-2 border border-[#EFECE6] rounded-xl text-xs focus:outline-none focus:border-[#CA8A04] bg-white w-full shadow-2xs"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#FBF9F6] px-3 py-1.5 rounded-xl border border-[#EFECE6]">
            <Filter size={13} className="text-[#8A8177]" />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs font-semibold outline-none cursor-pointer text-[#1C1917]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="payment_verifying">Payment Verifying</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#FBF9F6] px-3 py-1 rounded-xl border border-[#EFECE6]">
            <input
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs outline-none text-[#1C1917]"
              title="Start Date"
            />
            <span className="text-[#8A8177] text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs outline-none text-[#1C1917]"
              title="End Date"
            />
          </div>
          {(orderSearch || statusFilter !== 'all' || startDate || endDate) && (
            <button
              type="button"
              onClick={() => { setOrderSearch(''); setStatusFilter('all'); setStartDate(''); setEndDate(''); setCurrentPage(1); }}
              className="text-xs text-[#CA8A04] font-semibold px-2 hover:underline"
            >
              Reset
            </button>
          )}
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
              onClick={requestBulkAction}
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
        <table className="w-full min-w-[700px] text-left text-xs" suppressHydrationWarning>
          <thead>
            <tr className="bg-[#FBF9F6] border-b border-[#EFECE6] uppercase font-bold text-[#8A8177] tracking-wider">
              <th className="p-4 w-10">
                <button onClick={toggleSelectAll} className="p-0.5 rounded hover:bg-[#EFECE6] transition-colors" type="button" suppressHydrationWarning>
                  {selectedOrders.size === paginatedOrders.length && paginatedOrders.length > 0 ? (
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
          <tbody className="divide-y divide-[#EFECE6]" suppressHydrationWarning>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#8C8885]">No orders match your filter.</td>
              </tr>
            ) : (
              paginatedOrders.map(order => {
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
                            onChange={e => requestStatusChange(order.id, e.target.value)}
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
                            {order.status === 'payment_verifying' && <option value="payment_verifying" hidden>Verifying Payment</option>}
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
                          <div className="bg-[#FBF9F6] border-t border-b border-[#EFECE6] p-6 space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                              {/* Shipping Address */}
                              <div className="space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8A8177] flex items-center gap-1.5">
                                  <MapPin size={12} />
                                  Shipping Address
                                </h4>
                                {addr ? (
                                  <div className="text-xs text-[#1C1917] space-y-0.5 bg-white rounded-xl p-3 border border-[#EFECE6] shadow-2xs">
                                    <p className="font-semibold">{addr.fullName || addr.full_name || '—'}</p>
                                    {(addr.phone) && <p className="text-[#8A8177]">📱 {addr.phone}</p>}
                                    <p>{addr.line1 || addr.addressLine1 || addr.address_line1 || '—'}</p>
                                    {(addr.line2 || addr.addressLine2 || addr.address_line2) && <p>{addr.line2 || addr.addressLine2 || addr.address_line2}</p>}
                                    <p>
                                      {addr.city || '—'}, {addr.state || '—'} — {addr.pincode || addr.zip || '—'}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-[#8C8885] italic">No shipping address on record.</p>
                                )}
                              </div>

                              {/* Payment & UTR Info */}
                              <div className="space-y-2 md:col-span-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8A8177] flex items-center gap-1.5">
                                  <CreditCard size={12} />
                                  Payment & UTR Verification
                                </h4>
                                <div className="text-xs text-[#1C1917] space-y-3 bg-white rounded-xl p-4 border border-[#EFECE6] shadow-2xs">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <span className="text-[10px] text-[#8C8885] font-semibold uppercase tracking-wider block">Gateway Reference</span>
                                      {order.razorpayOrderId ? (
                                        <div className="mt-1 space-y-1">
                                          <p><span className="text-stone-500">Order ID:</span> <span className="font-mono">{order.razorpayOrderId}</span></p>
                                          <p><span className="text-stone-500">Payment ID:</span> <span className="font-mono">{order.razorpayPaymentId || 'Pending'}</span></p>
                                        </div>
                                      ) : (
                                        <p className="mt-1 text-stone-500 italic">Manual / UPI Direct Payment</p>
                                      )}
                                    </div>

                                    <div className="border-t sm:border-t-0 sm:border-l border-[#EFECE6] pt-3 sm:pt-0 sm:pl-4">
                                      <span className="text-[10px] text-[#8C8885] font-semibold uppercase tracking-wider block">UPI UTR Status</span>
                                      {order.upiUtr ? (
                                        <div className="mt-1 space-y-2">
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-sm bg-stone-100 px-2 py-1 rounded border border-stone-200">
                                              {order.upiUtr}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                              order.utrStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                              order.utrStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                              {order.utrStatus || 'Pending'}
                                            </span>
                                          </div>

                                          {/* UTR Verification Action Buttons */}
                                          {(!order.utrStatus || order.utrStatus === 'pending') && handleVerifyUtr && (
                                            <div className="flex items-center gap-2 pt-1">
                                              <button
                                                type="button"
                                                onClick={() => requestVerifyUtr(order.id, 'approve')}
                                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-xs"
                                              >
                                                <CheckCircle2 size={13} />
                                                <span>Approve UTR</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => requestVerifyUtr(order.id, 'reject')}
                                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-xs"
                                              >
                                                <XCircle size={13} />
                                                <span>Reject UTR</span>
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <p className="mt-1 text-stone-500 italic">No UPI UTR submitted for this order.</p>
                                      )}
                                    </div>
                                  </div>

                                  {order.failedAt && (
                                    <p className="flex items-center gap-1 border-t border-[#EFECE6] pt-2 text-red-600 text-xs font-semibold">
                                      <span>⚠️ Order marked Failed at:</span>
                                      <span className="font-mono">{order.failedAt}</span>
                                    </p>
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

        {/* Pagination Footer */}
        <div className="p-4 bg-[#FBF9F6] border-t border-[#EFECE6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-[#8A8177]">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length} orders
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-lg border border-[#EFECE6] bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              Previous
            </button>
            <span className="px-3 font-semibold text-[#1C1917]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 rounded-lg border border-[#EFECE6] bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
