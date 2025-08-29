'use client';

import { useAuth } from '@/hooks/use-auth';
import { useSolana } from '@/hooks/use-solana';
import { AppLayout } from '@/components/layout/app-layout';
import { SimpleLoginButton } from '@/components/auth/simple-login-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Wallet, Copy, ExternalLink, LogOut } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

export default function ProfilePage() {
  const { authenticated, user: currentUser, ready, loading } = useAuth();
  const { walletInfo } = useSolana();
  const { logout } = usePrivy();

  if (!ready || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!authenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-black">
              Sign in to view profile
            </h1>
            <p className="text-gray-600">
              Access your account and wallet settings
            </p>
          </div>
          <SimpleLoginButton />
        </div>
      </AppLayout>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black">Profile</h1>
          <p className="text-gray-600">Your account information</p>
        </div>

        {/* User Info */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-black">{currentUser?.email}</p>
            </div>
            {currentUser?.username && (
              <div>
                <p className="text-sm text-gray-600">Username</p>
                <p className="font-medium text-black">{currentUser.username}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-medium text-black">
                {new Date(currentUser?.created_at || '').toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Info */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Wallet className="h-5 w-5" />
              Solana Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Balance</p>
                <p className="text-xl font-bold text-black">
                  {walletInfo?.usdcBalance !== undefined
                    ? `$${walletInfo.usdcBalance.toFixed(2)} USDC`
                    : 'Loading...'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-black" />
              </div>
            </div>

            {walletInfo?.address && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Wallet Address</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-xs text-black break-all">
                    {walletInfo.address}
                  </p>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(walletInfo.address)}
                      className="text-gray-600 hover:text-black h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-gray-600 hover:text-black h-8 w-8 p-0"
                    >
                      <a
                        href={`https://explorer.solana.com/address/${walletInfo.address}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-black">12</div>
              <div className="text-sm text-gray-600">Friends</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-black">8</div>
              <div className="text-sm text-gray-600">Splits</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-black">$240</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
        </div>

        {/* Logout */}
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <Button
              onClick={logout}
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
