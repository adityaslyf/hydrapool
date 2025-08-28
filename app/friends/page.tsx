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
import { FriendRequests } from '@/components/friends/friend-requests';
import { FriendsList } from '@/components/friends/friends-list';
import { Users, ArrowLeft, UserPlus, Search } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

export default function FriendsPage() {
  const { authenticated, ready } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRequestUpdate = () => {
    setRefreshKey((prev) => prev + 1);
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
            <CardDescription>
              Please log in to manage your friends
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Friends</h1>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex flex-wrap gap-4">
          <Link href="/users">
            <Button variant="outline" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Find New Friends
            </Button>
          </Link>
        </div>

        {/* Friend Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Incoming Friend Requests */}
          <FriendRequests
            key={`pending-${refreshKey}`}
            type="pending"
            onRequestUpdate={handleRequestUpdate}
          />

          {/* Sent Friend Requests */}
          <FriendRequests
            key={`sent-${refreshKey}`}
            type="sent"
            onRequestUpdate={handleRequestUpdate}
          />
        </div>

        {/* Friends List */}
        <FriendsList onFriendRemoved={handleRequestUpdate} />

        {/* Help Section */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">🤝 How Friend Requests Work</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>1. Find Users</strong>
                <p className="text-muted-foreground">
                  Search for users by email, username, or wallet address.
                </p>
              </div>
              <div>
                <strong>2. Send Request</strong>
                <p className="text-muted-foreground">
                  Click the + button to send a friend request.
                </p>
              </div>
              <div>
                <strong>3. Accept/Decline</strong>
                <p className="text-muted-foreground">
                  Manage incoming requests with ✓ (accept) or ✗ (decline).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
