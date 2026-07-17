import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const secret = (process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || 'dummy_secret').trim();

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const event = payload.event;

    if (event === 'payment.failed') {
      const razorpayOrderId = payload.payload?.payment?.entity?.order_id;
      if (razorpayOrderId) {
        const supabase = createAdminClient();
        await supabase
          .from('orders')
          .update({
            status: 'failed',
            failed_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', razorpayOrderId);
      }
    } else if (event === 'payment.captured' || event === 'order.paid') {
      const razorpayOrderId = payload.payload?.payment?.entity?.order_id || payload.payload?.order?.entity?.id;
      const razorpayPaymentId = payload.payload?.payment?.entity?.id;
      
      if (razorpayOrderId) {
        const supabase = createAdminClient();
        
        // 1. Verify order exists and is not already confirmed
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id, status')
          .eq('razorpay_order_id', razorpayOrderId)
          .single();
          
        if (existingOrder && existingOrder.status !== 'confirmed') {
          // 2. Update order to confirmed
          await supabase
            .from('orders')
            .update({
              status: 'confirmed',
              razorpay_payment_id: razorpayPaymentId,
            })
            .eq('id', existingOrder.id);
            
          // 3. Decrement stock securely
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('product_id, quantity')
            .eq('order_id', existingOrder.id);

          if (orderItems && orderItems.length > 0) {
            for (const item of orderItems) {
              await supabase.rpc('decrement_stock', {
                p_product_id: item.product_id,
                p_quantity: item.quantity
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Razorpay Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
