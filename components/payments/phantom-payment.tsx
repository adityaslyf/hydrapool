'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
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
  Smartphone,
  Info,
  QrCode,
  Scan,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { usePhantomWallet } from '@/hooks/use-phantom-wallet';
import { detectPWAContext, openWalletApp } from '@/lib/pwa-utils';
import { USDC_MINT_ADDRESS, usdcToSmallestUnit } from '@/lib/solana';
import type { PaymentRequest, SplitWithParticipants, User } from '@/types';

interface PhantomPaymentProps {
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

export function PhantomPayment({
  split,
  participant,
  onPaymentSuccess,
}: PhantomPaymentProps) {
  const { connected, publicKey } = useWallet();
  const {
    sendPayment,
    walletInfo,
    isWalletConnected,
    refreshBalances,
    error: walletError,
    isLoading: walletLoading,
  } = usePhantomWallet();

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [pwaInfo] = useState(detectPWAContext());
  const [showQRCode, setShowQRCode] = useState(false);
  const [transactionData, setTransactionData] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

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
        message: 'Please connect your Phantom wallet to make payments',
        color: 'orange',
        icon: <Wallet className="h-4 w-4" />,
      };
    }

    if (walletLoading) {
      return {
        status: 'loading',
        message: 'Loading wallet information...',
        color: 'blue',
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
      };
    }

    if (hasInsufficientBalance()) {
      return {
        status: 'insufficient',
        message: `Insufficient USDC balance. You need ${participant.amount_owed.toFixed(2)} USDC but have ${walletInfo?.usdcBalance?.toFixed(2) || '0.00'} USDC`,
        color: 'red',
        icon: <AlertCircle className="h-4 w-4" />,
      };
    }

    return {
      status: 'ready',
      message: 'Phantom wallet connected and ready for payment',
      color: 'green',
      icon: <CheckCircle className="h-4 w-4" />,
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
      const errorMessage =
        err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
    } finally {
      setPaymentLoading(false);
    }
  };

  const generateTransactionQR = async () => {
    if (!split.creator?.wallet || participant.paid) return;

    try {
      setPaymentLoading(true);

      // Create Solana Pay URL with transaction details
      const amount = participant.amount_owed;
      const amountInSmallestUnit = usdcToSmallestUnit(amount); // Convert to micro USDC
      const recipient = split.creator.wallet;
      const memo = `HydraPool: ${split.title}`;
      const tokenMint = USDC_MINT_ADDRESS.toBase58();

      // Try standard Solana Pay format (recommended)
      const solanaPayUrl = `solana:${recipient}?amount=${amountInSmallestUnit}&spl-token=${tokenMint}&memo=${encodeURIComponent(memo)}`;

      console.log('Generated Solana Pay URL:', solanaPayUrl);
      console.log('Amount in USDC:', amount);
      console.log('Amount in smallest unit:', amountInSmallestUnit);
      console.log('Token mint:', tokenMint);

      // Create QR code URL using qr-server.com API
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(solanaPayUrl)}`;

      setTransactionData(solanaPayUrl);
      setQrCodeUrl(qrCodeUrl);
      setShowQRCode(true);
    } catch (err) {
      console.error('QR generation error:', err);
      setError('Failed to generate transaction QR code');
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
              <h3 className="font-semibold text-green-900">
                Payment Completed
              </h3>
              <p className="text-sm text-green-700">
                You've successfully paid ${participant.amount_owed.toFixed(2)}{' '}
                USDC
              </p>
              {participant.payment_transaction_id && (
                <div className="mt-2">
                  <a
                    href={`https://explorer.solana.com/tx/${participant.payment_transaction_id}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:text-green-800 font-mono flex items-center gap-1"
                  >
                    {participant.payment_transaction_id.slice(0, 8)}...
                    {participant.payment_transaction_id.slice(-8)}
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
              <h3 className="text-lg font-semibold text-green-900">
                Payment Successful!
              </h3>
              <p className="text-sm text-green-700">
                Your payment of ${participant.amount_owed.toFixed(2)} USDC has
                been sent via Phantom
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
            <div className="flex items-center gap-2">
              <span className="text-lg">👻</span>
              Phantom Wallet Payment
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <Alert
            className={`border-${walletStatus.color}-200 bg-${walletStatus.color}-50`}
          >
            <div className="flex items-center gap-2">
              {walletStatus.icon}
              <AlertDescription className={`text-${walletStatus.color}-800`}>
                {walletStatus.message}
              </AlertDescription>
            </div>
          </Alert>

          {/* Wallet Connection */}
          {!isWalletConnected() && (
            <div className="space-y-3">
              {pwaInfo.isPWA && pwaInfo.isMobile ? (
                <div className="space-y-3">
                  <Alert className="border-blue-200 bg-blue-50">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <div className="space-y-2">
                        <p className="font-medium">Mobile PWA Detected</p>
                        <p className="text-sm">
                          Generate a QR code to complete payment with your
                          mobile wallet app.
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {!showQRCode ? (
                    <div className="grid gap-2">
                      <Button
                        onClick={generateTransactionQR}
                        disabled={paymentLoading || !split.creator?.wallet}
                        className="bg-purple-600 hover:bg-purple-700 h-12"
                        size="lg"
                      >
                        {paymentLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating QR Code...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            Generate Payment QR Code
                          </div>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() =>
                          window.open(
                            pwaInfo.platform === 'ios'
                              ? 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977'
                              : 'https://play.google.com/store/apps/details?id=app.phantom',
                            '_blank',
                          )
                        }
                        className="h-10"
                      >
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Install Phantom App
                        </div>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* QR Code Display */}
                      <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 text-center">
                        {qrCodeUrl ? (
                          <div className="space-y-4">
                            <img
                              src={qrCodeUrl}
                              alt="Payment QR Code"
                              className="mx-auto w-72 h-72 border border-gray-200 rounded-lg"
                            />
                            <div className="space-y-2">
                              <p className="font-semibold text-gray-900">
                                Scan with Phantom Mobile App
                              </p>
                              <p className="text-sm text-gray-600">
                                Payment: ${participant.amount_owed.toFixed(2)}{' '}
                                USDC
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                          </div>
                        )}
                      </div>

                      {/* Instructions */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-3 text-sm">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              1
                            </div>
                            <p className="text-gray-700">
                              Open your Phantom mobile app and ensure you're on{' '}
                              <strong>devnet</strong>
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              2
                            </div>
                            <p className="text-gray-700">
                              Tap the <strong>scan QR</strong> icon (camera
                              icon) in the top right
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              3
                            </div>
                            <p className="text-gray-700">
                              Scan this QR code - it should open the transfer
                              screen with details pre-filled
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              4
                            </div>
                            <p className="text-gray-700">
                              Review the transaction details and confirm to send
                              the payment
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                          <p className="text-xs text-blue-800">
                            <strong>Troubleshooting:</strong> If QR code doesn't work:
                            <br />• Make sure Phantom app is set to <strong>devnet</strong>
                            <br />• Try the "Test" button to open the link directly
                            <br />• Try the alternative format buttons below
                            <br />• Check browser console for debugging info
                          </p>
                        </div>
                      </div>

                      {/* QR Actions */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant="outline"
                            onClick={async () => {
                              if (transactionData) {
                                try {
                                  await navigator.clipboard.writeText(
                                    transactionData,
                                  );
                                  // Could add a toast notification here
                                } catch (err) {
                                  // Fallback for older browsers
                                  const textArea =
                                    document.createElement('textarea');
                                  textArea.value = transactionData;
                                  document.body.appendChild(textArea);
                                  textArea.select();
                                  document.execCommand('copy');
                                  document.body.removeChild(textArea);
                                }
                              }
                            }}
                            className="h-10 text-sm"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (transactionData) {
                                window.open(transactionData, '_blank');
                              }
                            }}
                            className="h-10 text-sm"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            onClick={generateTransactionQR}
                            disabled={paymentLoading}
                            className="h-10 text-sm"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Refresh
                          </Button>
                        </div>
                        
                        {/* Alternative URL Formats for Testing */}
                        <div className="border-t pt-2">
                          <p className="text-xs text-gray-600 mb-2">Alternative formats (for debugging):</p>
                          <div className="grid grid-cols-2 gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const amount = participant.amount_owed;
                                const recipient = split.creator.wallet;
                                const memo = `HydraPool: ${split.title}`;
                                const phantomUrl = `https://phantom.app/ul/v1/transfer?recipient=${recipient}&amount=${amount}&spl-token=${USDC_MINT_ADDRESS.toBase58()}&memo=${encodeURIComponent(memo)}&cluster=devnet`;
                                window.open(phantomUrl, '_blank');
                              }}
                              className="text-xs"
                            >
                              Phantom URL
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const amount = participant.amount_owed;
                                const recipient = split.creator.wallet;
                                const memo = `HydraPool: ${split.title}`;
                                const solanaPaySimple = `solana:${recipient}?amount=${amount}&memo=${encodeURIComponent(memo)}`;
                                window.open(solanaPaySimple, '_blank');
                              }}
                              className="text-xs"
                            >
                              Simple Solana
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowQRCode(false);
                          setQrCodeUrl(null);
                          setTransactionData(null);
                        }}
                        className="w-full h-10 text-sm"
                      >
                        Back to Options
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Connect your Phantom wallet to continue with the payment
                  </p>
                  {pwaInfo.isPWA && !pwaInfo.isMobile && (
                    <Alert className="border-amber-200 bg-amber-50">
                      <Info className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800 text-sm">
                        Browser extensions may have limited functionality in PWA
                        mode. Consider using the web version for full wallet
                        support.
                      </AlertDescription>
                    </Alert>
                  )}
                  <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
                </div>
              )}
            </div>
          )}

          {/* Wallet Info */}
          {isWalletConnected() && walletInfo && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Connected Wallet:</span>
                <code className="text-xs font-mono bg-white px-2 py-1 rounded">
                  {walletInfo.address.slice(0, 6)}...
                  {walletInfo.address.slice(-6)}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">USDC Balance:</span>
                <span className="font-semibold">
                  {walletLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : walletInfo.usdcBalance !== undefined ? (
                    `$${walletInfo.usdcBalance.toFixed(2)}`
                  ) : (
                    '--'
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Payment Error */}
          {(error || walletError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || walletError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card className="border border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Payment Details
              </h3>
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
                  {split.creator.username ||
                    split.creator.email?.split('@')[0] ||
                    'Creator'}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                <Shield className="h-3 w-3" />
                <span>Secure payment via Phantom wallet on Solana</span>
              </div>

              <Button
                onClick={handlePayment}
                disabled={
                  paymentLoading ||
                  !isWalletConnected() ||
                  hasInsufficientBalance() ||
                  walletLoading
                }
                className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base font-medium"
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
                    Connect Phantom First
                  </div>
                ) : hasInsufficientBalance() ? (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Insufficient Balance
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👻</span>
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
