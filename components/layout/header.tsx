'use client';

import Link from 'next/link';
import { UserProfile } from '@/components/auth/user-profile';
import { SimpleLoginButton } from '@/components/auth/simple-login-button';
import { DesktopNavigation, QuickActions } from './mobile-nav';
import { useAuth } from '@/hooks/use-auth';
import { Waves, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

export function Header() {
  const { authenticated, ready, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
              <Waves className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-xl text-black">
              HydraPool
            </span>
          </Link>

          {/* Desktop Navigation */}
          {authenticated && <DesktopNavigation />}

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {ready && !loading && (
              <>
                {authenticated ? (
                  <>
                    {/* Create Split Button */}
                    <Button asChild size="sm" className="bg-black text-white hover:bg-gray-800">
                      <Link href="/create-split">
                        <Plus className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">New</span>
                      </Link>
                    </Button>

                    {/* User Profile */}
                    <UserProfile />
                  </>
                ) : (
                  <SimpleLoginButton />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
