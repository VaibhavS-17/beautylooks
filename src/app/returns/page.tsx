import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Returns Policy | Beauty Looks Mumbai",
  description: "Information about returns and refunds for Beauty Looks Mumbai.",
};

export default function ReturnsPage() {
  return (
    <div className="w-full min-h-screen bg-primary py-12 text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-display text-text-main mb-8">Returns & Refunds</h1>
        <div className="prose prose-sm sm:prose-base text-text-muted">
          <p>We want you to be completely satisfied with your purchase from Beauty Looks Mumbai.</p>
          
          <h2>Returns</h2>
          <p>If you are not satisfied with your purchase, you may return it within 7 days of delivery. To be eligible for a return, your item must be unused, in the original packaging, and in the same condition that you received it.</p>
          
          <h2>Refunds</h2>
          <p>Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed and automatically applied to your original method of payment within 5-7 business days.</p>
          
          <h2>Non-Returnable Items</h2>
          <p>Certain types of items cannot be returned due to hygiene reasons, including opened skincare products, used cosmetics, and clearance items.</p>

          <h2>Need Help?</h2>
          <p>Contact our support team at hello@beautylooksmumbai.com for assistance with your return.</p>
        </div>
      </div>
    </div>
  );
}
