'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets, useSendTransaction } from '@privy-io/react-auth/solana';
import { PublicKey, Transaction } from '@solana/web3.js';
import type { 
  SolanaWalletInfo, 
  PaymentRequest, 
  PaymentResponse, 
  SolanaTransaction 
} from '@/types';
import {
  getSolBalance,
  getUsdcBalance,
  createUsdcTransferTransaction,
  confirmTransaction,
  isValidSolanaAddress,
  createSolanaConnection,
} from '@/lib/solana';

interface UseSolanaReturn {
  walletInfo: SolanaWalletInfo | null;
  isLoading: boolean;
  error: string | null;
  refreshBalances: () => Promise<void>;
  sendPayment: (request: PaymentRequest) => Promise<PaymentResponse>;
  getWalletAddress: () => string | null;
  isWalletConnected: () => boolean;
}

export function useSolana(): UseSolanaReturn {
  const { user, createWallet } = usePrivy();
  const { wallets } = useSolanaWallets();
  const { sendTransaction } = useSendTransaction();
  const [walletInfo, setWalletInfo] = useState<SolanaWalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add refs to prevent excessive calls
  const lastFetchTime = useRef<number>(0);
  const isCurrentlyFetching = useRef<boolean>(false);
  const CACHE_DURATION = 30000; // 30 seconds cache

  // Get the user's Solana wallet address
  const getWalletAddress = useCallback((): string | null => {
    // Use the Privy Solana wallets hook - much cleaner!
    return wallets[0]?.address || null;
  }, [wallets]);

  // Check if wallet is connected
  const isWalletConnected = useCallback((): boolean => {
    const address = getWalletAddress();
    return !!(address && isValidSolanaAddress(address));
  }, [getWalletAddress]);

  // Refresh wallet balances with caching
  const refreshBalances = useCallback(async (): Promise<void> => {
    const walletAddress = getWalletAddress();
    if (!walletAddress || !isValidSolanaAddress(walletAddress)) {
      setWalletInfo(null);
      return;
    }

    // Check if we should skip due to caching or ongoing fetch
    const now = Date.now();
    if (
      isCurrentlyFetching.current || 
      (now - lastFetchTime.current < CACHE_DURATION && walletInfo?.address === walletAddress)
    ) {
      return;
    }

    isCurrentlyFetching.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const [solBalance, usdcBalance] = await Promise.all([
        getSolBalance(walletAddress),
        getUsdcBalance(walletAddress),
      ]);

      setWalletInfo({
        address: walletAddress,
        balance: solBalance,
        usdcBalance,
        isConnected: true,
      });
      
      lastFetchTime.current = now;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wallet balances';
      setError(errorMessage);
      // Preserve existing balances on error
      setWalletInfo((prev: SolanaWalletInfo | null) => prev ? {
        ...prev,
        address: walletAddress,
        isConnected: true,
      } : {
        address: walletAddress,
        balance: undefined,
        usdcBalance: undefined,
        isConnected: true,
      });
    } finally {
      setIsLoading(false);
      isCurrentlyFetching.current = false;
    }
  }, [getWalletAddress, walletInfo?.address, CACHE_DURATION]);

  // Send USDC payment
  const sendPayment = useCallback(async (request: PaymentRequest): Promise<PaymentResponse> => {
    const walletAddress = getWalletAddress();
    if (!walletAddress) {
      return {
        success: false,
        error: 'Wallet not connected',
      };
    }

    if (!isValidSolanaAddress(request.recipient)) {
      return {
        success: false,
        error: 'Invalid recipient address',
      };
    }

    if (request.amount <= 0) {
      return {
        success: false,
        error: 'Invalid amount',
      };
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check USDC balance
      const currentBalance = await getUsdcBalance(walletAddress);
      if (currentBalance < request.amount) {
        return {
          success: false,
          error: `Insufficient USDC balance. You have ${currentBalance.toFixed(2)} USDC but need ${request.amount.toFixed(2)} USDC`,
        };
      }

      // Create the transaction
      const transaction = await createUsdcTransferTransaction(
        walletAddress,
        request.recipient,
        request.amount
      );

      // Send transaction using Privy's Solana-specific method
      const connection = createSolanaConnection();
      const result = await sendTransaction({
        transaction,
        connection,
      });

      if (!result || !result.signature) {
        return {
          success: false,
          error: 'Transaction failed - no signature returned',
        };
      }

      // Create transaction record
      const solanaTransaction: SolanaTransaction = {
        signature: result.signature,
        status: 'pending',
        amount: request.amount,
        from: walletAddress,
        to: request.recipient,
        currency: request.currency,
        timestamp: new Date(),
        splitId: request.splitId,
        participantId: request.participantId,
      };

      // Confirm transaction in background
      setTimeout(async () => {
        try {
          await confirmTransaction(result.signature);
        } catch (err) {
          // Silent confirmation error handling
        }
      }, 1000);

      // Refresh balances after successful transaction
      setTimeout(() => {
        refreshBalances();
      }, 2000);

      return {
        success: true,
        signature: result.signature,
        transaction: solanaTransaction,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [getWalletAddress, sendTransaction, refreshBalances]);

    // Initialize wallet info when wallets change - simplified with Privy Solana hooks
  useEffect(() => {
    if (wallets.length === 0) {
      setWalletInfo(null);
      return;
    }

    const primaryWallet = wallets[0];
    const address = primaryWallet.address;

    setWalletInfo((prev: SolanaWalletInfo | null) => {
      // If it's the same address and we already have balance data, preserve it
      if (prev?.address === address && prev.balance !== undefined) {
        return prev;
      }
      // Set up new wallet info
      return {
        address,
        balance: undefined,
        usdcBalance: undefined,
        isConnected: true,
      };
    });
  }, [wallets]);

  return {
    walletInfo,
    isLoading,
    error,
    refreshBalances,
    sendPayment,
    getWalletAddress,
    isWalletConnected,
  };
}
