'use client';

import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import { SimpleLoginButton } from '@/components/auth/simple-login-button';
import { SplitsList } from '@/components/splits/splits-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function SplitsPage() {
  const { authenticated, ready, loading } = useAuth();

  if (!ready || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading splits...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!authenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-black">
              Sign in to view splits
            </h1>
            <p className="text-gray-600">
              See all your expense splits and payments
            </p>
          </div>
          <SimpleLoginButton />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-black mb-1">All Splits</h1>
            <p className="text-gray-600 text-sm">
              Your expense splits and payment history
            </p>
          </div>

          
        </div>

        {/* Splits List */}
        <SplitsList type="all" showCreateButton={false} />
      </div>
    </AppLayout>
  );
}
