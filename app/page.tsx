'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { LoginButton } from '@/components/auth/login-button';
import { SplitsList } from '@/components/splits/splits-list';
import { useAuth } from '@/hooks/use-auth';
import { useSolana } from '@/hooks/use-solana';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, CreditCard, BarChart3, Wallet, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { authenticated, ready, loading, user } = useAuth();
  const { walletInfo } = useSolana();

  if (!ready || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 font-medium">Loading HydraPool...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!authenticated) {
    return (
      <AppLayout>
        <div className="text-center space-y-8 py-16 px-4">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Wallet className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Split Bills Seamlessly
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Effortless expense splitting with Solana USDC. Fast, secure, and transparent payments.
            </p>
          </div>

          <LoginButton />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
            <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Payments</h3>
              <p className="text-sm text-gray-600">Pay with USDC on Solana blockchain</p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Connect Friends</h3>
              <p className="text-sm text-gray-600">
                Add friends and split expenses together
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Track Everything</h3>
              <p className="text-sm text-gray-600">
                Monitor all splits and payment history
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="px-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Welcome back!
              </h1>
              <p className="text-gray-600">
                {user?.username || user?.email?.split('@')[0] || 'User'}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {(user?.username || user?.email || 'U')[0].toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Wallet Balance Card - Enhanced */}
        <div className="px-1">
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-0 shadow-xl overflow-hidden">
            <CardContent className="p-6 relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-gray-300 text-sm font-medium mb-2">Total Balance</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">
                        {walletInfo?.usdcBalance !== undefined
                          ? `$${walletInfo.usdcBalance.toFixed(2)}`
                          : '$0.00'}
                      </span>
                      <span className="text-gray-400 text-sm font-medium">USDC</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                {walletInfo?.usdcBalance === undefined ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Loading wallet balance...
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-green-400">
                      <TrendingUp className="h-4 w-4" />
                      <span>Active</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>Updated now</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Redesigned */}
        <div className="px-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 active:scale-95 group">
              <CardContent className="p-0">
                <Link href="/create-split" className="block p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Plus className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Create Split</h3>
                      <p className="text-xs text-gray-500">Start new expense</p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:shadow-lg hover:border-green-300 transition-all duration-300 active:scale-95 group">
              <CardContent className="p-0">
                <Link href="/friends" className="block p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Friends</h3>
                      <p className="text-xs text-gray-500">Manage connections</p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link href="/splits">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium min-h-[44px]"
              >
                View All
              </Button>
            </Link>
          </div>
          
          <Card className="border border-gray-200 overflow-hidden">
            <SplitsList type="all" limit={5} showCreateButton={false} />
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}