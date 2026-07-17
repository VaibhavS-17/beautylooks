'use client';

import React, { useState } from 'react';
import OrdersTab from '../tabs/OrdersTab';
import { updateOrderStatusAdmin, verifyUtrAdmin } from '@/app/actions/adminActions';

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

export default function OrdersClient({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleOrderStatus = async (orderId: string, status: any) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await updateOrderStatusAdmin(orderId, status);
      if (res.error) {
        alert(`Failed to update order status: ${res.error}`);
      } else {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('An error occurred while updating order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleVerifyUtr = async (orderId: string, action: 'approve' | 'reject') => {
    setUpdatingOrderId(orderId);
    try {
      const res = await verifyUtrAdmin(orderId, action);
      if (res.error) {
        alert(`Failed to verify UTR: ${res.error}`);
      } else {
        const nextUtrStatus = action === 'approve' ? 'approved' : 'rejected';
        const nextOrderStatus = action === 'approve' ? 'confirmed' : 'failed';
        setOrders(prev => prev.map(o => o.id === orderId ? {
          ...o,
          utrStatus: nextUtrStatus,
          status: nextOrderStatus,
          utrVerifiedAt: new Date().toISOString()
        } : o));
      }
    } catch (err) {
      console.error('Error verifying UTR:', err);
      alert('An error occurred while verifying UTR.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div suppressHydrationWarning>
      <OrdersTab
        orders={orders}
        updatingOrderId={updatingOrderId}
        handleOrderStatus={handleOrderStatus}
        handleVerifyUtr={handleVerifyUtr}
      />
    </div>
  );
}
