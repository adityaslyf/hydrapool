import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Providers from '@/providers/privy-provider';
import { PhantomWalletProvider } from '@/providers/phantom-wallet-provider';
import { ServiceWorkerRegistration } from '@/components/pwa/service-worker';
import { PWAInstallPrompt } from '@/components/pwa/install-prompt';

const satoshi = localFont({
  src: [
    {
      path: '../public/fonts/satoshi/WEB/fonts/Satoshi-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/satoshi/WEB/fonts/Satoshi-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/satoshi/WEB/fonts/Satoshi-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/satoshi/WEB/fonts/Satoshi-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/satoshi/WEB/fonts/Satoshi-Black.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-satoshi',
  display: 'swap',
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
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '144x144',
        url: '/icon-144.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '152x152',
        url: '/icon-152.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        url: '/icon-192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        url: '/icon-512.png',
      },
    ],
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
        className={`${satoshi.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ServiceWorkerRegistration />
        <Providers>
          <PhantomWalletProvider>
            {children}
            <PWAInstallPrompt />
          </PhantomWalletProvider>
        </Providers>
      </body>
    </html>
  );
}
