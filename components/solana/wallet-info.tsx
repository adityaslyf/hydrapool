'use client';

import { useEffect } from 'react';
import { RefreshCw, Wallet, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useSolana } from '@/hooks/use-solana';
import { formatWalletAddress } from '@/lib/solana';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WalletInfoProps {
  showActions?: boolean;
  compact?: boolean;
}

export function WalletInfo({ showActions = true, compact = false }: WalletInfoProps) {
  const {
    walletInfo,
    isLoading,
    error,
    refreshBalances,
    isWalletConnected,
  } = useSolana();

  // Only refresh balances when wallet is first loaded
  useEffect(() => {
    if (!isWalletConnected()) return;
    
    // Only fetch balances once when component mounts
    const timeoutId = setTimeout(() => {
      refreshBalances();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [isWalletConnected]); // Removed refreshBalances from dependencies

  const copyAddress = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address);
    }
  };

  const handleRefresh = () => {
    refreshBalances();
  };

  if (!isWalletConnected()) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Solana wallet not connected. Please ensure you have a Solana wallet configured.
        </AlertDescription>
      </Alert>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Wallet className="h-4 w-4" />
        <span className="font-mono">
          {walletInfo?.address ? formatWalletAddress(walletInfo.address) : '...'}
        </span>
        <span className="text-muted-foreground">|</span>
        <span className="font-semibold">
          {isLoading ? 'Loading...' : 
           walletInfo?.usdcBalance !== undefined ? 
           `${walletInfo.usdcBalance.toFixed(2)} USDC` : 
           '-- USDC'}
        </span>
        {showActions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Solana Wallet
          {showActions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="ml-auto h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Wallet Address */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">Address</label>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 px-2 py-1 text-xs bg-muted rounded font-mono">
              {walletInfo?.address || 'Loading...'}
            </code>
            {walletInfo?.address && (
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">SOL Balance</label>
            <div className="mt-1 text-lg font-semibold">
              {isLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : walletInfo?.balance !== undefined ? (
                `${walletInfo.balance.toFixed(4)} SOL`
              ) : (
                <span className="text-muted-foreground">Click refresh to load</span>
              )}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">USDC Balance</label>
            <div className="mt-1 text-lg font-semibold">
              {isLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : walletInfo?.usdcBalance !== undefined ? (
                `${walletInfo.usdcBalance.toFixed(2)} USDC`
              ) : (
                <span className="text-muted-foreground">Click refresh to load</span>
              )}
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Connected to Solana Devnet</span>
        </div>
      </CardContent>
    </Card>
  );
}
