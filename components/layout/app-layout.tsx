'use client';

import { Header } from './header';
import { MobileNavigation } from './mobile-nav';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  const { authenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="safe-area-inset-x">
        <div
          className={cn(
            'max-w-md mx-auto md:max-w-4xl px-2 py-4',
            authenticated && 'pb-24 md:pb-8', // Extra padding for mobile nav
            className,
          )}
        >
          {children}
        </div>
      </main>

      {authenticated && <MobileNavigation />}
    </div>
  );
}
