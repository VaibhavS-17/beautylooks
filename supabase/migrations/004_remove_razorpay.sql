-- Drop Razorpay columns from the orders table
ALTER TABLE orders 
DROP COLUMN IF EXISTS razorpay_order_id,
DROP COLUMN IF EXISTS razorpay_payment_id;
