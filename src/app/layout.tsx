import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-manrope',
});

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://akautoshow.com'),
  title: {
    default: "AKAutoshow - The Ultimate Car Event Platform",
    template: "%s | AKAutoshow",
  },
  description: "Discover, register, and showcase at the best car events in Bahrain.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  openGraph: {
    title: "AKAutoshow",
    description: "The Ultimate Car Event Platform in Bahrain",
    url: 'https://akautoshow.com',
    siteName: "AKAutoshow",
    images: [
      {
        url: '/ak-autoshow-logo-new.png',
        width: 1200,
        height: 630,
        alt: 'AKAutoshow Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AKAutoshow',
    description: 'The Ultimate Car Event Platform in Bahrain',
    images: ['/ak-autoshow-logo-new.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans bg-background text-text-primary" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
