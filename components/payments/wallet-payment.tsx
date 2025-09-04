'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  CreditCard,
  Loader2,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Zap,
  Shield,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useSolana } from '@/hooks/use-solana';
import { WalletInfo } from '@/components/solana/wallet-info';
import type { PaymentRequest, SplitWithParticipants, User } from '@/types';

interface WalletPaymentProps {
  split: SplitWithParticipants;
  participant: {
    id: string;
    user_id: string;
    amount_owed: number;
    paid: boolean;
    payment_status: 'pending' | 'processing' | 'confirmed' | 'failed';
    payment_transaction_id?: string;
    paid_at?: string;
    user: User;
  };
  onPaymentSuccess: () => void;
}

export function WalletPayment({ split, participant, onPaymentSuccess }: WalletPaymentProps) {
  const { 
    sendPayment, 
    walletInfo, 
    isWalletConnected, 
    refreshBalances,
    error: walletError,
    isLoading: walletLoading 
  } = useSolana();
  
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  useEffect(() => {
    if (isWalletConnected()) {
      refreshBalances();
    }
  }, [isWalletConnected, refreshBalances]);

  const hasInsufficientBalance = () => {
    if (!walletInfo?.usdcBalance || !participant.amount_owed) return false;
    return walletInfo.usdcBalance < participant.amount_owed;
  };

  const getWalletConnectionStatus = () => {
    if (!isWalletConnected()) {
      return {
        status: 'disconnected',
        message: 'Please connect your Solana wallet to make payments',
        color: 'orange',
        icon: <Wallet className="h-4 w-4" />
      };
    }

    if (walletLoading) {
      return {
        status: 'loading',
        message: 'Loading wallet information...',
        color: 'blue',
        icon: <Loader2 className="h-4 w-4 animate-spin" />
      };
    }

    if (hasInsufficientBalance()) {
      return {
        status: 'insufficient',
        message: `Insufficient USDC balance. You need ${participant.amount_owed.toFixed(2)} USDC but have ${walletInfo?.usdcBalance?.toFixed(2) || '0.00'} USDC`,
        color: 'red',
        icon: <AlertCircle className="h-4 w-4" />
      };
    }

    return {
      status: 'ready',
      message: 'Wallet connected and ready for payment',
      color: 'green',
      icon: <CheckCircle className="h-4 w-4" />
    };
  };

  const handlePayment = async () => {
    if (!isWalletConnected() || participant.paid) return;

    const creatorWallet = split.creator?.wallet;
    if (!creatorWallet) {
      setError('Creator wallet address not found');
      return;
    }

    try {
      setPaymentLoading(true);
      setError(null);

      const paymentRequest: PaymentRequest = {
        amount: participant.amount_owed,
        recipient: creatorWallet,
        splitId: split.id,
        participantId: participant.id,
        currency: split.currency || 'USDC',
      };

      const result = await sendPayment(paymentRequest);

      if (result.success && result.signature) {
        // Update payment status in the database
        const updateResponse = await fetch(`/api/splits/${split.id}/payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participantId: participant.id,
            transactionSignature: result.signature,
            amount: participant.amount_owed,
          }),
        });

        if (updateResponse.ok) {
          setSuccess(true);
          setTransactionHash(result.signature);
          onPaymentSuccess();
        } else {
          throw new Error('Failed to update payment status');
        }
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
    } finally {
      setPaymentLoading(false);
    }
  };

  const walletStatus = getWalletConnectionStatus();

  if (participant.paid) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">Payment Completed</h3>
              <p className="text-sm text-green-700">
                You've successfully paid ${participant.amount_owed.toFixed(2)} USDC
              </p>
              {participant.payment_transaction_id && (
                <div className="mt-2">
                  <a
                    href={`https://explorer.solana.com/tx/${participant.payment_transaction_id}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:text-green-800 font-mono flex items-center gap-1"
                  >
                    {participant.payment_transaction_id.slice(0, 8)}...{participant.payment_transaction_id.slice(-8)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Payment Successful!</h3>
              <p className="text-sm text-green-700">
                Your payment of ${participant.amount_owed.toFixed(2)} USDC has been sent
              </p>
            </div>
            {transactionHash && (
              <div className="pt-2">
                <a
                  href={`https://explorer.solana.com/tx/${transactionHash}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:text-green-800 font-mono flex items-center justify-center gap-2"
                >
                  View Transaction
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Wallet Status */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5" />
            Wallet Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <Alert className={`border-${walletStatus.color}-200 bg-${walletStatus.color}-50`}>
            <div className="flex items-center gap-2">
              {walletStatus.icon}
              <AlertDescription className={`text-${walletStatus.color}-800`}>
                {walletStatus.message}
              </AlertDescription>
            </div>
          </Alert>

          {/* Wallet Info */}
          {isWalletConnected() && (
            <WalletInfo compact={true} showActions={true} />
          )}

          {/* Payment Error */}
          {(error || walletError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || walletError}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card className="border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
              <Badge variant="outline" className="bg-white">
                {split.currency || 'USDC'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Amount Due:</span>
                <div className="font-bold text-xl text-gray-900">
                  ${participant.amount_owed.toFixed(2)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Paying To:</span>
                <div className="font-medium text-gray-900">
                  {split.creator.username || split.creator.email?.split('@')[0] || 'Creator'}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                <Shield className="h-3 w-3" />
                <span>Secure payment via Solana blockchain</span>
              </div>

              <Button
                onClick={handlePayment}
                disabled={
                  paymentLoading || 
                  !isWalletConnected() || 
                  hasInsufficientBalance() ||
                  walletLoading
                }
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-medium"
                size="lg"
              >
                {paymentLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing Payment...
                  </div>
                ) : !isWalletConnected() ? (
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Connect Wallet First
                  </div>
                ) : hasInsufficientBalance() ? (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Insufficient Balance
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Pay ${participant.amount_owed.toFixed(2)} USDC
                  </div>
                )}
              </Button>

              <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-2">
                <Clock className="h-3 w-3" />
                <span>Payment typically confirms in 30-60 seconds</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
