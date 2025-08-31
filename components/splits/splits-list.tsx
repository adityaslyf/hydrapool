'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  Eye,
  RefreshCw,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { SplitWithParticipants, User } from '@/types';

interface SplitsListProps {
  type?: 'all' | 'created' | 'participating';
  limit?: number;
  showCreateButton?: boolean;
}

interface SplitParticipantWithUser {
  id: string;
  user_id: string;
  amount_owed: number;
  paid: boolean;
  payment_status: 'pending' | 'processing' | 'confirmed' | 'failed';
  user: User;
}

interface SplitItemData extends Omit<SplitWithParticipants, 'participants'> {
  participants: SplitParticipantWithUser[];
}

export function SplitsList({
  type = 'all',
  limit,
  showCreateButton = true,
}: SplitsListProps) {
  const { user: currentUser } = useAuth();
  const [splits, setSplits] = useState<SplitItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSplits = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      setError(null);

      const url = new URL('/api/splits', window.location.origin);
      url.searchParams.set('userId', currentUser.id);
      if (type !== 'all') {
        url.searchParams.set('type', type);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch splits');
      }

      const data = await response.json();
      let fetchedSplits = data.splits || [];

      if (limit) {
        fetchedSplits = fetchedSplits.slice(0, limit);
      }

      setSplits(fetchedSplits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load splits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSplits();
  }, [currentUser?.id, type, limit]);

  const getDisplayName = (user: User) => {
    return user.username || user.email?.split('@')[0] || 'Unknown User';
  };

  const getSplitStatus = (split: SplitItemData) => {
    const totalPaid = split.participants.reduce(
      (sum, p) => sum + (p.paid ? p.amount_owed : 0),
      0,
    );
    const isFullyPaid = Math.abs(totalPaid - split.total_amount) < 0.01;
    return isFullyPaid ? 'completed' : 'active';
  };

  const getCurrentUserShare = (split: SplitItemData) => {
    if (!currentUser) return null;
    return split.participants.find((p) => p.user_id === currentUser.id);
  };

  const getStatusBadge = (split: SplitItemData) => {
    const status = getSplitStatus(split);
    const userShare = getCurrentUserShare(split);
    const isCreator = split.creator_id === currentUser?.id;

    if (status === 'completed') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1">
          ✓ Completed
        </Badge>
      );
    }

    if (userShare && !userShare.paid && !isCreator) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 text-xs px-2 py-1">
          ⏱ You Owe
        </Badge>
      );
    }

    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-2 py-1">
        ⏱ Active
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={fetchSplits}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {!showCreateButton && splits.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">No splits yet</h3>
          <p className="text-gray-500 text-sm mb-6">
            Create your first split to get started
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/create-split">
              <Plus className="h-4 w-4 mr-2" />
              Create Split
            </Link>
          </Button>
        </div>
      ) : splits.length === 0 ? (
        <div className="text-center py-8 px-4">
          <p className="text-gray-500 text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {splits.map((split) => {
            const userShare = getCurrentUserShare(split);
            const isCreator = split.creator_id === currentUser?.id;
            const status = getSplitStatus(split);

            return (
              <div
                key={split.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate text-sm">
                        {split.title}
                      </h3>
                      {getStatusBadge(split)}
                      {isCreator && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                        >
                          Creator
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />$
                        {split.total_amount.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {split.participants.length} people
                      </div>
                      <div>
                        {new Date(split.created_at).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                          },
                        )}
                      </div>
                    </div>

                    {userShare && !isCreator && (
                      <div className="text-sm">
                        <span className="text-gray-600">
                          Your share:{' '}
                          <span className="font-semibold text-gray-900">
                            ${userShare.amount_owed.toFixed(2)}
                          </span>
                        </span>
                        {userShare.paid ? (
                          <span className="ml-2 text-green-600 font-medium">
                            ✓ Paid
                          </span>
                        ) : (
                          <span className="ml-2 text-red-600 font-medium">
                            • Pending
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {userShare && !userShare.paid && !isCreator && (
                      <Button
                        size="sm"
                        asChild
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-medium"
                      >
                        <Link href={`/split/${split.id}`}>$ Pay Now</Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-gray-500 hover:text-gray-900 p-2"
                    >
                      <Link href={`/split/${split.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {limit && splits.length >= limit && (
            <div className="text-center pt-6 pb-2">
              <Button
                variant="ghost"
                asChild
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                <Link href="/splits">
                  View All Splits
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
