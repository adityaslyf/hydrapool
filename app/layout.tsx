import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/providers/privy-provider';
import { ServiceWorkerRegistration } from '@/components/pwa/service-worker';
import { PWAInstallPrompt } from '@/components/pwa/install-prompt';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HydraPool - Solana Split Bills',
  description:
    'Split bills and expenses with friends using Solana USDC cryptocurrency. Secure, fast, and easy bill splitting on the blockchain.',
  keywords: [
    'Solana',
    'USDC',
    'Bill Splitting',
    'Cryptocurrency',
    'Web3',
    'Friends',
    'Expenses',
  ],
  authors: [{ name: 'HydraPool Team' }],
  creator: 'HydraPool',
  publisher: 'HydraPool',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HydraPool',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6366f1' },
    { media: '(prefers-color-scheme: dark)', color: '#4f46e5' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ServiceWorkerRegistration />
        <Providers>
          {children}
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
