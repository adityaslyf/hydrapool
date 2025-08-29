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
    <div className="min-h-screen bg-white">
      <Header />

      <main
        className={cn(
          'px-4 py-4',
          authenticated && 'pb-20 md:pb-6', // Extra padding for mobile nav
          className,
        )}
      >
        {children}
      </main>

      {authenticated && <MobileNavigation />}
    </div>
  );
}
