'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserSearch } from '@/components/users/user-search';
import {
  Users,
  ArrowLeft,
  UserPlus,
  Check,
  Clock,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFriends } from '@/hooks/use-friends';
import Link from 'next/link';
import type { User as UserType } from '@/types';

// AddFriendButton Component
function AddFriendButton({ user }: { user: UserType }) {
  const { user: currentUser } = useAuth();
  const {
    sendFriendRequest,
    getFriendStatus,
    loading: friendsLoading,
  } = useFriends();
  const [friendStatus, setFriendStatus] = useState<
    'none' | 'pending_sent' | 'pending_received' | 'friends'
  >('none');
  const [requestingFriend, setRequestingFriend] = useState(false);

  // Check friend status when user changes
  useEffect(() => {
    if (user?.id && currentUser?.id) {
      getFriendStatus(user.id).then(setFriendStatus);
    }
  }, [user?.id, currentUser?.id, getFriendStatus]);

  const handleAddFriend = async () => {
    if (!currentUser?.id || !user?.id || requestingFriend) return;

    setRequestingFriend(true);
    const result = await sendFriendRequest(user.id);

    if (result.success) {
      setFriendStatus('pending_sent');
    }

    setRequestingFriend(false);
  };

  const formatWalletAddress = (address?: string) => {
    if (!address || address.startsWith('pending_'))
      return 'No wallet connected';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  if (friendStatus === 'friends') {
    return (
      <Button className="w-full" variant="outline" disabled>
        <Check className="h-4 w-4 mr-2" />
        Already Friends
      </Button>
    );
  }

  if (friendStatus === 'pending_sent') {
    return (
      <Button className="w-full" variant="outline" disabled>
        <Clock className="h-4 w-4 mr-2" />
        Friend Request Sent
      </Button>
    );
  }

  if (friendStatus === 'pending_received') {
    return (
      <Button className="w-full" variant="outline" disabled>
        <Clock className="h-4 w-4 mr-2" />
        Friend Request Pending
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      onClick={handleAddFriend}
      disabled={requestingFriend || friendsLoading}
    >
      {requestingFriend ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {requestingFriend ? 'Sending Request...' : 'Add Friend'}
    </Button>
  );
}

export default function UsersPage() {
  const { authenticated, ready } = useAuth();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

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
            <CardDescription>Please log in to search for users</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleUserSelect = (user: UserType) => {
    setSelectedUser(user);
  };

  const formatWalletAddress = (address: string) => {
    if (!address || address.startsWith('pending_'))
      return 'No wallet connected';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

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
            <Users className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Find Users</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Search Users
              </CardTitle>
              <CardDescription>
                Find users by email, username, or wallet address to add as
                friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserSearch
                onUserSelect={handleUserSelect}
                showAddButton={true}
                placeholder="Search by email, username, or wallet..."
              />

              <div className="mt-4 text-sm text-muted-foreground">
                <p>
                  💡 <strong>Tips:</strong>
                </p>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>• Search by email: john@example.com</li>
                  <li>• Search by username: @john</li>
                  <li>• Search by wallet: 9WzDXw...</li>
                  <li>• Minimum 2 characters required</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Selected User Details */}
          <Card>
            <CardHeader>
              <CardTitle>User Details</CardTitle>
              <CardDescription>
                {selectedUser
                  ? 'Selected user information'
                  : 'Select a user from search results to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedUser ? (
                <div className="space-y-4">
                  {/* User Profile */}
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-lg font-medium">
                        {(selectedUser.username || selectedUser.email || 'U')
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {selectedUser.username ||
                          selectedUser.email?.split('@')[0] ||
                          'Unknown User'}
                      </h3>
                      {selectedUser.username && (
                        <p className="text-muted-foreground">
                          @{selectedUser.username}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm font-medium">Email</span>
                      <span className="text-sm text-muted-foreground">
                        {selectedUser.email}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm font-medium">Wallet</span>
                      <span className="text-sm text-muted-foreground font-mono">
                        {formatWalletAddress(selectedUser.wallet || '')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm font-medium">Member Since</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(
                          selectedUser.createdAt || '',
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 space-y-2">
                    <AddFriendButton user={selectedUser} />
                    <Button variant="outline" className="w-full" disabled>
                      Send Message
                      <span className="ml-2 text-xs">(Future Feature)</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Search for users and select one to view their details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
