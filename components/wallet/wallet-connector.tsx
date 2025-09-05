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
  Monitor,
  Download,
  Info,
} from 'lucide-react';
import { useSolana } from '@/hooks/use-solana';
import {
  detectPWAContext,
  detectWalletsInPWA,
  getWalletInstructions,
  openWalletApp,
} from '@/lib/pwa-utils';

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
  compact = false,
}: WalletConnectorProps) {
  const { createWallet, connectWallet } = usePrivy();
  const { wallets } = useSolanaWallets();
  const { isWalletConnected, walletInfo, refreshBalances, isLoading } =
    useSolana();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [pwaInfo, setPwaInfo] = useState(detectPWAContext());
  const [walletDetection, setWalletDetection] = useState(detectWalletsInPWA());

  useEffect(() => {
    if (isWalletConnected() && onWalletConnected) {
      onWalletConnected();
    }
  }, [isWalletConnected, onWalletConnected]);

  useEffect(() => {
    // Update PWA and wallet detection
    const info = detectPWAContext();
    const detection = detectWalletsInPWA();
    setPwaInfo(info);
    setWalletDetection(detection);
  }, []);

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

  const handleOpenWalletApp = (walletName: string) => {
    const success = openWalletApp(walletName, pwaInfo);
    if (!success) {
      setError(`Unable to open ${walletName} app`);
    }
  };

  const instructions = getWalletInstructions(pwaInfo);

  if (compact && isWalletConnected()) {
    return (
      <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-800 font-medium">
          Wallet Connected
        </span>
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
                {walletInfo?.address
                  ? `${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}`
                  : 'Ready for payments'}
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

          {/* PWA Context Alert */}
          {pwaInfo.isPWA && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="space-y-1">
                  <div className="font-medium">
                    {pwaInfo.isMobile
                      ? 'Mobile PWA Detected'
                      : 'Desktop PWA Detected'}
                  </div>
                  <div className="text-sm">
                    {pwaInfo.isMobile
                      ? 'Use wallet mobile apps for best experience'
                      : 'Browser extensions may have limited functionality'}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Wallet Detection */}
          {walletDetection.wallets.length > 0 && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  Wallet Status
                </span>
              </div>
              <div className="space-y-2">
                {walletDetection.wallets.map((wallet) => (
                  <div
                    key={wallet.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          wallet.detected ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                      <span className="text-sm font-medium">{wallet.name}</span>
                      {pwaInfo.isMobile && wallet.deepLinkUrl && (
                        <Badge variant="outline" className="text-xs">
                          Mobile
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {wallet.detected ? (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Available
                        </Badge>
                      ) : pwaInfo.isMobile && wallet.deepLinkUrl ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenWalletApp(wallet.name)}
                          className="h-6 text-xs"
                        >
                          Open App
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(wallet.installUrl, '_blank')
                          }
                          className="h-6 text-xs"
                        >
                          Install
                        </Button>
                      )}
                    </div>
                  </div>
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
              <h4 className="text-sm font-medium text-gray-900">
                Popular Solana Wallets
              </h4>
              <div className="grid gap-2">
                {POPULAR_WALLETS.map((wallet) => (
                  <div
                    key={wallet.name}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{wallet.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {wallet.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {wallet.description}
                        </div>
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

          {/* PWA Instructions */}
          {pwaInfo.isPWA && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">
                {instructions.title}
              </h4>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-xs text-amber-800">
                  <p className="font-medium mb-2">{instructions.note}</p>
                  <ul className="space-y-1">
                    {instructions.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="font-medium">{index + 1}.</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Security Info */}
          <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <Shield className="h-4 w-4 text-gray-600 mt-0.5" />
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">Secure Connection</p>
              <p>
                Your wallet stays secure. We never store your private keys or
                seed phrase. All transactions require your explicit approval.
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
