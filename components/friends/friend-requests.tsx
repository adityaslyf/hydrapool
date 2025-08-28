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
import { UserPlus, Check, X, Clock, Users, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { FriendRequest, FriendRequestAction } from '@/types';

interface FriendRequestsProps {
  type: 'pending' | 'sent';
  onRequestUpdate?: () => void;
}

export function FriendRequests({ type, onRequestUpdate }: FriendRequestsProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/friends?userId=${user.id}&type=${type}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch friend requests');
      }

      const data = await response.json();
      setRequests(data.relations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.id, type]);

  const handleRequestAction = async (
    requestId: string,
    action: FriendRequestAction,
  ) => {
    if (!user?.id) return;

    try {
      setActionLoading(requestId);
      setError(null);

      const response = await fetch('/api/friends/request', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} friend request`);
      }

      // Refresh the requests list
      await fetchRequests();
      onRequestUpdate?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to ${action} request`,
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getUserDisplayName = (otherUser: FriendRequest['otherUser']) => {
    return (
      otherUser.username || otherUser.email?.split('@')[0] || 'Unknown User'
    );
  };

  const formatWalletAddress = (address?: string) => {
    if (!address || address.startsWith('pending_')) return 'No wallet';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {type === 'pending' ? 'Friend Requests' : 'Sent Requests'}
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
          {type === 'pending' ? (
            <>
              <UserPlus className="h-5 w-5" />
              Friend Requests
            </>
          ) : (
            <>
              <Clock className="h-5 w-5" />
              Sent Requests
            </>
          )}
          {requests.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {requests.length}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {type === 'pending'
            ? 'People who want to be your friend'
            : 'Friend requests you sent'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {type === 'pending'
                ? 'No pending friend requests'
                : 'No sent requests'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-medium">
                      {getUserDisplayName(request.otherUser)
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <p className="font-medium text-sm">
                      {getUserDisplayName(request.otherUser)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{request.otherUser.email}</span>
                      {request.otherUser.wallet && (
                        <span className="font-mono">
                          {formatWalletAddress(request.otherUser.wallet)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {type === 'pending'
                        ? 'Wants to be your friend'
                        : 'Request sent'}{' '}
                      • {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {type === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRequestAction(request.id, 'accept')}
                      disabled={actionLoading === request.id}
                      className="h-8"
                    >
                      {actionLoading === request.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequestAction(request.id, 'decline')}
                      disabled={actionLoading === request.id}
                      className="h-8"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {type === 'sent' && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Pending
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
