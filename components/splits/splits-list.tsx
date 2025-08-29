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

      // Apply limit if specified
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
        <Badge variant="default" className="bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    }

    if (userShare && !userShare.paid && !isCreator) {
      return (
        <Badge variant="destructive">
          <Clock className="h-3 w-3 mr-1" />
          You Owe
        </Badge>
      );
    }

    return (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Active
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {type === 'created'
                ? 'Splits You Created'
                : type === 'participating'
                  ? 'Splits You Joined'
                  : 'Your Splits'}
            </CardTitle>
            <CardDescription>
              {type === 'created'
                ? 'Splits you have created for others'
                : type === 'participating'
                  ? 'Splits where you owe money'
                  : 'All your splits - created and joined'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchSplits}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {showCreateButton && (
              <Button asChild size="sm">
                <Link href="/create-split">
                  <Plus className="h-4 w-4 mr-2" />
                  New Split
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {splits.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {type === 'created'
                ? "You haven't created any splits yet"
                : type === 'participating'
                  ? "You're not participating in any splits"
                  : 'No splits found'}
            </p>
            {showCreateButton && (
              <Button asChild>
                <Link href="/create-split">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Split
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {splits.map((split) => {
              const userShare = getCurrentUserShare(split);
              const isCreator = split.creator_id === currentUser?.id;
              const status = getSplitStatus(split);

              return (
                <div
                  key={split.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium truncate">{split.title}</h3>
                      {getStatusBadge(split)}
                      {isCreator && (
                        <Badge variant="outline" className="text-xs">
                          Creator
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {split.total_amount.toFixed(2)} {split.currency}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {split.participants.length} people
                      </div>
                      <div>
                        {new Date(split.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {userShare && !isCreator && (
                      <div className="mt-2">
                        <span className="text-sm font-medium">
                          Your share: {userShare.amount_owed.toFixed(2)}{' '}
                          {split.currency}
                          {userShare.paid ? (
                            <span className="text-green-600 ml-2">✓ Paid</span>
                          ) : (
                            <span className="text-red-600 ml-2">• Pending</span>
                          )}
                        </span>
                      </div>
                    )}

                    {split.description && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {split.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 ml-4">
                    {userShare && !userShare.paid && !isCreator && (
                      <Button size="sm" asChild className="w-full sm:w-auto">
                        <Link href={`/split/${split.id}`}>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Pay Now
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full sm:w-auto"
                    >
                      <Link href={`/split/${split.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}

            {limit && splits.length >= limit && (
              <div className="text-center pt-4 border-t">
                <Button variant="outline" asChild>
                  <Link href="/splits">
                    View All Splits
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
