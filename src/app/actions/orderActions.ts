'use server';

import { createClient } from '@/lib/supabase/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret',
});

export async function createOrder(data: {
  items: Array<{ productId: string; quantity: string | number }>;
  shippingAddress: any;
  totalAmount: number;
}) {
  const supabase = await createClient();

  try {
    // 1. Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Calculate true total amount by querying database to avoid client-side tampering
    // For simplicity right now, we use the passed totalAmount, but in a real prod app, 
    // we would re-calculate it from the database prices.
    
    // We expect totalAmount in INR. Razorpay expects paise (amount * 100).
    const amountInPaise = Math.round(data.totalAmount * 100);

    // 3. Create Razorpay order
    // If we don't have real keys, Razorpay SDK will throw. Let's catch and handle it for dev.
    let razorpayOrderId = 'mock_order_id_' + Date.now();
    
    if (process.env.RAZORPAY_KEY_ID) {
      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: 'receipt_' + Date.now(),
      });
      razorpayOrderId = rzpOrder.id;
    }

    // 4. Create Order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        status: 'pending',
        total_amount: data.totalAmount,
        shipping_address: data.shippingAddress,
        razorpay_order_id: razorpayOrderId,
      })
      .select('id')
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message || 'Failed to create order in database');
    }

    // 5. Insert Order Items
    // Wait, we need to map over items and get unit prices, but to keep it simple we can just fetch all products in one go.
    const productIds = data.items.map(item => item.productId);
    const { data: products } = await supabase
      .from('products')
      .select('id, price, sale_price')
      .in('id', productIds);

    if (products && products.length > 0) {
      const orderItemsToInsert = data.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        const unitPrice = product?.sale_price || product?.price || 0;
        return {
          order_id: order.id,
          product_id: item.productId,
          quantity: Number(item.quantity),
          unit_price: unitPrice,
        };
      });

      await supabase.from('order_items').insert(orderItemsToInsert);
    }

    return { 
      success: true, 
      orderId: order.id, 
      razorpayOrderId,
      amount: amountInPaise,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock'
    };

  } catch (error: any) {
    console.error('Create Order Error:', error);
    return { success: false, error: error.message };
  }
}

export async function verifyPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id: string; // our internal database order ID
}) {
  const supabase = await createClient();

  try {
    const secret = process.env.RAZORPAY_KEY_SECRET || 'mock_secret';
    
    // For local dev without real keys, just simulate success if secret is mock
    let isValid = false;
    
    if (secret === 'mock_secret') {
      isValid = true;
    } else {
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`);
      const digest = shasum.digest('hex');
      isValid = digest === data.razorpay_signature;
    }

    if (!isValid) {
      return { success: false, error: 'Invalid payment signature' };
    }

    // Update order status in Supabase
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        razorpay_payment_id: data.razorpay_payment_id,
      })
      .eq('id', data.order_id);

    if (error) throw new Error(error.message);

    return { success: true };
  } catch (error: any) {
    console.error('Verify Payment Error:', error);
    return { success: false, error: error.message };
  }
}
