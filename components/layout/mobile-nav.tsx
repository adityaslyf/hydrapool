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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Overview and recent activity'
  },
  {
    name: 'Splits',
    href: '/splits',
    icon: Receipt,
    description: 'Manage your expense splits'
  },
  {
    name: 'Friends',
    href: '/friends',
    icon: Users,
    description: 'Your friends and connections'
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
    description: 'Account settings and preferences'
  }
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
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
        <div className="grid grid-cols-4 h-16">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center space-y-1 text-xs transition-colors',
                  isActive 
                    ? 'text-black bg-gray-50' 
                    : 'text-gray-500 hover:text-black'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'text-black')} />
                <span className={cn('font-medium', isActive && 'text-black')}>
                  {item.name}
                </span>
              </Link>
            );
          })}
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
              'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            )}
          >
            <Icon className="h-4 w-4" />
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
      <Button asChild size="sm" className="hidden sm:flex">
        <Link href="/create-split">
          <Plus className="h-4 w-4 mr-2" />
          New Split
        </Link>
      </Button>
      
      <Button asChild size="sm" variant="outline" className="hidden sm:flex">
        <Link href="/wallet">
          <Wallet className="h-4 w-4 mr-2" />
          Wallet
        </Link>
      </Button>

      {/* Mobile quick action */}
      <Button asChild size="sm" className="sm:hidden">
        <Link href="/create-split">
          <Plus className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
