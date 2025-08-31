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
import { UserMinus, Users, Loader2, Mail, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { FriendRequest } from '@/types';

interface FriendsListProps {
  onFriendRemoved?: () => void;
}

export function FriendsList({ onFriendRemoved }: FriendsListProps) {
  const { user: currentUser } = useAuth();
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingFriend, setRemovingFriend] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/friends?userId=${currentUser.id}&type=friends`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }

      const data = await response.json();
      setFriends(data.relations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch friends');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [currentUser?.id]);

  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUser?.id || removingFriend === friendId) return;

    try {
      setRemovingFriend(friendId);
      setError(null);

      // Find the friend relation to get the relation ID
      const friendRelation = friends.find(
        (friend) => friend.otherUser.id === friendId,
      );
      if (!friendRelation) return;

      const response = await fetch('/api/friends/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          relationId: friendRelation.id,
          userId: currentUser.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }

      // Remove friend from local state
      setFriends((prev) =>
        prev.filter((friend) => friend.otherUser.id !== friendId),
      );
      onFriendRemoved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove friend');
    } finally {
      setRemovingFriend(null);
    }
  };

  const getUserDisplayName = (otherUser: FriendRequest['otherUser']) => {
    return (
      otherUser.username || otherUser.email?.split('@')[0] || 'Unknown User'
    );
  };

  const formatWalletAddress = (address?: string) => {
    if (!address || address.startsWith('pending_')) return 'No wallet';
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Friends
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          My Friends
          {friends.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {friends.length}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          People you're connected with on HydraPool
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {friends.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              You don't have any friends yet
            </p>
            <p className="text-sm text-muted-foreground">
              Search for users and send friend requests to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-medium">
                      {getUserDisplayName(friend.otherUser)
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm">
                      {getUserDisplayName(friend.otherUser)}
                    </h3>

                    <div className="space-y-1 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-[200px]">
                          {friend.otherUser.email}
                        </span>
                      </div>

                      {friend.otherUser.wallet && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Wallet className="h-3 w-3" />
                          <span className="font-mono">
                            {formatWalletAddress(friend.otherUser.wallet)}
                          </span>
                        </div>
                      )}
                    </div>

                    {friend.otherUser.username && (
                      <p className="text-xs text-muted-foreground mt-1">
                        @{friend.otherUser.username}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground mt-1">
                      Friends since{' '}
                      {new Date(friend.acceptedAt || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemoveFriend(friend.otherUser.id)}
                  disabled={removingFriend === friend.otherUser.id}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  {removingFriend === friend.otherUser.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserMinus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
