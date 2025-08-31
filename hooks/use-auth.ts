'use client';

import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { createUser, getUserByEmail, getUserByWallet } from '@/lib/auth-utils';
import type { User } from '@prisma/client';

export function useAuth() {
  const { user: privyUser, ready, authenticated } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUserWithDatabase = async () => {
      if (!ready) return;

      setLoading(true);

      if (!authenticated || !privyUser) {
        setDbUser(null);
        setLoading(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        const email = privyUser.email?.address;

        const solanaWallet = privyUser.linkedAccounts.find(
          (account) =>
            account.type === 'wallet' && account.chainType === 'solana',
        );

        const walletAddress = (solanaWallet as { address?: string })?.address;

        const googleAccount = privyUser.linkedAccounts.find(
          (account) => account.type === 'google_oauth',
        );
        const fallbackEmail = (googleAccount as { email?: string })?.email;

        if (!email && !fallbackEmail) {
          setLoading(false);
          return;
        }

        const finalEmail = email || fallbackEmail;

        if (!finalEmail) {
          setLoading(false);
          return;
        }

        let existingUser = await getUserByEmail(finalEmail);

        if (
          walletAddress &&
          existingUser &&
          existingUser.wallet?.startsWith('pending_')
        ) {
          try {
            const updatedUser = await createUser({
              email: finalEmail,
              wallet: walletAddress,
              username: existingUser.username || finalEmail.split('@')[0],
            });
            setDbUser(updatedUser);
            setLoading(false);
            return;
          } catch (error) {
          }
        }

        if (!walletAddress) {
          if (existingUser) {
            setDbUser(existingUser);
          } else {
            try {
              const newUser = await createUser({
                email: finalEmail,
                wallet: `pending_${Date.now()}`, // Temporary placeholder
                username: finalEmail.split('@')[0],
              });
              setDbUser(newUser);
            } catch (error) {
            }
          }
          setLoading(false);
          return;
        }

        if (!existingUser && walletAddress) {
          existingUser = await getUserByWallet(walletAddress);
        }

        if (existingUser) {
          setDbUser(existingUser);
        } else {
          const newUser = await createUser({
            email: finalEmail,
            wallet: walletAddress,
            username: finalEmail.split('@')[0], // Use email prefix as default username
          });
          setDbUser(newUser);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    syncUserWithDatabase();
  }, [ready, authenticated, privyUser]);

  const solanaWallet = privyUser?.linkedAccounts.find(
    (account) => account.type === 'wallet' && account.chainType === 'solana',
  );

  return {
    privyUser,
    ready,
    authenticated,
    login,
    logout,

    user: dbUser,
    loading,

    walletAddress: (solanaWallet as { address?: string })?.address || null,
    hasWallet: !!solanaWallet,
    walletType: solanaWallet ? 'solana' : null,
    isSolanaWallet: !!solanaWallet,
  };
}
