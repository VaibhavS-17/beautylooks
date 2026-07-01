import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Beauty Looks Mumbai | Premium Cosmetics & Skincare",
  description: "Simple • Genuine • Affordable. Mumbai's leading curated beauty marketplace for facial kits, serums, face masks, and premium cosmetics.",
  keywords: "beauty, cosmetics, facial kits, skincare, mumbai, natural beauty, serum, cleansers, face mask",
};

import RootLayoutClient from "@/components/layout/RootLayoutClient";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-primary text-text-main font-sans">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
