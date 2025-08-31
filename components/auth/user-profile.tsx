'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import Link from 'next/link';

export function UserProfile() {
  const { authenticated, ready, user, privyUser } = useAuth();

  if (!ready || !authenticated || !privyUser) {
    return null;
  }

  const googleAccount = privyUser.linkedAccounts.find(
    (account) => account.type === 'google_oauth',
  );
  const email =
    privyUser.email?.address ||
    (googleAccount as { email?: string })?.email ||
    'No email';

  const displayName = user?.username || email.split('@')[0];

  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className="flex items-center gap-2"
    >
      <Link href="/profile">
        <div className="h-6 w-6 rounded-full bg-black flex items-center justify-center">
          <span className="text-white text-xs font-medium">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="hidden sm:inline text-black">{displayName}</span>
      </Link>
    </Button>
  );
}
