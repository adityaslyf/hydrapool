'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import type {
  SolanaWalletInfo,
  PaymentRequest,
  PaymentResponse,
  SolanaTransaction,
} from '@/types';
import {
  getSolBalance,
  getUsdcBalance,
  createUsdcTransferTransaction,
  confirmTransaction,
  isValidSolanaAddress,
} from '@/lib/solana';

interface UsePhantomWalletReturn {
  walletInfo: SolanaWalletInfo | null;
  isLoading: boolean;
  error: string | null;
  refreshBalances: () => Promise<void>;
  sendPayment: (request: PaymentRequest) => Promise<PaymentResponse>;
  getWalletAddress: () => string | null;
  isWalletConnected: () => boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

export function usePhantomWallet(): UsePhantomWalletReturn {
  const {
    publicKey,
    connected,
    connecting,
    disconnect,
    sendTransaction,
    wallet,
    connect,
  } = useWallet();
  const { connection } = useConnection();
  const [walletInfo, setWalletInfo] = useState<SolanaWalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastFetchTime = useRef<number>(0);
  const isCurrentlyFetching = useRef<boolean>(false);
  const CACHE_DURATION = 30000; // 30 seconds cache

  const getWalletAddress = useCallback((): string | null => {
    return publicKey?.toBase58() || null;
  }, [publicKey]);

  const isWalletConnected = useCallback((): boolean => {
    return connected && !!publicKey;
  }, [connected, publicKey]);

  const connectWallet = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      if (wallet) {
        await connect();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      throw err;
    }
  }, [connect, wallet]);

  const disconnectWallet = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await disconnect();
      setWalletInfo(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to disconnect wallet';
      setError(errorMessage);
      throw err;
    }
  }, [disconnect]);

  const refreshBalances = useCallback(async (): Promise<void> => {
    const walletAddress = getWalletAddress();
    if (!walletAddress || !isValidSolanaAddress(walletAddress)) {
      setWalletInfo(null);
      return;
    }

    const now = Date.now();
    if (
      isCurrentlyFetching.current ||
      (now - lastFetchTime.current < CACHE_DURATION &&
        walletInfo?.address === walletAddress)
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
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch wallet balances';
      setError(errorMessage);
      setWalletInfo((prev: SolanaWalletInfo | null) =>
        prev
          ? {
              ...prev,
              address: walletAddress,
              isConnected: true,
            }
          : {
              address: walletAddress,
              balance: undefined,
              usdcBalance: undefined,
              isConnected: true,
            },
      );
    } finally {
      setIsLoading(false);
      isCurrentlyFetching.current = false;
    }
  }, [getWalletAddress, walletInfo?.address, CACHE_DURATION]);

  const sendPayment = useCallback(
    async (request: PaymentRequest): Promise<PaymentResponse> => {
      const walletAddress = getWalletAddress();
      if (!walletAddress || !publicKey) {
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

        // Check balance
        const currentBalance = await getUsdcBalance(walletAddress);
        if (currentBalance < request.amount) {
          return {
            success: false,
            error: `Insufficient USDC balance. You have ${currentBalance.toFixed(2)} USDC but need ${request.amount.toFixed(2)} USDC`,
          };
        }

        // Create transaction
        const transaction = await createUsdcTransferTransaction(
          walletAddress,
          request.recipient,
          request.amount,
        );

        // Send transaction using Phantom wallet
        const signature = await sendTransaction(transaction, connection);

        if (!signature) {
          return {
            success: false,
            error: 'Transaction failed - no signature returned',
          };
        }

        const solanaTransaction: SolanaTransaction = {
          signature: signature,
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
            await confirmTransaction(signature);
          } catch (err) {
            console.error('Transaction confirmation failed:', err);
          }
        }, 1000);

        // Refresh balances after some delay
        setTimeout(() => {
          refreshBalances();
        }, 2000);

        return {
          success: true,
          signature: signature,
          transaction: solanaTransaction,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Payment failed';
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [getWalletAddress, publicKey, sendTransaction, connection, refreshBalances],
  );

  // Update wallet info when connection changes
  useEffect(() => {
    if (!connected || !publicKey) {
      setWalletInfo(null);
      return;
    }

    const address = publicKey.toBase58();
    setWalletInfo((prev: SolanaWalletInfo | null) => {
      if (prev?.address === address && prev.balance !== undefined) {
        return prev;
      }
      return {
        address,
        balance: undefined,
        usdcBalance: undefined,
        isConnected: true,
      };
    });
  }, [connected, publicKey]);

  // Auto-refresh balances when wallet connects
  useEffect(() => {
    if (isWalletConnected()) {
      refreshBalances();
    }
  }, [isWalletConnected, refreshBalances]);

  return {
    walletInfo,
    isLoading,
    error,
    refreshBalances,
    sendPayment,
    getWalletAddress,
    isWalletConnected,
    connectWallet,
    disconnectWallet,
  };
}
