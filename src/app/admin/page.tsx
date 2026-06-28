import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/admin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/account');
  }

  // Fetch real statistics
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  const { count: activeCustomers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer');

  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount')
    .not('status', 'eq', 'cancelled');

  const grossRevenue = (revenueData || []).reduce((sum, item) => sum + Number(item.total_amount), 0);

  // Fetch recent orders with customer profile join
  const { data: recentOrdersData } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      status,
      created_at,
      profiles (
        full_name,
        phone
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  const mappedOrders = (recentOrdersData || []).map((ord: any) => ({
    id: ord.id,
    customerName: ord.profiles?.full_name || 'Anonymous Customer',
    customerEmail: ord.profiles?.phone ? `+91 ${ord.profiles.phone}` : 'Registered Customer',
    amount: Number(ord.total_amount),
    status: ord.status,
    date: new Date(ord.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }));

  // Fetch categories & brands for dropdowns
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  const { data: brands } = await supabase
    .from('brands')
    .select('id, name')
    .order('name');

  const stats = {
    totalProducts: totalProducts || 0,
    totalOrders: totalOrders || 0,
    grossRevenue: grossRevenue || 0,
    activeCustomers: activeCustomers || 0
  };

  return (
    <AdminClient 
      stats={stats} 
      recentOrders={mappedOrders}
      categories={categories || []}
      brands={brands || []}
    />
  );
}
