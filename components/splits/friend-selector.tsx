'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users, X, UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { User } from '@/types';

interface FriendSelectorProps {
  selectedFriends: string[];
  onSelectionChange: (friendIds: string[]) => void;
  disabled?: boolean;
}

export function FriendSelector({
  selectedFriends,
  onSelectionChange,
  disabled = false,
}: FriendSelectorProps) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const loadFriends = async () => {
      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        const response = await fetch(`/api/friends?userId=${user.id}&type=all`);
        if (!response.ok) {
          if (isMounted) setError('Failed to load friends');
          return;
        }

        const data = await response.json();
        const relations = data.relations || [];

        const acceptedFriends = relations.filter(
          (relation: any) => relation.status === 'accepted',
        );
        const friendsData = acceptedFriends.map(
          (relation: any) => relation.otherUser,
        );

        if (isMounted) {
          setFriends(friendsData);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load friends');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFriends();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const reloadFriends = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/friends?userId=${user.id}&type=all`);
      if (!response.ok) {
        setError('Failed to load friends');
        return;
      }

      const data = await response.json();
      const relations = data.relations || [];

      const acceptedFriends = relations.filter(
        (relation: any) => relation.status === 'accepted',
      );
      const friendsData = acceptedFriends.map(
        (relation: any) => relation.otherUser,
      );

      setFriends(friendsData);
    } catch (err) {
      setError('Failed to load friends');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleFriendToggle = (friendId: string) => {
    if (disabled) return;

    const newSelection = selectedFriends.includes(friendId)
      ? selectedFriends.filter((id) => id !== friendId)
      : [...selectedFriends, friendId];

    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    const allFriendIds = friends.map((friend) => friend.id);
    onSelectionChange(allFriendIds);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onSelectionChange([]);
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.wallet?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDisplayName = (friend: User) => {
    return friend.username || friend.email?.split('@')[0] || 'Unknown User';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Select Friends to Split With
        </CardTitle>
        <CardDescription>
          Choose friends from your friends list to include in this split
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search friends by name, email, or wallet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled={disabled}
          />
        </div>

        {/* Selection Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={disabled || friends.length === 0}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Select All ({friends.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={disabled || selectedFriends.length === 0}
          >
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* Selected Friends Summary */}
        {selectedFriends.length > 0 && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">
                {selectedFriends.length} friend
                {selectedFriends.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedFriends.map((friendId) => {
                const friend = friends.find((f) => f.id === friendId);
                if (!friend) return null;

                return (
                  <Badge key={friendId} variant="secondary" className="gap-1">
                    {getDisplayName(friend)}
                    <button
                      onClick={() => handleFriendToggle(friendId)}
                      disabled={disabled}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading friends...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={reloadFriends}>
                Try Again
              </Button>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-8">
              {searchQuery ? (
                <div>
                  <p className="text-muted-foreground mb-2">
                    No friends found matching "{searchQuery}"
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div>
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground mb-2">No friends found</p>
                  <p className="text-sm text-muted-foreground">
                    Add friends from the Users page to start creating splits
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredFriends.map((friend) => {
                const isSelected = selectedFriends.includes(friend.id);
                const displayName = getDisplayName(friend);

                return (
                  <div
                    key={friend.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    onClick={() => handleFriendToggle(friend.id)}
                  >
                    {/* Custom Checkbox to avoid infinite loops */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-input hover:border-primary'
                        } ${disabled ? 'opacity-50' : ''}`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">
                          {getInitials(displayName)}
                        </span>
                      </div>

                      {/* Friend Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{displayName}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {friend.email}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground text-center">
          <p>
            💡 <strong>Tip:</strong> The total amount will be split equally
            among all participants
          </p>
          <p>
            You + {selectedFriends.length} friend
            {selectedFriends.length !== 1 ? 's' : ''} ={' '}
            {selectedFriends.length + 1} total
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
