'use client';

import { useLogin, usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';

export function SimpleLoginButton() {
  const { login } = useLogin();
  const { ready, authenticated } = usePrivy();

  if (!ready || authenticated) {
    return null;
  }

  return (
    <Button onClick={login} className="bg-black text-white hover:bg-gray-800">
      Sign In
    </Button>
  );
}
