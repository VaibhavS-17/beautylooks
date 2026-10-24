import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "@/components/layout/RootLayoutClient";
import { createPublicClient } from '@/lib/supabase/public';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0C0A09' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://beautylooksmumbai.com'),
  title: "Beauty Looks Mumbai | Premium Cosmetics & Skincare",
  description: "Simple • Genuine • Affordable. Mumbai's leading curated beauty marketplace for facial kits, serums, face masks, and premium cosmetics.",
  keywords: "beauty, cosmetics, facial kits, skincare, mumbai, natural beauty, serum, cleansers, face mask",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let categories: any[] = [];
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('created_at', { ascending: true });
    categories = data || [];
  } catch {
    categories = [];
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <head>
        {supabaseUrl && (
          <>
            <link rel="preconnect" href={supabaseUrl} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={supabaseUrl} />
          </>
        )}
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans">
        <RootLayoutClient categories={categories || []}>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
