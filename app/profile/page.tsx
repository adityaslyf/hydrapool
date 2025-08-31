'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSolana } from '@/hooks/use-solana';
import { AppLayout } from '@/components/layout/app-layout';
import { SimpleLoginButton } from '@/components/auth/simple-login-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  User,
  Wallet,
  Copy,
  ExternalLink,
  LogOut,
  Calendar,
  Mail,
  AtSign,
  TrendingUp,
  Users,
  DollarSign,
  Shield,
  Settings,
  Check,
  Edit2,
  X,
  Loader2,
} from 'lucide-react';

export default function ProfilePage() {
  const {
    authenticated,
    user: currentUser,
    ready,
    loading,
    logout,
  } = useAuth();
  const { walletInfo, refreshBalances, isWalletConnected } = useSolana();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      showToastMessage('Logout failed. Please try again.');
    }
  };

  useEffect(() => {
    if (authenticated && isWalletConnected()) {
      refreshBalances();
    }
  }, [authenticated, isWalletConnected, refreshBalances]);

  if (!ready || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 font-medium">Loading profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!authenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Access Your Profile
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Sign in to view your account details and wallet information
            </p>
          </div>
          <SimpleLoginButton />
        </div>
      </AppLayout>
    );
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToastMessage('Wallet address copied!');
    } catch (err) {
      showToastMessage('Failed to copy address');
    }
  };

  const handleEditUsername = () => {
    setEditedUsername(currentUser?.username || '');
    setIsEditingUsername(true);
  };

  const handleCancelEdit = () => {
    setIsEditingUsername(false);
    setEditedUsername('');
  };

  const handleSaveUsername = async () => {
    if (!currentUser?.id || !editedUsername.trim()) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          username: editedUsername.trim(),
        }),
      });

      if (response.ok) {
        setIsEditingUsername(false);
        showToastMessage('Username updated successfully!');
        window.location.reload();
      } else {
        const errorData = await response.json();
        showToastMessage(errorData.error || 'Failed to update username');
      }
    } catch (error) {
      showToastMessage('Failed to update username');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Account Info */}
        <div>
          <Card className="border border-gray-200 overflow-hidden">
            <CardContent className="p-4 space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="font-semibold text-gray-900 truncate">
                      {currentUser?.email}
                    </p>
                  </div>
                </div>

                {/* Username Section */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <AtSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium">
                      Username
                    </p>
                    {isEditingUsername ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={editedUsername}
                          onChange={(e) => setEditedUsername(e.target.value)}
                          className="h-8 text-sm"
                          placeholder="Enter username"
                          disabled={isUpdating}
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveUsername}
                          disabled={isUpdating || !editedUsername.trim()}
                          className="h-8 px-2"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                          className="h-8 px-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate">
                          {currentUser?.username || 'No username set'}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleEditUsername}
                          className="h-6 w-6 p-0 hover:bg-gray-200"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium">
                      Member Since
                    </p>
                    <p className="font-semibold text-gray-900">
                      {new Date(
                        currentUser?.created_at || '',
                      ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Info */}
        <div>
          <Card className="border border-gray-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      Solana Wallet
                    </CardTitle>
                    <p className="text-gray-300 text-sm">
                      Your crypto wallet details
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Balance Display */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    Current Balance
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {walletInfo?.usdcBalance !== undefined
                      ? `$${walletInfo.usdcBalance.toFixed(2)}`
                      : '$0.00'}
                  </p>
                  <p className="text-sm text-gray-500">USDC</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Wallet Address */}
              {walletInfo?.address && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900">
                    Wallet Address
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-gray-900 truncate">
                        {walletInfo.address}
                      </p>
                      <p className="font-mono text-xs text-gray-500 mt-1">
                        {formatAddress(walletInfo.address)}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(walletInfo.address)}
                        className="text-gray-600 hover:text-gray-900 h-9 w-9 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-gray-600 hover:text-gray-900 h-9 w-9 p-0"
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
        </div>

        {/* Quick Stats */}
        <div>
          <div className="grid grid-cols-3 gap-3">
            <Card className="border border-gray-200 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">1</div>
                <div className="text-xs text-gray-500">Friends</div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">8</div>
                <div className="text-xs text-gray-500">Splits</div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">$240</div>
                <div className="text-xs text-gray-500">Total</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="p-4">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
