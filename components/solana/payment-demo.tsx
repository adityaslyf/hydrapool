'use client';

import { useState, useEffect, useCallback } from 'react';
import { Send, ArrowRight, CheckCircle, X, RefreshCw } from 'lucide-react';
import { useSolana } from '@/hooks/use-solana';
import { formatWalletAddress } from '@/lib/solana';
import type { PaymentRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentDemoProps {
  defaultRecipient?: string;
  defaultAmount?: number;
  onPaymentSuccess?: (signature: string) => void;
}

export function PaymentDemo({ 
  defaultRecipient = '', 
  defaultAmount = 1.0,
  onPaymentSuccess 
}: PaymentDemoProps) {
  const { walletInfo, sendPayment, isLoading, refreshBalances } = useSolana();
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [amount, setAmount] = useState(defaultAmount.toString());
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    signature?: string;
    error?: string;
  } | null>(null);

  // Stable refresh function
  const handleRefresh = useCallback(() => {
    refreshBalances();
  }, [refreshBalances]);

  // Auto-refresh balances when component mounts if not loaded
  useEffect(() => {
    if (walletInfo?.isConnected && walletInfo.usdcBalance === undefined) {
      const timeoutId = setTimeout(() => {
        handleRefresh();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [walletInfo?.isConnected, walletInfo?.usdcBalance, handleRefresh]);

  const handlePayment = async () => {
    if (!recipient || !amount) return;

    const paymentRequest: PaymentRequest = {
      amount: parseFloat(amount),
      recipient,
      splitId: 'demo-split',
      participantId: 'demo-participant',
      currency: 'USDC',
    };

    setPaymentResult(null);
    const result = await sendPayment(paymentRequest);
    setPaymentResult(result);

    if (result.success && result.signature) {
      onPaymentSuccess?.(result.signature);
    }
  };

  const isValidAmount = amount && parseFloat(amount) > 0;
  const hasInsufficientBalance = walletInfo && walletInfo.usdcBalance !== undefined && parseFloat(amount) > walletInfo.usdcBalance;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send USDC Payment
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Wallet Info */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">From Wallet</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshBalances}
              disabled={isLoading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="font-mono text-sm">
            {walletInfo?.address ? formatWalletAddress(walletInfo.address) : 'Not connected'}
          </div>
          <div className="text-sm font-semibold">
            Available: {walletInfo?.usdcBalance !== undefined ? walletInfo.usdcBalance.toFixed(2) : 
                       isLoading ? 'Loading...' : '--'} USDC
          </div>
        </div>

        {/* Recipient */}
        <div>
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            placeholder="Enter Solana wallet address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="font-mono text-sm"
          />
        </div>

        {/* Amount */}
        <div>
          <Label htmlFor="amount">Amount (USDC)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {hasInsufficientBalance && (
            <div className="text-sm text-red-600 mt-1">
              Insufficient balance. You need {parseFloat(amount).toFixed(2)} USDC but only have {walletInfo?.usdcBalance !== undefined ? walletInfo.usdcBalance.toFixed(2) : '0.00'} USDC.
            </div>
          )}
        </div>

        {/* Transaction Preview */}
        {recipient && isValidAmount && (
          <div className="p-3 border rounded-lg">
            <div className="text-sm font-medium mb-2">Transaction Preview</div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-mono">
                {walletInfo?.address ? formatWalletAddress(walletInfo.address) : 'You'}
              </span>
              <ArrowRight className="h-4 w-4" />
              <span className="font-mono">
                {formatWalletAddress(recipient)}
              </span>
            </div>
            <div className="text-lg font-semibold mt-2">
              {parseFloat(amount).toFixed(2)} USDC
            </div>
          </div>
        )}

        {/* Payment Result */}
        {paymentResult && (
          <Alert variant={paymentResult.success ? 'default' : 'destructive'}>
            {paymentResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <AlertDescription>
              {paymentResult.success ? (
                <div>
                  <div className="font-semibold">Payment Sent Successfully!</div>
                  <div className="text-sm mt-1">
                    Transaction: <code className="text-xs">{paymentResult.signature}</code>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    The transaction is being confirmed on the Solana network.
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-semibold">Payment Failed</div>
                  <div className="text-sm">{paymentResult.error}</div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Send Button */}
        <Button
          onClick={handlePayment}
          disabled={
            !recipient || 
            !isValidAmount || 
            hasInsufficientBalance || 
            isLoading || 
            !walletInfo?.isConnected ||
            walletInfo?.usdcBalance === undefined // Disable if balance not loaded
          }
          className="w-full"
        >
          {isLoading ? (
            'Sending...'
          ) : hasInsufficientBalance ? (
            'Insufficient Balance'
          ) : !walletInfo?.isConnected ? (
            'Wallet Not Connected'
          ) : walletInfo?.usdcBalance === undefined ? (
            'Loading Balance...'
          ) : (
            `Send ${amount || '0'} USDC`
          )}
        </Button>

        {/* Helper Text */}
        <div className="text-xs text-muted-foreground">
          <div>• This demo uses Solana Devnet</div>
          <div>• You can get test USDC from a Solana faucet</div>
          <div>• Transactions are free on Devnet</div>
        </div>
      </CardContent>
    </Card>
  );
}
