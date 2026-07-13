'use client';

import React from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { Printer } from 'lucide-react';

export function InvoicePrintView({ order }: { order: any }) {
  const subtotal = order.order_items?.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0) || 0;
  const shipping = subtotal >= 499 ? 0 : 49;
  const total = order.total_amount;
  const addr = order.shipping_address;

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #invoice-print-content, #invoice-print-content * {
            visibility: visible !important;
          }
          #invoice-print-content {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 40px !important;
          }
          .no-print {
            display: none !important;
          }
        }
        .invoice-container {
          display: none;
        }
        @media print {
          .invoice-container {
            display: block;
          }
        }
      `}</style>

      <div className="invoice-container">
        <div id="invoice-print-content" className="bg-white w-full max-w-2xl text-left">
          <div className="flex-1 space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-[#EFECE6] pb-6">
              <div>
                <h2 className="text-2xl font-semibold text-[#1A1A1A]">Beauty Looks Mumbai</h2>
                <p className="text-sm text-[#706A60] mt-1">Premium Beauty & Skincare</p>
              </div>
              <div className="text-left sm:text-right">
                <h3 className="text-lg font-semibold text-[#9A7B2F] uppercase tracking-wider">Invoice</h3>
                <p className="text-sm text-[#706A60] mt-1">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                <p className="text-sm text-[#706A60]">Order: <span className="font-mono text-[#1A1A1A] font-medium">{order.id.toUpperCase()}</span></p>
              </div>
            </div>

            {addr && (
              <div className="bg-[#FCFBF9] border border-[#EFECE6] rounded-xl p-4">
                <h4 className="text-xs font-semibold text-[#9A7B2F] uppercase tracking-wider mb-2">Ship To</h4>
                <div className="text-sm text-[#5C554D] space-y-0.5">
                  {addr.full_name && <p className="font-semibold text-[#1A1A1A]">{addr.full_name}</p>}
                  {addr.line1 && <p>{addr.line1}</p>}
                  {addr.line2 && <p>{addr.line2}</p>}
                  {(addr.city || addr.state || addr.pincode) && (
                    <p>{[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</p>
                  )}
                  {addr.phone && <p>📞 +91 {addr.phone}</p>}
                </div>
              </div>
            )}

            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[#EFECE6] text-[#706A60] text-xs uppercase tracking-wider">
                    <th className="text-left py-3 font-semibold">Product</th>
                    <th className="text-center py-3 font-semibold w-16">Qty</th>
                    <th className="text-right py-3 font-semibold w-24">Unit Price</th>
                    <th className="text-right py-3 font-semibold w-24">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6]">
                  {order.order_items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-3 text-[#1A1A1A] font-medium">
                        <div className="flex items-center space-x-3">
                          {item.products?.images?.[0] && (
                            <div className="relative w-8 h-8 rounded-md overflow-hidden border border-[#EFECE6] flex-shrink-0">
                              <Image src={item.products.images[0]} alt={item.products.name} fill sizes="32px" className="object-cover" />
                            </div>
                          )}
                          <span>{item.products?.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center text-[#5C554D]">{item.quantity}</td>
                      <td className="py-3 text-right text-[#5C554D]">{formatPrice(item.unit_price)}</td>
                      <td className="py-3 text-right font-medium text-[#1A1A1A]">{formatPrice(item.unit_price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t-2 border-[#EFECE6] pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-[#706A60]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#706A60]">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Complimentary' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#1A1A1A] border-t border-[#EFECE6] pt-3 mt-2">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="text-center border-t border-[#EFECE6] pt-4">
              <p className="text-sm text-[#9A7B2F] font-medium">Thank you for your purchase!</p>
              <p className="text-xs text-[#706A60] mt-1">For queries, contact us at beautylooksmumbai@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function OrderFilter({ currentStatus, currentRange }: { currentStatus?: string, currentRange?: string }) {
  const router = useRouter();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(window.location.search);
    if (e.target.value && e.target.value !== 'all') {
      params.set('status', e.target.value);
    } else {
      params.delete('status');
    }
    router.push(`?${params.toString()}`);
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(window.location.search);
    if (e.target.value && e.target.value !== 'all') {
      params.set('range', e.target.value);
    } else {
      params.delete('range');
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex gap-4 mb-6">
      <select value={currentStatus || 'all'} onChange={handleStatusChange} className="bg-white text-sm py-2.5 px-4 rounded-xl border border-[#EFECE6] text-[#1A1A1A] focus:outline-none focus:border-[#C9A94E] shadow-sm font-medium cursor-pointer">
        <option value="all">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <select value={currentRange || 'all'} onChange={handleRangeChange} className="bg-white text-sm py-2.5 px-4 rounded-xl border border-[#EFECE6] text-[#1A1A1A] focus:outline-none focus:border-[#C9A94E] shadow-sm font-medium cursor-pointer">
        <option value="all">All Time</option>
        <option value="30">Last 30 Days</option>
        <option value="90">Last 90 Days</option>
        <option value="180">Last 180 Days</option>
      </select>
    </div>
  );
}

export function BuyItAgainButton({ item }: { item: any }) {
  const router = useRouter();

  const handleBuyItAgain = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    useCartStore.getState().setBuyNowItem({
      product: {
        id: item.products.id,
        name: item.products.name,
        price: item.unit_price,
        salePrice: item.unit_price,
        images: item.products.images || [],
        slug: item.products.id,
        category: 'reorder',
        categoryId: 'none',
        brand: 'none',
        brandId: 'none',
        skinType: 'all',
        shortDescription: '',
        description: '',
        stockQuantity: 10,
        rating: 5,
        reviewCount: 0,
        isFeatured: false,
        isActive: true,
      },
      quantity: 1
    });
    router.push('/checkout');
  };

  return (
    <button onClick={handleBuyItAgain} className="text-xs font-semibold text-[#9A7B2F] border border-[#C9A94E] px-4 py-2 rounded-lg hover:bg-[#F9F7F3] transition-colors bg-white shadow-sm z-10 relative">
      Buy It Again
    </button>
  );
}

export function PrintInvoiceButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center space-x-2 bg-[#9A7B2F] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#C9A94E] transition-colors shadow-sm"
    >
      <Printer size={16} />
      <span className="hidden sm:inline">Download Invoice</span>
    </button>
  );
}
