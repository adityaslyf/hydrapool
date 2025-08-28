'use client';

import { LoginButton } from '@/components/auth/login-button';
import { UserProfile } from '@/components/auth/user-profile';
import { useAuth } from '@/hooks/use-auth';

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
          <div className="mb-12 flex justify-center">
            <UserProfile />
          </div>
        )}
      </div>
    </main>
  );
}
