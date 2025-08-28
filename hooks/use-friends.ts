'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import type { FriendRequest } from '@/types';

interface UseFriendsReturn {
  sendFriendRequest: (
    friendId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  getFriendStatus: (
    friendId: string,
  ) => Promise<'none' | 'pending_sent' | 'pending_received' | 'friends'>;
  checkExistingRelation: (friendId: string) => Promise<FriendRequest | null>;
  loading: boolean;
}

export function useFriends(): UseFriendsReturn {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const sendFriendRequest = useCallback(
    async (friendId: string) => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        setLoading(true);

        const response = await fetch('/api/friends/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            friendId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.error || 'Failed to send friend request',
          };
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to send friend request',
        };
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  const checkExistingRelation = useCallback(
    async (friendId: string): Promise<FriendRequest | null> => {
      if (!user?.id) return null;

      try {
        const response = await fetch(`/api/friends?userId=${user.id}&type=all`);
        if (!response.ok) return null;

        const data = await response.json();
        const relations: FriendRequest[] = data.relations || [];

        // Find any relation with this user
        return (
          relations.find((relation) => relation.otherUser.id === friendId) ||
          null
        );
      } catch (error) {
        console.error('Error checking friend relation:', error);
        return null;
      }
    },
    [user?.id],
  );

  const getFriendStatus = useCallback(
    async (
      friendId: string,
    ): Promise<'none' | 'pending_sent' | 'pending_received' | 'friends'> => {
      const relation = await checkExistingRelation(friendId);

      if (!relation) return 'none';

      if (relation.status === 'accepted') return 'friends';

      if (relation.status === 'pending') {
        return relation.isRequester ? 'pending_sent' : 'pending_received';
      }

      return 'none';
    },
    [checkExistingRelation],
  );

  return {
    sendFriendRequest,
    getFriendStatus,
    checkExistingRelation,
    loading,
  };
}
