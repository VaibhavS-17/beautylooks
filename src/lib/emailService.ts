'use server';

import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';

// ─────────────────────────────────────────────────────────────
// Resend Client
// ─────────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

const BATCH_SIZE = 50; // Resend batch limit per call
const MAX_RETRIES = 3;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://beautylooksmumbai.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Beauty Looks <onboarding@resend.dev>';

// ─────────────────────────────────────────────────────────────
// Product shape coming from the admin update action
// ─────────────────────────────────────────────────────────────
interface RestockProduct {
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: string[];
}

// ─────────────────────────────────────────────────────────────
// Core: Process all pending subscribers for a restocked product
// ─────────────────────────────────────────────────────────────
export async function processRestockNotifications(
  productId: string,
  product: RestockProduct,
) {
  try {
    const supabase = await createClient();

    // 1. Fetch all pending subscribers for this product
    const { data: subscribers, error: fetchError } = await supabase
      .from('restock_notifications')
      .select('id, email')
      .eq('product_id', productId)
      .eq('status', 'pending');

    if (fetchError) {
      console.error('[EmailService] Error fetching subscribers:', fetchError.message);
      return;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log('[EmailService] No pending subscribers for product:', productId);
      return;
    }

    console.log(`[EmailService] Sending ${subscribers.length} restock notifications for "${product.name}"`);

    // 2. Process in batches to stay within Resend limits
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);

      const emailPayloads = batch.map((sub) => ({
        from: FROM_EMAIL,
        to: [sub.email],
        subject: `🎉 ${product.name} is Back In Stock!`,
        html: generateRestockEmailTemplate(product),
      }));

      // 3. Send with retry logic
      let success = false;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const { error: sendError } = await resend.batch.send(emailPayloads);
          if (sendError) {
            console.error(`[EmailService] Batch send error (attempt ${attempt}):`, sendError);
            if (attempt < MAX_RETRIES) {
              await delay(attempt * 1000); // Exponential backoff
              continue;
            }
          } else {
            success = true;
            break;
          }
        } catch (err) {
          console.error(`[EmailService] Network error (attempt ${attempt}):`, err);
          if (attempt < MAX_RETRIES) {
            await delay(attempt * 1000);
          }
        }
      }

      // 4. Mark as sent on success
      if (success) {
        const batchIds = batch.map((s) => s.id);
        const { error: updateError } = await supabase
          .from('restock_notifications')
          .update({ status: 'sent' })
          .in('id', batchIds);

        if (updateError) {
          console.error('[EmailService] Error marking notifications as sent:', updateError.message);
        }
      }
    }

    console.log(`[EmailService] Finished processing restock notifications for "${product.name}"`);
  } catch (err) {
    console.error('[EmailService] Unexpected error in processRestockNotifications:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// HTML Email Template
// ─────────────────────────────────────────────────────────────
function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateRestockEmailTemplate(product: RestockProduct): string {
  const safeName = escapeHtml(product.name);
  const productUrl = `${APP_URL}/products/${product.slug}`;
  const price = product.salePrice ?? product.price;
  const originalPrice = product.salePrice ? product.price : null;
  const imageUrl = product.images?.[0] || `${APP_URL}/images/products/facial-kit-1.png`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeName} is Back In Stock!</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f3ee; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f3ee;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a1a; padding:28px 32px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:2px; font-family:Georgia,'Times New Roman',serif;">
                BEAUTY LOOKS
              </h1>
              <p style="margin:4px 0 0; color:#ca8a04; font-size:11px; letter-spacing:3px; text-transform:uppercase;">MUMBAI</p>
            </td>
          </tr>

          <!-- Announcement Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#ca8a04 0%,#eab308 100%); padding:16px 32px; text-align:center;">
              <p style="margin:0; color:#ffffff; font-size:14px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;">
                🎉 Great News — It's Back!
              </p>
            </td>
          </tr>

          <!-- Product Image -->
          <tr>
            <td style="padding:32px 32px 16px; text-align:center;">
              <img
                src="${imageUrl}"
                alt="${safeName}"
                width="240"
                style="display:block; margin:0 auto; border-radius:12px; max-width:100%; height:auto;"
              />
            </td>
          </tr>

          <!-- Product Details -->
          <tr>
            <td style="padding:0 32px 24px; text-align:center;">
              <h2 style="margin:0 0 8px; color:#1a1a1a; font-size:20px; font-weight:700; font-family:Georgia,'Times New Roman',serif;">
                ${safeName}
              </h2>
              <p style="margin:0; font-size:24px; font-weight:800; color:#1a1a1a;">
                ₹${price.toLocaleString('en-IN')}
                ${originalPrice ? `<span style="font-size:14px; color:#999; text-decoration:line-through; margin-left:8px;">₹${originalPrice.toLocaleString('en-IN')}</span>` : ''}
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 32px 32px; text-align:center;">
              <a
                href="${productUrl}"
                style="display:inline-block; padding:14px 40px; background-color:#1a1a1a; color:#ffffff; text-decoration:none; border-radius:10px; font-size:13px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;"
              >
                SHOP NOW
              </a>
            </td>
          </tr>

          <!-- Urgency Note -->
          <tr>
            <td style="padding:0 32px 24px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#888; font-style:italic;">
                Hurry — limited stock available. This item sold out quickly last time.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fafaf8; padding:20px 32px; text-align:center; border-top:1px solid #eee;">
              <p style="margin:0; font-size:11px; color:#aaa; line-height:1.6;">
                You received this email because you signed up for a restock notification.<br />
                &copy; ${new Date().getFullYear()} Beauty Looks Mumbai. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ─────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
