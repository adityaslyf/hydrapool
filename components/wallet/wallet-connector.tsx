'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  Plus,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Zap,
  Shield,
  Globe,
  Smartphone,
} from 'lucide-react';
import { useSolana } from '@/hooks/use-solana';

interface WalletConnectorProps {
  onWalletConnected?: () => void;
  showBalance?: boolean;
  compact?: boolean;
}

const POPULAR_WALLETS = [
  {
    name: 'Phantom',
    description: 'Most popular Solana wallet',
    icon: '👻',
    type: 'browser',
    downloadUrl: 'https://phantom.app/',
  },
  {
    name: 'Solflare',
    description: 'Secure Solana wallet',
    icon: '🔥',
    type: 'browser',
    downloadUrl: 'https://solflare.com/',
  },
  {
    name: 'Backpack',
    description: 'Multi-chain wallet',
    icon: '🎒',
    type: 'browser',
    downloadUrl: 'https://backpack.app/',
  },
  {
    name: 'Glow',
    description: 'Mobile-first wallet',
    icon: '✨',
    type: 'mobile',
    downloadUrl: 'https://glow.app/',
  },
];

export function WalletConnector({ 
  onWalletConnected, 
  showBalance = true, 
  compact = false 
}: WalletConnectorProps) {
  const { createWallet, connectWallet } = usePrivy();
  const { wallets } = useSolanaWallets();
  const { isWalletConnected, walletInfo, refreshBalances, isLoading } = useSolana();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  useEffect(() => {
    if (isWalletConnected() && onWalletConnected) {
      onWalletConnected();
    }
  }, [isWalletConnected, onWalletConnected]);

  const handleConnectWallet = async () => {
    try {
      setConnecting(true);
      setError(null);

      // First try to connect existing wallet
      await connectWallet();
      
      // If no wallets found, create one
      if (wallets.length === 0) {
        await createWallet();
      }

      // Refresh balances after connection
      setTimeout(() => {
        refreshBalances();
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const detectAvailableWallets = () => {
    const availableWallets = [];
    
    // Check for common Solana wallets in window object
    if (typeof window !== 'undefined') {
      if ((window as any).phantom?.solana) {
        availableWallets.push({ name: 'Phantom', detected: true });
      }
      if ((window as any).solflare) {
        availableWallets.push({ name: 'Solflare', detected: true });
      }
      if ((window as any).backpack) {
        availableWallets.push({ name: 'Backpack', detected: true });
      }
      if ((window as any).glow) {
        availableWallets.push({ name: 'Glow', detected: true });
      }
    }

    return availableWallets;
  };

  const availableWallets = detectAvailableWallets();

  if (compact && isWalletConnected()) {
    return (
      <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-800 font-medium">Wallet Connected</span>
        {showBalance && walletInfo?.usdcBalance !== undefined && (
          <Badge variant="outline" className="bg-white text-green-700">
            ${walletInfo.usdcBalance.toFixed(2)} USDC
          </Badge>
        )}
      </div>
    );
  }

  if (isWalletConnected()) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">Wallet Connected</h3>
              <p className="text-sm text-green-700">
                {walletInfo?.address ? 
                  `${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}` : 
                  'Ready for payments'
                }
              </p>
            </div>
            {showBalance && (
              <div className="text-right">
                <div className="text-sm text-green-700">USDC Balance</div>
                <div className="font-bold text-green-900">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : walletInfo?.usdcBalance !== undefined ? (
                    `$${walletInfo.usdcBalance.toFixed(2)}`
                  ) : (
                    '--'
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Main Connect Button */}
          <Button
            onClick={handleConnectWallet}
            disabled={connecting}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-medium"
            size="lg"
          >
            {connecting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Connecting Wallet...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Connect Wallet
              </div>
            )}
          </Button>

          {/* Wallet Detection */}
          {availableWallets.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Detected Wallets
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableWallets.map((wallet) => (
                  <Badge key={wallet.name} variant="outline" className="bg-white">
                    {wallet.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Show wallet options toggle */}
          <Button
            variant="outline"
            onClick={() => setShowWalletOptions(!showWalletOptions)}
            className="w-full"
          >
            {showWalletOptions ? 'Hide' : 'Show'} Wallet Options
          </Button>

          {/* Wallet Options */}
          {showWalletOptions && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Popular Solana Wallets</h4>
              <div className="grid gap-2">
                {POPULAR_WALLETS.map((wallet) => (
                  <div
                    key={wallet.name}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{wallet.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{wallet.name}</div>
                        <div className="text-xs text-gray-600">{wallet.description}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {wallet.type === 'browser' ? (
                          <Globe className="h-3 w-3 text-gray-400" />
                        ) : (
                          <Smartphone className="h-3 w-3 text-gray-400" />
                        )}
                        <span className="text-xs text-gray-500 capitalize">
                          {wallet.type}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(wallet.downloadUrl, '_blank')}
                      className="h-8"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Get
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Info */}
          <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <Shield className="h-4 w-4 text-gray-600 mt-0.5" />
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">Secure Connection</p>
              <p>
                Your wallet stays secure. We never store your private keys or seed phrase.
                All transactions require your explicit approval.
              </p>
            </div>
          </div>

          {/* Help */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Need help connecting your wallet?{' '}
              <button className="text-blue-600 hover:underline">
                View Setup Guide
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
