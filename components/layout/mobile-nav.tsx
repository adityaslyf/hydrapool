'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Receipt,
  Users,
  User,
  Plus,
  Wallet,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Overview and recent activity',
  },
  {
    name: 'Splits',
    href: '/splits',
    icon: Receipt,
    description: 'Manage your expense splits',
  },
  {
    name: 'Friends',
    href: '/friends',
    icon: Users,
    description: 'Your friends and connections',
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
    description: 'Account settings and preferences',
  },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 md:hidden safe-area-inset-bottom">
        <div className="max-w-md mx-auto md:max-w-4xl">
          <div className="grid grid-cols-4 min-h-[72px] px-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center space-y-1 text-xs transition-all duration-200 min-h-[56px] touch-manipulation py-2 px-1 rounded-xl mx-1',
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-900 active:bg-gray-100',
                  )}
                  aria-label={`${item.name} - ${item.description}`}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                      isActive
                        ? 'bg-blue-600 text-white scale-110'
                        : 'text-gray-500',
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                  </div>
                  <span
                    className={cn(
                      'font-medium text-center leading-tight text-xs',
                      isActive ? 'text-blue-600' : 'text-gray-500',
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile menu padding for bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] touch-manipulation',
              isActive
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-black hover:bg-gray-100',
            )}
            aria-label={`${item.name} - ${item.description}`}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function QuickActions() {
  return (
    <div className="flex items-center space-x-2">
      <Button
        asChild
        size="sm"
        className="hidden sm:flex min-h-[44px] touch-manipulation"
      >
        <Link href="/create-split">
          <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
          New Split
        </Link>
      </Button>

      <Button
        asChild
        size="sm"
        variant="outline"
        className="hidden sm:flex min-h-[44px] touch-manipulation"
      >
        <Link href="/profile">
          <User className="h-4 w-4 mr-2 flex-shrink-0" />
          Profile
        </Link>
      </Button>

      {/* Mobile quick action */}
      <Button
        asChild
        size="sm"
        className="sm:hidden min-h-[44px] min-w-[44px] p-2 touch-manipulation"
      >
        <Link href="/create-split" aria-label="Create new split">
          <Plus className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
