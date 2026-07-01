import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AccountClient from './AccountClient';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile from the profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch addresses
  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false });

  // Fetch orders with items and product details
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      total_amount,
      created_at,
      order_items (
        id,
        quantity,
        unit_price,
        products (
          name
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const userProfile = {
    fullName: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    phone: profile?.phone || user.user_metadata?.phone || '',
    role: profile?.role || 'customer',
    createdAt: user.created_at || '',
  };

  const mappedAddresses = (addresses || []).map(addr => ({
    id: addr.id,
    label: addr.label,
    fullName: addr.full_name,
    phone: addr.phone,
    line1: addr.line1,
    line2: addr.line2 || undefined,
    city: addr.city,
    state: addr.state,
    pincode: addr.pincode,
    isDefault: addr.is_default
  }));

  const mappedOrders = (orders || []).map(ord => ({
    id: ord.id,
    date: new Date(ord.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    total: Number(ord.total_amount),
    status: ord.status,
    items: (ord.order_items || []).map((item: any) => ({
      name: item.products?.name || 'Unknown Product',
      qty: item.quantity,
      price: Number(item.unit_price)
    }))
  }));

  return (
    <AccountClient 
      user={userProfile} 
      initialAddresses={mappedAddresses} 
      initialOrders={mappedOrders} 
    />
  );
}


