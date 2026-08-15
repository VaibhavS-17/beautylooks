import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Beauty Looks Mumbai',
  description: 'Our terms and conditions of service.',
};

export default function TermsOfServicePage() {
  return (
    <div className="w-full min-h-screen bg-primary py-12 text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-display text-text-main mb-8">Terms of Service</h1>
        <div className="prose prose-sm sm:prose-base text-text-muted">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <h2>1. Terms</h2>
          <p>By accessing the website at Beauty Looks Mumbai, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
          <h2>2. Use License</h2>
          <p>Permission is granted to temporarily download one copy of the materials (information or software) on Beauty Looks Mumbai's website for personal, non-commercial transitory viewing only.</p>
          <h2>3. Disclaimer</h2>
          <p>The materials on Beauty Looks Mumbai's website are provided on an 'as is' basis. Beauty Looks Mumbai makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
        </div>
      </div>
    </div>
  );
}
