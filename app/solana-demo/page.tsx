'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Coins, TestTube, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletInfo } from '@/components/solana/wallet-info';
import { PaymentDemo } from '@/components/solana/payment-demo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SolanaDemoPage() {
  const router = useRouter();
  const [paymentHistory, setPaymentHistory] = useState<string[]>([]);

  const handlePaymentSuccess = (signature: string) => {
    setPaymentHistory(prev => [signature, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Coins className="h-8 w-8" />
            Solana Payment Demo
          </h1>
          <p className="text-muted-foreground">
            Test USDC payments on Solana Devnet
          </p>
        </div>

        {/* Instructions */}
        <Alert>
          <TestTube className="h-4 w-4" />
          <AlertTitle>Demo Instructions</AlertTitle>
          <AlertDescription className="space-y-2">
            <div>1. Make sure you have a Solana wallet connected through Privy</div>
            <div>2. Get test USDC from a Solana faucet (links below)</div>
            <div>3. Use this demo to test sending USDC payments</div>
            <div>4. All transactions happen on Devnet (no real money)</div>
          </AlertDescription>
        </Alert>

        {/* Faucet Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Get Test Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              You'll need SOL for transaction fees and USDC for payments:
            </div>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://faucet.solana.com/', '_blank')}
              >
                Get SOL (Transaction Fees)
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://spl-token-faucet.com/?token-name=USDC-Dev', '_blank')}
              >
                Get Test USDC
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Note: These are test tokens with no real value
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wallet Information */}
          <div>
            <WalletInfo showActions={true} />
          </div>

          {/* Payment Demo */}
          <div>
            <PaymentDemo 
              defaultAmount={1.0}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </div>
        </div>

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {paymentHistory.slice(0, 5).map((signature, index) => (
                  <div 
                    key={signature}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded"
                  >
                    <span className="font-mono text-sm">
                      {signature.slice(0, 20)}...{signature.slice(-20)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(
                        `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
                        '_blank'
                      )}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Technical Info */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Network:</strong> Solana Devnet
              </div>
              <div>
                <strong>Token:</strong> USDC (Dev)
              </div>
              <div>
                <strong>RPC:</strong> https://api.devnet.solana.com
              </div>
              <div>
                <strong>Transaction Fees:</strong> ~0.000005 SOL
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground mt-4 space-y-1">
              <div>• Payments use SPL Token transfers</div>
              <div>• Token accounts are created automatically if needed</div>
              <div>• All transactions are confirmed before updating the database</div>
              <div>• View transactions on Solana Explorer using the links above</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
