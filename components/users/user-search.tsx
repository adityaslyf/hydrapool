'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Search,
  User,
  Mail,
  Wallet,
  UserPlus,
  Loader2,
  Check,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFriends } from '@/hooks/use-friends';
import type { User as UserType } from '@/types';

interface UserSearchProps {
  onUserSelect?: (user: UserType) => void;
  placeholder?: string;
  showAddButton?: boolean;
  excludeCurrentUser?: boolean;
}

interface SearchResult {
  users: UserType[];
  total: number;
}

export function UserSearch({
  onUserSelect,
  placeholder = 'Search users by email, username, or wallet...',
  showAddButton = false,
  excludeCurrentUser = true,
}: UserSearchProps) {
  const { user: currentUser } = useAuth();
  const {
    sendFriendRequest,
    getFriendStatus,
    loading: friendsLoading,
  } = useFriends();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [friendStatuses, setFriendStatuses] = useState<
    Record<string, 'none' | 'pending_sent' | 'pending_received' | 'friends'>
  >({});
  const [requestingFriend, setRequestingFriend] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchUsers = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(searchQuery)}&limit=10`,
        );

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data: SearchResult = await response.json();

        let filteredUsers = data.users;
        if (excludeCurrentUser && currentUser) {
          filteredUsers = data.users.filter(
            (user) => user.id !== currentUser.id,
          );
        }

        setResults(filteredUsers);
        setShowResults(true);

        if (filteredUsers.length > 0 && showAddButton) {
          const statuses: Record<
            string,
            'none' | 'pending_sent' | 'pending_received' | 'friends'
          > = {};
          await Promise.all(
            filteredUsers.map(async (user) => {
              const status = await getFriendStatus(user.id);
              statuses[user.id] = status;
            }),
          );
          setFriendStatuses(statuses);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [currentUser, excludeCurrentUser, showAddButton, getFriendStatus],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchUsers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserClick = (user: UserType) => {
    onUserSelect?.(user);
    setShowResults(false);
    setQuery('');
  };

  const handleAddFriend = async (user: UserType, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!currentUser?.id || requestingFriend === user.id) return;

    setRequestingFriend(user.id);

    const result = await sendFriendRequest(user.id);

    if (result.success) {
      setFriendStatuses((prev) => ({
        ...prev,
        [user.id]: 'pending_sent',
      }));
    } else {
      setError(result.error || 'Failed to send friend request');
    }

    setRequestingFriend(null);
  };

  const formatWalletAddress = (address: string) => {
    if (!address || address.startsWith('pending_')) return 'No wallet';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getUserDisplayName = (user: UserType) => {
    return user.username || user.email?.split('@')[0] || 'Unknown User';
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(results.length > 0)}
          className="pl-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
        )}
      </div>

      {error && (
        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-[100] max-h-80 overflow-y-auto shadow-lg border border-gray-200 bg-white">
          <CardContent className="p-0">
            {results.length === 0 && !loading && query.length >= 2 && (
              <div className="p-4 text-center text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No users found for "{query}"</p>
              </div>
            )}

            {results.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 border-b last:border-b-0 cursor-pointer"
                onClick={() => handleUserClick(user)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-medium">
                      {getUserDisplayName(user).charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {getUserDisplayName(user)}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">
                          {user.email}
                        </span>
                      </div>

                      {user.wallet && (
                        <div className="flex items-center gap-1">
                          <Wallet className="h-3 w-3" />
                          <span className="font-mono">
                            {formatWalletAddress(user.wallet)}
                          </span>
                        </div>
                      )}
                    </div>

                    {user.username && (
                      <p className="text-xs text-muted-foreground mt-1">
                        @{user.username}
                      </p>
                    )}
                  </div>
                </div>

                {showAddButton && (
                  <div className="flex items-center">
                    {(() => {
                      const status = friendStatuses[user.id] || 'none';
                      const isRequesting = requestingFriend === user.id;

                      if (status === 'friends') {
                        return (
                          <div className="flex items-center gap-1 text-green-600 text-xs">
                            <Check className="h-3 w-3" />
                            Friends
                          </div>
                        );
                      }

                      if (status === 'pending_sent') {
                        return (
                          <div className="flex items-center gap-1 text-orange-600 text-xs">
                            <Clock className="h-3 w-3" />
                            Sent
                          </div>
                        );
                      }

                      if (status === 'pending_received') {
                        return (
                          <div className="flex items-center gap-1 text-blue-600 text-xs">
                            <Clock className="h-3 w-3" />
                            Pending
                          </div>
                        );
                      }

                      return (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleAddFriend(user, e)}
                          disabled={isRequesting || friendsLoading}
                        >
                          {isRequesting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                        </Button>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Backdrop to close results */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
