'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  RefreshCw,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Shield,
  Settings,
  Info,
  TrendingUp,
  Clock,
  Zap,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { WalletInfo } from '@/components/solana/wallet-info';
import { WalletConnector } from '@/components/wallet/wallet-connector';
import { WalletSetup } from '@/components/wallet/wallet-setup';
import { useSolana } from '@/hooks/use-solana';
import { useAuth } from '@/hooks/use-auth';

export default function WalletPage() {
  const { user } = useAuth();
  const { 
    isWalletConnected, 
    walletInfo, 
    refreshBalances, 
    isLoading, 
    error 
  } = useSolana();
  const [showSetup, setShowSetup] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (isWalletConnected()) {
      refreshBalances();
    }
  }, [isWalletConnected, refreshBalances]);

  const copyAddress = async () => {
    if (walletInfo?.address) {
      try {
        await navigator.clipboard.writeText(walletInfo.address);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy address');
      }
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  if (showSetup) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-6">
          <WalletSetup 
            onComplete={() => setShowSetup(false)}
            skipOption={true}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
            <p className="text-gray-600">
              Manage your Solana wallet and USDC balance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSetup(true)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Setup Guide
            </Button>
            {isWalletConnected() && (
              <Button
                onClick={refreshBalances}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </div>
        </div>

        {/* Connection Status */}
        {!isWalletConnected() ? (
          <div className="space-y-6">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                No wallet connected. Connect your Solana wallet to start making payments.
              </AlertDescription>
            </Alert>
            <WalletConnector onWalletConnected={refreshBalances} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Wallet Overview */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Main Wallet Info */}
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Wallet Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Wallet Address */}
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Wallet Address
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 text-sm bg-gray-50 rounded-lg font-mono border">
                        {walletInfo?.address ? 
                          formatWalletAddress(walletInfo.address) : 
                          'Loading...'
                        }
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyAddress}
                        disabled={!walletInfo?.address}
                        className="h-9 w-9 p-0"
                      >
                        {copySuccess ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Network */}
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Network
                    </label>
                    <div className="mt-1">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Solana Devnet
                      </Badge>
                    </div>
                  </div>

                  {/* Connection Status */}
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">
                        Connected
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Balance Card */}
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Balance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* USDC Balance */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">
                        USDC Balance
                      </span>
                      <span className="text-xs text-blue-600">Primary currency</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          Loading...
                        </div>
                      ) : walletInfo?.usdcBalance !== undefined ? (
                        `$${walletInfo.usdcBalance.toFixed(2)}`
                      ) : (
                        '--'
                      )}
                    </div>
                  </div>

                  {/* SOL Balance */}
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-700">
                        SOL Balance
                      </span>
                      <span className="text-xs text-purple-600">Network fees</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          Loading...
                        </div>
                      ) : walletInfo?.balance !== undefined ? (
                        `${walletInfo.balance.toFixed(4)} SOL`
                      ) : (
                        '--'
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Wallet Info */}
            <WalletInfo showActions={true} />

            {/* Quick Actions */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://explorer.solana.com/address/${walletInfo?.address}?cluster=devnet`, '_blank')}
                    disabled={!walletInfo?.address}
                    className="justify-start h-auto p-4"
                  >
                    <div className="flex items-center gap-3">
                      <ExternalLink className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">View on Explorer</div>
                        <div className="text-xs text-gray-500">
                          Check transaction history
                        </div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={copyAddress}
                    disabled={!walletInfo?.address}
                    className="justify-start h-auto p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Copy className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Copy Address</div>
                        <div className="text-xs text-gray-500">
                          Share with others
                        </div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowSetup(true)}
                    className="justify-start h-auto p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Setup Guide</div>
                        <div className="text-xs text-gray-500">
                          Learn wallet basics
                        </div>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="border border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-2">
                      Your Wallet is Secure
                    </h3>
                    <div className="space-y-2 text-sm text-green-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Private keys never leave your device</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>All transactions require your approval</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>HydraPool never stores your seed phrase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Need Help?
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      If you're having trouble with your wallet or need to add USDC, 
                      here are some helpful resources:
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('https://docs.phantom.app/', '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Phantom Wallet Guide
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('https://docs.solana.com/wallet-guide', '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Solana Wallet Guide
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
