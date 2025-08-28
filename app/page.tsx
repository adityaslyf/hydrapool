'use client';

import { LoginButton } from '@/components/auth/login-button';
import { UserProfile } from '@/components/auth/user-profile';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, CreditCard, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { authenticated, ready, loading } = useAuth();

  if (!ready || loading) {
    return (
      <main className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading HydraPool...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to HydraPool
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Split bills and expenses with friends using Solana USDC
          </p>
        </div>

        {/* Authentication Section */}
        {!authenticated ? (
          <div className="mb-12 flex justify-center">
            <LoginButton />
          </div>
        ) : (
          <>
            <div className="mb-8 flex justify-center">
              <UserProfile />
            </div>

            {/* Dashboard Section */}
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold text-center mb-6">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Find Users */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5" />
                      Find Users
                    </CardTitle>
                    <CardDescription>
                      Search for users to add as friends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/users">
                      <Button className="w-full" variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Search Users
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Create Split */}
                <Card className="hover:shadow-lg transition-shadow opacity-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Plus className="h-5 w-5" />
                      Create Split
                    </CardTitle>
                    <CardDescription>
                      Split expenses with friends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline" disabled>
                      <Plus className="h-4 w-4 mr-2" />
                      New Split
                      <span className="ml-2 text-xs">(Phase 4)</span>
                    </Button>
                  </CardContent>
                </Card>

                {/* My Splits */}
                <Card className="hover:shadow-lg transition-shadow opacity-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CreditCard className="h-5 w-5" />
                      My Splits
                    </CardTitle>
                    <CardDescription>
                      View and manage your splits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline" disabled>
                      <CreditCard className="h-4 w-4 mr-2" />
                      View Splits
                      <span className="ml-2 text-xs">(Phase 6)</span>
                    </Button>
                  </CardContent>
                </Card>

                {/* Analytics */}
                <Card className="hover:shadow-lg transition-shadow opacity-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-5 w-5" />
                      Analytics
                    </CardTitle>
                    <CardDescription>
                      Track your expenses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline" disabled>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Stats
                      <span className="ml-2 text-xs">(Future)</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
