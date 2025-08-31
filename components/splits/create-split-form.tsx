'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  DollarSign,
  Users,
  Loader2,
  Check,
  Calculator,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFriends } from '@/hooks/use-friends';
import { FriendSelector } from './friend-selector';
import { useSplitCalculation } from '@/hooks/use-split-calculation';
import type { CreateSplitFormData, User } from '@/types';

interface CreateSplitFormProps {
  onSplitCreated?: (splitId: string) => void;
  onCancel?: () => void;
}

export function CreateSplitForm({
  onSplitCreated,
  onCancel,
}: CreateSplitFormProps) {
  const { user: currentUser } = useAuth();
  const { checkExistingRelation } = useFriends();

  const [formData, setFormData] = useState<CreateSplitFormData>({
    title: '',
    description: '',
    totalAmount: 0,
    participantIds: [],
    currency: 'USDC',
    splitType: 'equal',
    customAmounts: {},
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);

  // Use split calculation hook
  const splitCalculation = useSplitCalculation({
    totalAmount: formData.totalAmount,
    participantIds: formData.participantIds,
    creatorId: currentUser?.id || '',
    splitType: formData.splitType as 'equal' | 'custom',
    customAmounts: formData.customAmounts || {},
  });

  // Load friends on component mount
  useEffect(() => {
    const loadFriends = async () => {
      if (!currentUser?.id) return;

      try {
        setFriendsLoading(true);
        const response = await fetch(
          `/api/friends?userId=${currentUser.id}&type=all`,
        );
        if (!response.ok) throw new Error('Failed to load friends');

        const data = await response.json();

        // Filter for accepted friends and extract user data (same as FriendSelector)
        const relations = data.relations || [];
        const acceptedFriends = relations.filter(
          (relation: any) => relation.status === 'accepted',
        );
        const friendsData = acceptedFriends.map(
          (relation: any) => relation.otherUser,
        );

        setFriends(friendsData);
      } catch (err) {
        console.error('Error loading friends:', err);
        setError('Failed to load friends');
      } finally {
        setFriendsLoading(false);
      }
    };

    loadFriends();
  }, [currentUser?.id]);

  const handleInputChange = useCallback(
    (field: keyof CreateSplitFormData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      setError(null);
    },
    [],
  );

  const handleParticipantChange = useCallback((participantIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      participantIds,
      // Reset custom amounts when participants change
      customAmounts:
        prev.splitType === 'custom'
          ? Object.fromEntries(
              [...participantIds, ...prev.participantIds].map((id) => [
                id,
                prev.customAmounts?.[id] || 0,
              ]),
            )
          : {},
    }));
  }, []);

  const handleCustomAmountChange = useCallback(
    (participantId: string, amount: number) => {
      setFormData((prev) => ({
        ...prev,
        customAmounts: {
          ...prev.customAmounts,
          [participantId]: amount,
        },
      }));
    },
    [],
  );

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Split title is required';
    if (formData.totalAmount <= 0) return 'Total amount must be greater than 0';
    if (formData.participantIds.length === 0)
      return 'At least one friend must be selected';

    if (formData.splitType === 'custom' && !splitCalculation.isValid) {
      return 'Custom amounts must add up to the total amount';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!currentUser?.id) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check friend relationships
      for (const friendId of formData.participantIds) {
        const relation = await checkExistingRelation(friendId);
        if (relation?.status !== 'accepted') {
          throw new Error(
            `You must be friends with all participants. Please add ${
              friends.find((f) => f.id === friendId)?.email || 'this user'
            } as a friend first.`,
          );
        }
      }

      const response = await fetch('/api/splits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          creatorId: currentUser.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create split');
      }

      const data = await response.json();
      setSuccess(true);

      // Redirect after a short delay
      setTimeout(() => {
        onSplitCreated?.(data.split.id);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create split');
    } finally {
      setLoading(false);
    }
  };

  const calculatePerPerson = () => {
    if (formData.totalAmount <= 0) return 0;
    const totalParticipants = formData.participantIds.length + 1; // +1 for creator
    return totalParticipants > 0 ? formData.totalAmount / totalParticipants : 0;
  };

  const perPersonAmount = calculatePerPerson();

  // Helper to get friend by ID
  const getFriendById = (friendId: string) => {
    return friends.find((f) => f.id === friendId);
  };

  // Helper to get display name
  const getDisplayName = (user: User) => {
    return user.username || user.email?.split('@')[0] || 'Unknown User';
  };

  if (success) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Split Created!
          </h3>
          <p className="text-gray-600 mb-4">
            "{formData.title}" has been created successfully
          </p>
          <div className="flex items-center justify-center text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Redirecting...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-600 p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Main Form Card */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Split Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Split Title */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-900"
              >
                What's this split for?
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Dinner, groceries, trip..."
                required
                disabled={loading}
                className="h-11"
              />
            </div>

            {/* Total Amount - Grid Layout */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label
                  htmlFor="totalAmount"
                  className="text-sm font-medium text-gray-900"
                >
                  Total amount
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.totalAmount || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'totalAmount',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    placeholder="0.00"
                    required
                    disabled={loading}
                    className="pl-9 h-11 text-center font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">
                  Currency
                </Label>
                <div className="h-11 bg-slate-50 border border-gray-200 rounded-md flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600">
                    USDC
                  </span>
                </div>
              </div>
            </div>

            {/* Split Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-900">
                How do you want to split it?
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={
                    formData.splitType === 'equal' ? 'default' : 'outline'
                  }
                  onClick={() => handleInputChange('splitType', 'equal')}
                  disabled={loading}
                  className={`h-11 justify-start ${
                    formData.splitType === 'equal'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Equally
                </Button>
                <Button
                  type="button"
                  variant={
                    formData.splitType === 'custom' ? 'default' : 'outline'
                  }
                  onClick={() => handleInputChange('splitType', 'custom')}
                  disabled={loading}
                  className={`h-11 justify-start ${
                    formData.splitType === 'custom'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Custom
                </Button>
              </div>
            </div>

            {/* Friend Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-900">
                Who's involved?
              </Label>
              {friendsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-500">Loading friends...</span>
                </div>
              ) : (
                <FriendSelector
                  selectedFriends={formData.participantIds}
                  onSelectionChange={handleParticipantChange}
                  disabled={loading}
                />
              )}
            </div>

            {/* Custom Amounts Section */}
            {formData.splitType === 'custom' &&
              formData.participantIds.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-900">
                    Set custom amounts
                  </Label>

                  <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    {/* Creator Amount */}
                    {currentUser && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {getDisplayName(currentUser)[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {getDisplayName(currentUser)}
                            </p>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              You
                            </Badge>
                          </div>
                        </div>
                        <div className="w-20">
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={
                                formData.customAmounts?.[currentUser.id] || ''
                              }
                              onChange={(e) =>
                                handleCustomAmountChange(
                                  currentUser.id,
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              placeholder="0"
                              disabled={loading}
                              className="pl-6 text-center text-sm h-9"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Friend Amounts */}
                    {formData.participantIds.map((friendId) => {
                      const friend = getFriendById(friendId);
                      if (!friend) return null;

                      return (
                        <div
                          key={friendId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {getDisplayName(friend)[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {getDisplayName(friend)}
                              </p>
                            </div>
                          </div>
                          <div className="w-20">
                            <div className="relative">
                              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.customAmounts?.[friendId] || ''}
                                onChange={(e) =>
                                  handleCustomAmountChange(
                                    friendId,
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                placeholder="0"
                                disabled={loading}
                                className="pl-6 text-center text-sm h-9"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Validation Message */}
                    {formData.totalAmount > 0 && (
                      <div
                        className={`p-3 rounded-lg text-sm ${
                          splitCalculation.isValid
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {splitCalculation.isValid ? (
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Amounts add up correctly
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">
                              Remaining: $
                              {splitCalculation.remainingAmount?.toFixed(2) ||
                                '0.00'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Split Preview */}
            {formData.totalAmount > 0 && formData.participantIds.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-blue-700">Total amount:</span>
                  <span className="font-semibold text-blue-900">
                    ${formData.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-blue-700">Split between:</span>
                  <span className="font-semibold text-blue-900">
                    {formData.participantIds.length + 1} people
                  </span>
                </div>
                {formData.splitType === 'equal' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Each person pays:</span>
                    <span className="font-semibold text-blue-900">
                      ${perPersonAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  loading ||
                  !formData.title ||
                  !formData.totalAmount ||
                  formData.participantIds.length === 0
                }
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Split
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
