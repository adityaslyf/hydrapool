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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200 safe-area-inset-top">
      <div className="max-w-md mx-auto md:max-w-4xl px-4 safe-area-inset-x">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 min-h-[44px] touch-manipulation"
            aria-label="HydraPool - Go to dashboard"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex-shrink-0">
              <Waves className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">HydraPool</span>
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
                    <Button
                      asChild
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 min-h-[44px] min-w-[44px] touch-manipulation shadow-lg"
                    >
                      <Link href="/create-split" aria-label="Create new split">
                        <Plus className="h-4 w-4 sm:mr-2 flex-shrink-0" />
                        <span className="hidden sm:inline font-medium">
                          New
                        </span>
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
