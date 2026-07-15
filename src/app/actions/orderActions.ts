'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.number().int().min(1)
  })).min(1, 'Order must contain at least one item'),
  shippingAddress: z.any(),
  paymentMethod: z.enum(['upi', 'standard']),
});

export async function createRazorpayOrder(data: {
  items: Array<{ productId: string; quantity: string | number }>;
  shippingAddress: any;
  paymentMethod: 'upi' | 'standard';
}) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Rate Limiting
    const rl = rateLimit(`createRazorpayOrder:${user?.id || 'anon'}`, 5, 60_000);
    if (!rl.success) return { success: false, error: 'Too many requests. Please try again later.' };

    // 2. Validate input schema
    const rawData = {
      items: data.items.map(i => ({ productId: i.productId, quantity: Number(i.quantity) })),
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
    };
    const parsed = createOrderSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid order data.' };
    }

    // 3. Calculate true total amount server-side
    const productIds = parsed.data.items.map(item => item.productId);
    const { data: products } = await supabase
      .from('products')
      .select('id, price, sale_price, stock_quantity')
      .in('id', productIds);

    let calculatedTotal = 0;
    for (const item of parsed.data.items) {
      const product = products?.find(p => p.id === item.productId);
      if (!product) return { success: false, error: 'Product not found.' };
      if (item.quantity > product.stock_quantity) {
        return { success: false, error: 'Insufficient stock for one or more items.' };
      }
      const unitPrice = product.sale_price ?? product.price ?? 0;
      calculatedTotal += unitPrice * item.quantity;
    }

    // 4. Apply 2% discount for UPI
    let finalAmount = calculatedTotal;
    if (parsed.data.paymentMethod === 'upi') {
      finalAmount = calculatedTotal * 0.98; // 2% discount
    }

    // Razorpay expects amount in paise (multiply by 100)
    const amountInPaise = Math.round(finalAmount * 100);

    // 5. Create Razorpay Order
    const rpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    });

    if (!rpOrder || !rpOrder.id) {
      return { success: false, error: 'Failed to create payment order with gateway.' };
    }

    // 6. Create order in DB with pending status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        status: 'pending',
        total_amount: finalAmount,
        shipping_address: parsed.data.shippingAddress,
        razorpay_order_id: rpOrder.id,
      })
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('Create Order DB Error:', orderError);
      return { success: false, error: 'Failed to save order' };
    }

    // 7. Insert order items
    if (products && products.length > 0) {
      const orderItemsToInsert = parsed.data.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: product?.sale_price ?? product?.price ?? 0,
        };
      });
      await supabase.from('order_items').insert(orderItemsToInsert);
    }

    return { 
      success: true, 
      orderId: order.id, 
      razorpayOrderId: rpOrder.id, 
      amount: amountInPaise,
      discountApplied: parsed.data.paymentMethod === 'upi',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy'
    };
  } catch (error: any) {
    console.error('Create Order Error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

const verifyPaymentSchema = z.object({
  order_id: z.string().uuid('Invalid order ID'),
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_order_id: z.string().min(1, 'Razorpay Order ID is required'),
  razorpay_signature: z.string().min(1, 'Signature is required'),
});

export async function verifyPayment(data: {
  order_id: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Rate limit
    const rl = rateLimit(`verifyPayment:${user?.id || 'anon'}`, 10, 60_000);
    if (!rl.success) return { success: false, error: 'Too many requests.' };

    const parsed = verifyPaymentSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid data' };
    }

    // 1. Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
    const body = parsed.data.razorpay_order_id + '|' + parsed.data.razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== parsed.data.razorpay_signature) {
      return { success: false, error: 'Payment verification failed: Invalid signature.' };
    }

    // 2. Verify order exists in DB
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, user_id, status')
      .eq('id', parsed.data.order_id)
      .eq('razorpay_order_id', parsed.data.razorpay_order_id)
      .single();
      
    if (!existingOrder) {
      return { success: false, error: 'Order not found.' };
    }
    
    const adminClient = createAdminClient();
    
    // 3. Update order to confirmed
    const { error } = await adminClient
      .from('orders')
      .update({
        status: 'confirmed',
        razorpay_payment_id: parsed.data.razorpay_payment_id,
      })
      .eq('id', parsed.data.order_id);

    if (error) {
      console.error('Update Order Status Error:', error);
      return { success: false, error: 'Failed to update order status.' };
    }

    // 4. Decrement stock
    const { data: orderItems } = await adminClient
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', parsed.data.order_id);

    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        await adminClient.rpc('decrement_stock', {
          p_product_id: item.product_id,
          p_quantity: item.quantity
        });
      }
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('Verify Payment Exception:', error);
    return { success: false, error: 'An unexpected error occurred during verification.' };
  }
}

export async function recordPaymentFailure(data: { order_id: string; reason?: string } | string) {
  const adminClient = createAdminClient();
  const orderId = typeof data === 'string' ? data : data.order_id;
  if (!orderId) return { success: false, error: 'Order ID is required.' };

  try {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'failed',
        failed_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      console.error('Record Payment Failure Error:', error);
      return { success: false, error: 'Failed to record payment failure status.' };
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('Record Payment Failure Exception:', error);
    return { success: false, error: 'An unexpected error occurred while recording failure.' };
  }
}

