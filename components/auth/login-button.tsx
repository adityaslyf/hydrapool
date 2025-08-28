'use client';

import { useLogin, usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function LoginButton() {
  const { login } = useLogin();
  const { ready, authenticated } = usePrivy();

  if (!ready) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (authenticated) {
    return null; // User is already logged in
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Welcome to HydraPool</CardTitle>
        <CardDescription>
          Sign in to start splitting bills with your friends using Solana USDC
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={login} className="w-full" size="lg">
          Sign In
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Sign in with email, social accounts, or connect your wallet.
          <br />A Solana wallet will be created for you automatically.
        </p>
      </CardContent>
    </Card>
  );
}
