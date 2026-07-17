import React from 'react';
import { createClient } from '@/lib/supabase/server';
import OrdersClient from './OrdersClient';

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  let ordersData: any[] | null = null;

  const fullQuery = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      status,
      created_at,
      failed_at,
      shipping_address,
      razorpay_order_id,
      razorpay_payment_id,
      upi_utr,
      utr_status,
      utr_verified_at,
      profiles (
        full_name,
        phone
      ),
      order_items (
        id,
        quantity,
        unit_price,
        products (
          name,
          images
        )
      )
    `)
    .order('created_at', { ascending: false });

  ordersData = fullQuery.data as any[] | null;
  const error = fullQuery.error;

  if (error) {
    console.warn('Full admin orders query failed (e.g. unapplied migrations), attempting fallback query. Reason:', error?.message || error?.code || error?.details || String(error));

    // Fallback if recent migrations (like utr_status, razorpay columns) have not been applied yet
    const fallbackResponse = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        shipping_address,
        profiles (
          full_name,
          phone
        ),
        order_items (
          id,
          quantity,
          unit_price,
          products (
            name,
            images
          )
        )
      `)
      .order('created_at', { ascending: false });

    ordersData = fallbackResponse.data as any[] | null;

    if (fallbackResponse.error) {
      console.warn('Fallback admin orders query failed, attempting basic query. Reason:', fallbackResponse.error?.message || fallbackResponse.error?.code || fallbackResponse.error?.details || String(fallbackResponse.error));

      // Basic Stage 3 fallback without joins in case of RLS or relationship issues
      const basicResponse = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      ordersData = basicResponse.data as any[] | null;

      if (basicResponse.error) {
        console.error('All queries for admin orders failed:', basicResponse.error?.message || basicResponse.error?.code || basicResponse.error?.details || String(basicResponse.error));
      }
    }
  }

  const mappedOrders = (ordersData || []).map((ord: any) => ({
    id: ord.id,
    customerName: ord.profiles?.full_name || 'Anonymous Customer',
    customerEmail: ord.profiles?.phone ? `+91 ${ord.profiles.phone}` : 'Registered Customer',
    amount: Number(ord.total_amount),
    status: ord.status,
    date: new Date(ord.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    failedAt: ord.failed_at ? new Date(ord.failed_at).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null,
    shippingAddress: ord.shipping_address,
    razorpayOrderId: ord.razorpay_order_id,
    razorpayPaymentId: ord.razorpay_payment_id,
    upiUtr: ord.upi_utr,
    utrStatus: ord.utr_status,
    utrVerifiedAt: ord.utr_verified_at,
    items: (ord.order_items || []).map((item: any) => ({
      name: item.products?.name || 'Product',
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      image: Array.isArray(item.products?.images) && item.products.images.length > 0 ? item.products.images[0] : undefined
    }))
  }));

  return <OrdersClient initialOrders={mappedOrders} />;
}
