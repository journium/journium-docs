import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RootProvider } from 'fumadocs-ui/provider/next';
import CustomSearchDialog from "@/components/ui/search";
import { AISearch } from "@/components/ai/ai-search";
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',

});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Journium Documentation',
    template: '%s | Journium',
  },
  description: "Documentation for Journium — a product analytics tool and developer analytics SDK for React, Next.js, and JavaScript. Learn how to get automated product insights without dashboards or data analysts.",
  keywords: [
    'developer analytics SDK',
    'analytics SDK for React',
    'analytics SDK for NextJS',
    'in-app analytics for developers',
    'AI product analytics',
    'automated product insights',
    'product analytics tool',
    'serverless analytics',
    'privacy-friendly analytics tool',
    'actionable product insights',
    'telemetry',
    'observability',
    'developer tools',
  ],
  authors: [{ name: 'Journium' }],
  creator: 'Journium',
  publisher: 'Journium',
  icons: {
    icon: [
      {
        url: '/images/favicon-light.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/images/favicon-dark.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/favicon.ico',
        // Fallback for browsers that don't support media queries
      },
    ],
    apple: [
      {
        url: '/images/favicon-light.png',
        // Apple devices will use this
      },
    ],
  },
  metadataBase: new URL('https://journium.app'),
  alternates: {
    canonical: '/docs',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Makes viewport resize when keyboard appears on Android/Chrome
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AISearch>
          <RootProvider 
            search={{
              SearchDialog: CustomSearchDialog,
            }}
          >
            {children}
          </RootProvider>
        </AISearch>
        <Analytics />
      </body>
    </html>
  );
}
