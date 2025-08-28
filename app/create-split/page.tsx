'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateSplitForm } from '@/components/splits/create-split-form';
import { ArrowLeft, Plus, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateSplitPage() {
  const { authenticated, ready } = useAuth();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const handleSplitCreated = (splitId: string) => {
    // Redirect to the split detail page
    router.push(`/split/${splitId}`);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to create splits</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Plus className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Create Split</h1>
            </div>
          </div>

          {/* Welcome Card */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                Ready to Split Expenses?
              </CardTitle>
              <CardDescription className="text-lg">
                Create a new split to share costs with your friends
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-4 text-left max-w-md mx-auto">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium">Split Title</h3>
                    <p className="text-sm text-muted-foreground">
                      Give your split a descriptive name like "Dinner at Olive
                      Garden"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium">Total Amount</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter the total cost to be split among participants
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium">Friend Selection ✅</h3>
                    <p className="text-sm text-muted-foreground">
                      Select friends from your friends list with search and
                      multi-select
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium">Automatic Calculation</h3>
                    <p className="text-sm text-muted-foreground">
                      We'll automatically calculate how much each person owes
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowForm(true)}
                size="lg"
                className="w-full max-w-xs"
              >
                <Plus className="h-5 w-5 mr-2" />
                Start Creating Split
              </Button>

              <div className="text-xs text-muted-foreground">
                <p>
                  💡 <strong>Tip:</strong> Make sure you have friends added
                  before creating splits
                </p>
                <p>
                  You can add friends from the{' '}
                  <Link href="/users" className="text-primary hover:underline">
                    Users
                  </Link>{' '}
                  page
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
          <div className="flex items-center gap-2">
            <Plus className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Create New Split</h1>
          </div>
        </div>

        {/* Split Creation Form */}
        <CreateSplitForm
          onSplitCreated={handleSplitCreated}
          onCancel={() => setShowForm(false)}
        />
      </div>
    </div>
  );
}
