'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { SimpleLoginButton } from '@/components/auth/simple-login-button';
import { CreateSplitForm } from '@/components/splits/create-split-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateSplitPage() {
  const { authenticated, ready, loading } = useAuth();
  const router = useRouter();

  const handleSplitCreated = (splitId: string) => {
    router.push(`/split/${splitId}`);
  };

  if (!ready || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!authenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 px-4">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Plus className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sign in to create splits
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Create and manage expense splits with your friends
            </p>
          </div>
          <SimpleLoginButton />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="px-1">
          <CreateSplitForm
            onSplitCreated={handleSplitCreated}
            onCancel={() => router.push('/')}
          />
        </div>
      </div>
    </AppLayout>
  );
}