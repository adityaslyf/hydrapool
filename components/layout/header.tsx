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
import Image from 'next/image';

export function Header() {
  const { authenticated, ready, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200 safe-area-inset-top px-2 py-1">
      <div className="max-w-md mx-auto md:max-w-4xl safe-area-inset-x">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 min-h-[44px] touch-manipulation flex-shrink-0"
            aria-label="HydraPool - Go to dashboard"
          >
            {/* <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 flex-shrink-0"> */}
              <Image src="/icons/logo.png" width={50} height={50} alt="HydraPool" className=" text-white" />
            {/* </div> */}
          </Link>

          {/* Desktop Navigation */}
          {authenticated && <DesktopNavigation />}

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {ready && !loading && (
              <>
                {authenticated ? (
                  <>
                    {/* Create Split Button */}
                    <Button
                      asChild
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 touch-manipulation"
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
