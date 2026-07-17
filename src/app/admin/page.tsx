import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardTab from './tabs/DashboardTab';

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const tab = searchParams?.tab;
  if (tab && tab !== 'dashboard') {
    redirect(`/admin/${tab}`);
  }

  const supabase = await createClient();

  // Try calling the combined dashboard stats RPC function
  const { data: rpcStats, error: rpcError } = await supabase.rpc('get_admin_dashboard_stats');

  let stats = {
    totalProducts: 0,
    totalOrders: 0,
    grossRevenue: 0,
    activeCustomers: 0,
  };
  let salesData = [];
  let topProducts = [];

  if (!rpcError && rpcStats) {
    stats = {
      totalProducts: Number(rpcStats.totalProducts || 0),
      totalOrders: Number(rpcStats.totalOrders || 0),
      grossRevenue: Number(rpcStats.grossRevenue || 0),
      activeCustomers: Number(rpcStats.activeCustomers || 0),
    };
    salesData = rpcStats.salesData || [];
    topProducts = rpcStats.topProducts || [];
  } else {
    // Fallback if RPC migration hasn't been applied yet
    const [
      { count: totalProducts },
      { count: totalOrders },
      { count: activeCustomers },
      { data: revenueData }
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('orders').select('total_amount').in('status', ['confirmed', 'shipped', 'delivered'])
    ]);

    const grossRevenue = (revenueData || []).reduce((sum, item) => sum + Number(item.total_amount), 0);
    stats = {
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      grossRevenue: grossRevenue || 0,
      activeCustomers: activeCustomers || 0,
    };
  }

  // Fetch low stock products for alert
  const { data: lowStockData } = await supabase
    .from('products')
    .select('id, name, stock_quantity')
    .lt('stock_quantity', 5)
    .order('stock_quantity', { ascending: true })
    .limit(20);

  const mappedLowStock = (lowStockData || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    stockQuantity: p.stock_quantity
  }));

  // Fetch recent 5 orders with customer profile join
  const { data: recentOrdersData } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      status,
      created_at,
      failed_at,
      shipping_address,
      profiles (
        full_name,
        phone
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  const mappedOrders = (recentOrdersData || []).map((ord: any) => ({
    id: ord.id,
    customerName: ord.profiles?.full_name || 'Anonymous Customer',
    customerEmail: ord.profiles?.phone ? `+91 ${ord.profiles.phone}` : 'Registered Customer',
    amount: Number(ord.total_amount),
    status: ord.status,
    date: new Date(ord.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    failedAt: ord.failed_at ? new Date(ord.failed_at).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null,
  }));

  return (
    <DashboardTab
      stats={stats}
      orders={mappedOrders}
      products={mappedLowStock}
      salesData={salesData}
      topProducts={topProducts}
    />
  );
}
