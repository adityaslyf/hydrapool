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

      // Wait a bit for Privy user object to be fully populated
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const email = privyUser.email?.address;
        
        // Look for Solana wallet
        const solanaWallet = privyUser.linkedAccounts.find(
          (account) => account.type === 'wallet' && account.chainType === 'solana'
        );
        
        const walletAddress = (solanaWallet as { address?: string })?.address;

        // Try to get email from Google account if primary email is not available
        const googleAccount = privyUser.linkedAccounts.find(
          (account) => account.type === 'google_oauth'
        );
        const fallbackEmail = (googleAccount as { email?: string })?.email;

        if (!email && !fallbackEmail) {
          setLoading(false);
          return;
        }

        // Use email or fallback email
        const finalEmail = email || fallbackEmail;
        
        if (!finalEmail) {
          setLoading(false);
          return;
        }
        
        // Try to find existing user by email first
        let existingUser = await getUserByEmail(finalEmail);
        
        // If wallet is available now, check if we need to update a pending wallet
        if (walletAddress && existingUser && existingUser.wallet?.startsWith('pending_')) {
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
            console.error('Error updating user with wallet:', error);
          }
        }
        
        // If no wallet available yet but user is authenticated, 
        // still create/find user record with email
        if (!walletAddress) {
          if (existingUser) {
            setDbUser(existingUser);
          } else {
            // Create user with placeholder wallet, will update when wallet becomes available
            try {
              const newUser = await createUser({
                email: finalEmail,
                wallet: `pending_${Date.now()}`, // Temporary placeholder
                username: finalEmail.split('@')[0],
              });
              setDbUser(newUser);
            } catch (error) {
              console.error('Error creating user without wallet:', error);
            }
          }
          setLoading(false);
          return;
        }

        // Check if user exists by wallet address (since we already checked email above)
        if (!existingUser && walletAddress) {
          existingUser = await getUserByWallet(walletAddress);
        }

        if (existingUser) {
          setDbUser(existingUser);
        } else {
          // Create new user
          const newUser = await createUser({
            email: finalEmail,
            wallet: walletAddress,
            username: finalEmail.split('@')[0], // Use email prefix as default username
          });
          setDbUser(newUser);
        }
      } catch (error) {
        console.error('Error syncing user with database:', error);
      } finally {
        setLoading(false);
      }
    };

    syncUserWithDatabase();
  }, [ready, authenticated, privyUser]);

  // Get Solana wallet info only
  const solanaWallet = privyUser?.linkedAccounts.find(
    (account) => account.type === 'wallet' && account.chainType === 'solana'
  );

  return {
    // Privy auth state
    privyUser,
    ready,
    authenticated,
    login,
    logout,
    
    // Database user state
    user: dbUser,
    loading,
    
    // Solana wallet info
    walletAddress: (solanaWallet as { address?: string })?.address || null,
    hasWallet: !!solanaWallet,
    walletType: solanaWallet ? 'solana' : null,
    isSolanaWallet: !!solanaWallet,
  };
}
