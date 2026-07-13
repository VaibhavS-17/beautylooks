import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { formatPrice } from '@/lib/data';
import { Package, MessageCircle, ChevronLeft, CheckCircle2, Circle, X } from 'lucide-react';
import { InvoicePrintView, BuyItAgainButton, PrintInvoiceButton } from '@/components/shared/InvoicePrintView';

const ORDER_STEPS = ['Order Placed', 'Confirmed', 'Shipped', 'Delivered'] as const;

function getStepIndex(status: string): number {
  const map: Record<string, number> = {
    'pending': 0,
    'order_placed': 0,
    'confirmed': 1,
    'shipped': 2,
    'out_for_delivery': 2,
    'delivered': 3,
  };
  return map[status.toLowerCase()] ?? 0;
}

function OrderStepper({ status }: { status: string }) {
  if (status.toLowerCase() === 'cancelled') {
    return (
      <div className="flex items-center space-x-2 py-4">
        <X size={20} className="text-red-600" />
        <span className="text-sm font-semibold text-red-600 uppercase tracking-wider bg-red-50 px-3 py-1.5 rounded border border-red-200">
          Order Cancelled
        </span>
      </div>
    );
  }

  const currentStep = getStepIndex(status);

  return (
    <div className="py-6">
      <div className="flex items-center w-full">
        {ORDER_STEPS.map((step, idx) => {
          const isCompleted = idx <= currentStep;
          const isLast = idx === ORDER_STEPS.length - 1;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-[#C9A94E] text-white'
                      : 'bg-[#F9F7F3] border-2 border-[#EFECE6] text-[#BFBAB2]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={16} strokeWidth={2.5} />
                  ) : (
                    <Circle size={12} strokeWidth={2} />
                  )}
                </div>
                <span
                  className={`text-xs mt-2 text-center leading-tight whitespace-nowrap font-medium ${
                    isCompleted ? 'text-[#9A7B2F]' : 'text-[#BFBAB2]'
                  }`}
                >
                  {step}
                </span>
              </div>

              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-2 mt-[-18px] ${
                    idx < currentStep ? 'bg-[#C9A94E]' : 'bg-[#EFECE6]'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default async function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  const { data: order, error } = await supabase.from('orders').select(`
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
  `).eq('id', resolvedParams.orderId).eq('user_id', user.id).single();

  if (error || !order) {
    notFound();
  }

  const addr = order.shipping_address as any;
  const subtotal = order.order_items.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0);
  const shipping = subtotal >= 499 ? 0 : 49;

  return (
    <div className="w-full min-h-screen bg-[#FCFBF9] py-12 text-left relative">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/account/orders" className="w-10 h-10 bg-white border border-[#EFECE6] rounded-full flex items-center justify-center text-[#4E463F] hover:bg-[#F9F7F3] hover:text-[#C9A94E] transition-colors shadow-sm">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold font-display text-[#1A1A1A]">
                Order Details
              </h1>
              <p className="text-sm text-[#706A60] mt-1 font-mono">
                #{order.id.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi, I would like to track my order: ${order.id}`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm font-semibold text-[#25D366] border border-[#25D366]/30 px-4 py-2 rounded-lg hover:bg-[#25D366]/10 transition-colors shadow-sm bg-white"
            >
              <MessageCircle size={16} />
              <span className="hidden sm:inline">Track Support</span>
            </a>
            <PrintInvoiceButton />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card bg-white border border-[#EFECE6] p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-display font-semibold text-[#9A7B2F] border-b border-[#EFECE6] pb-4 mb-4">Order Status</h2>
              <OrderStepper status={order.status} />
            </div>

            <div className="glass-card bg-white border border-[#EFECE6] p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-display font-semibold text-[#9A7B2F] border-b border-[#EFECE6] pb-4 mb-4">Items Included</h2>
              <div className="space-y-4">
                {order.order_items.map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 border border-[#EFECE6] rounded-xl hover:border-[#C9A94E] transition-colors">
                    <div className="flex items-center space-x-4">
                      {item.products?.images?.[0] ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#EFECE6] flex-shrink-0 shadow-sm">
                          <Image src={item.products.images[0]} alt={item.products.name} fill sizes="64px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg border border-[#EFECE6] flex items-center justify-center bg-[#F9F7F3] flex-shrink-0">
                          <Package size={24} className="text-[#9A7B2F]" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-[#1A1A1A]">{item.products?.name}</h4>
                        <p className="text-sm text-[#706A60] mt-1">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                      <span className="font-bold text-[#1A1A1A] text-lg">{formatPrice(item.unit_price * item.quantity)}</span>
                      <BuyItAgainButton item={item} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card bg-[#FCFBF9] border border-[#EFECE6] p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-display font-semibold text-[#9A7B2F] border-b border-[#EFECE6] pb-4 mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#706A60]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#1A1A1A]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#706A60]">
                  <span>Shipping</span>
                  <span className="font-medium text-[#1A1A1A]">{shipping === 0 ? 'Complimentary' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-[#1A1A1A] border-t border-[#EFECE6] pt-4 mt-2">
                  <span>Total</span>
                  <span className="text-[#9A7B2F]">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>

            {addr && (
              <div className="glass-card bg-white border border-[#EFECE6] p-6 rounded-2xl shadow-sm">
                <h2 className="text-lg font-display font-semibold text-[#9A7B2F] border-b border-[#EFECE6] pb-4 mb-4">Shipping Address</h2>
                <div className="text-sm text-[#5C554D] space-y-1">
                  {addr.full_name && <p className="font-semibold text-[#1A1A1A] mb-2">{addr.full_name}</p>}
                  {addr.line1 && <p>{addr.line1}</p>}
                  {addr.line2 && <p>{addr.line2}</p>}
                  {(addr.city || addr.state || addr.pincode) && (
                    <p>{[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</p>
                  )}
                  {addr.phone && <p className="pt-2">📞 +91 {addr.phone}</p>}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      <InvoicePrintView order={order} />
    </div>
  );
}
