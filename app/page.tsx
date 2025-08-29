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
import { 
  Users, 
  Plus, 
  CreditCard, 
  BarChart3, 
  Wallet
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { authenticated, ready, loading, user } = useAuth();
  const { walletInfo } = useSolana();

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
        <div className="text-center space-y-8 py-16 max-w-2xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-black">
              Split Bills with Friends
            </h1>
            <p className="text-lg text-gray-600">
              Easy expense splitting using Solana USDC. 
              Fast payments, no hassle.
            </p>
          </div>
          
          <LoginButton />

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-6 w-6 text-black" />
              </div>
              <h3 className="font-semibold mb-2">Instant Payments</h3>
              <p className="text-sm text-gray-600">
                Pay with USDC on Solana
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-black" />
              </div>
              <h3 className="font-semibold mb-2">Add Friends</h3>
              <p className="text-sm text-gray-600">
                Connect and split expenses
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-black" />
              </div>
              <h3 className="font-semibold mb-2">Track Everything</h3>
              <p className="text-sm text-gray-600">
                See all your splits and payments
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-1">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-black mb-1">
            Hi {user?.username || user?.email?.split('@')[0] || 'there'}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Here's your expense overview
          </p>
        </div>

        {/* Wallet Balance Card */}
        <Card className="border border-gray-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Wallet Balance</p>
                <p className="text-xl sm:text-2xl font-bold text-black truncate">
                  {walletInfo?.usdcBalance !== undefined 
                    ? `$${walletInfo.usdcBalance.toFixed(2)}` 
                    : 'Loading...'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">USDC</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Card className="border border-gray-200 hover:bg-gray-50 transition-colors active:bg-gray-100 touch-manipulation">
            <CardContent className="p-0">
              <Link href="/create-split" className="block p-4 sm:p-6 min-h-[60px] flex items-center">
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-black mb-1 text-sm sm:text-base">
                      Create Split
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">New expense</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 hover:bg-gray-50 transition-colors active:bg-gray-100 touch-manipulation">
            <CardContent className="p-0">
              <Link href="/friends" className="block p-4 sm:p-6 min-h-[60px] flex items-center">
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-black mb-1 text-sm sm:text-base">Friends</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Manage friends</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Splits */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-black">Recent Splits</h2>
            <Link href="/splits">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black text-sm min-h-[44px] px-3">
                View All
              </Button>
            </Link>
          </div>
          <SplitsList type="all" limit={5} showCreateButton={false} />
        </div>
      </div>
    </AppLayout>
  );
}