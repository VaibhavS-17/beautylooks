import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { formatPrice } from '@/lib/data';
import { Package, ChevronLeft } from 'lucide-react';
import { OrderFilter } from '@/components/shared/InvoicePrintView';

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string, range?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  let query = supabase.from('orders').select(`
    id,
    created_at,
    total_amount,
    status,
    shipping_address,
    order_items(
      quantity,
      unit_price,
      products(
        id,
        name,
        images
      )
    )
  `).eq('user_id', user.id).order('created_at', { ascending: false });

  if (resolvedSearchParams.status && resolvedSearchParams.status !== 'all') {
    query = query.eq('status', resolvedSearchParams.status);
  }

  if (resolvedSearchParams.range && resolvedSearchParams.range !== 'all') {
    const days = parseInt(resolvedSearchParams.range, 10);
    if (!isNaN(days)) {
      const date = new Date();
      date.setDate(date.getDate() - days);
      query = query.gte('created_at', date.toISOString());
    }
  }

  const { data: orders } = await query;

  return (
    <div className="w-full text-left relative animate-in fade-in duration-500">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/account/profile" className="w-10 h-10 bg-white border border-[#EFECE6] rounded-full flex items-center justify-center text-[#4E463F] hover:bg-[#F9F7F3] hover:text-[#C9A94E] transition-colors shadow-sm">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-semibold font-display text-[#1A1A1A]">
          Order History
        </h1>
      </div>
      <OrderFilter currentStatus={resolvedSearchParams.status} currentRange={resolvedSearchParams.range} />
      <div className="space-y-4 mt-6">
        {(!orders || orders.length === 0) ? (
          <div className="py-16 text-center space-y-4 border border-[#EFECE6] rounded-2xl bg-[#FCFBF9] shadow-sm max-w-sm mx-auto">
            <h4 className="font-display font-medium text-base text-[#1A1A1A]">No Orders Found</h4>
            <p className="text-sm text-[#4E463F] mt-1 font-light">
              Try adjusting your filters or start shopping.
            </p>
            <Link href="/products" className="btn-gold text-sm inline-block py-2.5 px-6 shadow-sm mt-2">
              Continue Shopping
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className="block border border-[#EFECE6] rounded-xl p-5 bg-[#FCFBF9] space-y-4 shadow-sm hover:border-[#C9A94E40] transition-colors cursor-pointer group">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#EFECE6] pb-3 text-sm">
                <div>
                  <span className="text-[#706A60]">Order ID: </span>
                  <span className="font-bold text-[#1A1A1A]">{order.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-[#706A60]">Date: </span>
                  <span className="text-[#1A1A1A] font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                    order.status === 'confirmed' || order.status === 'delivered'
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : order.status === 'cancelled'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-[#C9A94E15] text-[#9A7B2F] border border-[#C9A94E30]'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items preview */}
              <div className="space-y-2">
                {order.order_items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm text-[#5C554D]">
                    <div className="flex items-center space-x-3">
                      {item.products?.images?.[0] ? (
                        <div className="relative w-10 h-10 rounded-md overflow-hidden border border-[#EFECE6] flex-shrink-0">
                          <Image src={item.products.images[0]} alt={item.products.name} fill sizes="40px" className="object-cover" />
                        </div>
                      ) : (
                        <Package size={16} className="text-[#9A7B2F] flex-shrink-0" />
                      )}
                      <span>{item.products?.name} <strong className="text-[#1A1A1A]">x {item.quantity}</strong></span>
                    </div>
                    <span className="font-semibold text-[#1A1A1A]">{formatPrice(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-[#EFECE6] pt-3 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-[#706A60]">Total amount</span>
                  <span className="text-sm font-bold text-[#9A7B2F]">{formatPrice(order.total_amount)}</span>
                </div>
                <span className="text-[#9A7B2F] font-medium text-xs group-hover:underline">View Details →</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
