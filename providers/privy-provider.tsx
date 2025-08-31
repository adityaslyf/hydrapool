'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!privyAppId) {
    throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not set');
  }

  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        wallets: {
          solana: true,
        },
        embeddedWallets: {
          createOnLogin: 'all-users',
          solana: {
            createOnLogin: 'all-users',
          },
        },
        solanaClusters: [
          {
            name: 'devnet',
            rpcUrl:
              process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
              'https://api.devnet.solana.com',
          },
        ],
        loginMethods: ['email', 'google'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          walletChainType: 'solana-only',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
