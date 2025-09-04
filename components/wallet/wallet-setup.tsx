'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Download,
  ExternalLink,
  Info,
  Loader2,
} from 'lucide-react';
import { WalletConnector } from './wallet-connector';
import { WalletInfo } from '@/components/solana/wallet-info';
import { useSolana } from '@/hooks/use-solana';

interface WalletSetupProps {
  onComplete?: () => void;
  skipOption?: boolean;
}

const SETUP_STEPS = [
  {
    id: 'install',
    title: 'Install a Wallet',
    description: 'Download and install a Solana wallet like Phantom',
    icon: <Download className="h-5 w-5" />,
  },
  {
    id: 'connect',
    title: 'Connect Your Wallet',
    description: 'Connect your wallet to HydraPool securely',
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    id: 'fund',
    title: 'Add USDC (Optional)',
    description: 'Add USDC to your wallet to make payments',
    icon: <Zap className="h-5 w-5" />,
  },
];

export function WalletSetup({ onComplete, skipOption = true }: WalletSetupProps) {
  const { isWalletConnected, walletInfo, refreshBalances } = useSolana();
  const [currentStep, setCurrentStep] = useState(0);
  const [showWalletConnector, setShowWalletConnector] = useState(false);

  useEffect(() => {
    if (isWalletConnected()) {
      setCurrentStep(2); // Move to funding step
      refreshBalances();
    }
  }, [isWalletConnected, refreshBalances]);

  const handleWalletConnected = () => {
    setCurrentStep(2);
    setShowWalletConnector(false);
  };

  const handleComplete = () => {
    onComplete?.();
  };

  const detectWallets = () => {
    const wallets = [];
    if (typeof window !== 'undefined') {
      if ((window as any).phantom?.solana) wallets.push('Phantom');
      if ((window as any).solflare) wallets.push('Solflare');
      if ((window as any).backpack) wallets.push('Backpack');
    }
    return wallets;
  };

  const detectedWallets = detectWallets();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Set Up Your Wallet</h1>
        <p className="text-gray-600">
          Connect a Solana wallet to start making payments with USDC
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {SETUP_STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                index <= currentStep
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-400'
              }`}
            >
              {index < currentStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                step.icon
              )}
            </div>
            {index < SETUP_STEPS.length - 1 && (
              <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {SETUP_STEPS[currentStep].icon}
            {SETUP_STEPS[currentStep].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 0: Install Wallet */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <p className="text-gray-600">
                {SETUP_STEPS[currentStep].description}
              </p>

              {detectedWallets.length > 0 ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Great! We detected {detectedWallets.join(', ')} on your browser.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-orange-200 bg-orange-50">
                  <Info className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    No Solana wallets detected. We recommend installing Phantom wallet.
                  </AlertDescription>
                </Alert>
              )}

              {/* Recommended Wallets */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">👻</span>
                    <div>
                      <div className="font-medium">Phantom</div>
                      <div className="text-sm text-gray-600">Most popular Solana wallet</div>
                    </div>
                    {detectedWallets.includes('Phantom') && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Installed
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://phantom.app/', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    {detectedWallets.includes('Phantom') ? 'Open' : 'Install'}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentStep(1)}
                  disabled={detectedWallets.length === 0}
                  className="flex-1"
                >
                  {detectedWallets.length > 0 ? 'Continue' : 'Install a Wallet First'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: Connect Wallet */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-gray-600">
                {SETUP_STEPS[currentStep].description}
              </p>

              {!showWalletConnector ? (
                <div className="space-y-4">
                  <Alert className="border-blue-200 bg-blue-50">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Your wallet stays secure. We never access your private keys.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={() => setShowWalletConnector(true)}
                    className="w-full"
                    size="lg"
                  >
                    <Wallet className="h-5 w-5 mr-2" />
                    Connect Wallet
                  </Button>
                </div>
              ) : (
                <WalletConnector
                  onWalletConnected={handleWalletConnected}
                  showBalance={false}
                />
              )}
            </div>
          )}

          {/* Step 2: Fund Wallet */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-gray-600">
                {SETUP_STEPS[currentStep].description}
              </p>

              {isWalletConnected() && (
                <WalletInfo showActions={true} />
              )}

              <Alert className="border-yellow-200 bg-yellow-50">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  You need USDC in your wallet to make payments. You can buy USDC on exchanges
                  like Coinbase or FTX and transfer it to your wallet.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">How to get USDC:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Buy USDC on a centralized exchange (Coinbase, Binance, etc.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    <span>Transfer USDC to your wallet address</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>Start making payments in HydraPool</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleComplete}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Complete Setup
                </Button>
              </div>
            </div>
          )}

          {/* Skip Option */}
          {skipOption && currentStep < 2 && (
            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                onClick={handleComplete}
                className="w-full text-gray-500"
              >
                Skip for now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="border border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-gray-900 mb-1">Need Help?</p>
              <p className="text-gray-600">
                If you're having trouble connecting your wallet, make sure you have a Solana
                wallet extension installed and enabled in your browser.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
