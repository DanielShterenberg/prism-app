import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prism",
  description: "ASD Assessment Tool",
};

/**
 * Viewport configuration for iPad Safari optimization:
 * - maximum-scale=1 prevents auto-zoom on input focus (paired with font-size ≥ 16px)
 * - viewport-fit=cover enables env(safe-area-inset-*) for notch/home-bar on modern iPads
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
