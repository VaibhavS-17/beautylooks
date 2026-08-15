import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Beauty Looks Mumbai',
  description: 'Our privacy policy and data collection practices.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full min-h-screen bg-primary py-12 text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-display text-text-main mb-8">Privacy Policy</h1>
        <div className="prose prose-sm sm:prose-base text-text-muted">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested (for delivery services), delivery notes, and other information you choose to provide.</p>
          <h2>2. How We Use Your Information</h2>
          <p>We may use the information we collect about you to:</p>
          <ul>
            <li>Provide, maintain, and improve our Services.</li>
            <li>Perform internal operations.</li>
            <li>Send or facilitate communications between you and a delivery partner.</li>
            <li>Send you communications we think will be of interest to you.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
