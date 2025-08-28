'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  DollarSign,
  Users,
  Loader2,
  Check,
  Calculator,
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

  // Load friends for custom amounts UI
  useEffect(() => {
    if (!currentUser?.id) return;

    const loadFriends = async () => {
      try {
        const response = await fetch(
          `/api/friends?userId=${currentUser.id}&type=all`,
        );
        if (!response.ok) return;

        const data = await response.json();
        const relations = data.relations || [];

        // Filter for accepted friends and extract user data
        const acceptedFriends = relations.filter(
          (relation: any) => relation.status === 'accepted',
        );
        const friendsData = acceptedFriends.map(
          (relation: any) => relation.otherUser,
        );

        setFriends(friendsData);
      } catch (err) {
        // Silently handle error
      }
    };

    loadFriends();
  }, [currentUser?.id]);

  const handleInputChange = useCallback(
    (field: keyof CreateSplitFormData, value: string | number | string[]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setError(null);
      setSuccess(false);
    },
    [],
  );

  // Split calculation hook
  const splitCalculation = useSplitCalculation({
    totalAmount: formData.totalAmount,
    participantIds: formData.participantIds,
    creatorId: currentUser?.id || '',
    splitType: formData.splitType || 'equal',
    customAmounts: formData.customAmounts || {},
  });

  const handleParticipantChange = useCallback(
    (friendIds: string[]) => {
      handleInputChange('participantIds', friendIds);
      // Reset custom amounts when participants change and we're in custom mode
      if (formData.splitType === 'custom') {
        setFormData((prev) => ({
          ...prev,
          participantIds: friendIds,
          customAmounts: {}, // Reset custom amounts
        }));
      }
    },
    [handleInputChange, formData.splitType],
  );

  const handleCustomAmountChange = (userId: string, amount: number) => {
    setFormData((prev) => ({
      ...prev,
      customAmounts: {
        ...prev.customAmounts,
        [userId]: amount,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.id) {
      setError('You must be logged in to create a split');
      return;
    }

    if (!formData.title.trim()) {
      setError('Split title is required');
      return;
    }

    if (formData.totalAmount <= 0) {
      setError('Total amount must be greater than 0');
      return;
    }

    if (formData.participantIds.length === 0) {
      setError('Please select at least one friend to split with');
      return;
    }

    // Validate custom amounts if in custom mode
    if (formData.splitType === 'custom' && !splitCalculation.isValid) {
      setError(
        `Custom amounts don't add up to total. Remaining: ${splitCalculation.remainingAmount?.toFixed(2)} ${formData.currency}`,
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const requestData = {
        ...formData,
        creatorId: currentUser.id,
        participantAmounts: splitCalculation.participantAmounts, // Send calculated amounts
      };



      const response = await fetch('/api/splits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create split');
      }

      const data = await response.json();
      setSuccess(true);

      // Reset form
      setFormData({
        title: '',
        description: '',
        totalAmount: 0,
        participantIds: [],
        currency: 'USDC',
        splitType: 'equal',
        customAmounts: {},
      });

      // Call success callback
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Split
        </CardTitle>
        <CardDescription>
          Split expenses with your friends using USDC
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Split Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Split Title *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Dinner at Olive Garden"
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Give your split a descriptive name
            </p>
          </div>

          {/* Split Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional: Add more details about this expense..."
              rows={3}
              maxLength={500}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description?.length || 0}/500 characters
            </p>
          </div>

          {/* Total Amount */}
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Amount (USDC) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the total amount to be split
            </p>
          </div>

          {/* Currency Selection */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
            >
              <option value="USDC">USDC (Solana)</option>
              <option value="USD">USD (Fiat)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Select the currency for this split
            </p>
          </div>

          {/* Split Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="splitType">Split Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.splitType === 'equal' ? 'default' : 'outline'}
                onClick={() => handleInputChange('splitType', 'equal')}
                disabled={loading}
                className="flex-1"
              >
                <Users className="h-4 w-4 mr-2" />
                Equal Split
              </Button>
              <Button
                type="button"
                variant={
                  formData.splitType === 'custom' ? 'default' : 'outline'
                }
                onClick={() => handleInputChange('splitType', 'custom')}
                disabled={loading}
                className="flex-1"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Custom Amounts
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {formData.splitType === 'equal'
                ? 'Amount will be split equally among all participants'
                : 'Set custom amounts for each participant'}
            </p>
          </div>

          {/* Friend Selection */}
          <FriendSelector
            selectedFriends={formData.participantIds}
            onSelectionChange={handleParticipantChange}
            disabled={loading}
          />

          {/* Custom Amounts Section - Only show if custom mode and participants selected */}
          {formData.splitType === 'custom' &&
            formData.participantIds.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <Label className="text-base font-medium">
                    Custom Amount Distribution
                  </Label>
                </div>

                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  {/* Creator Amount */}
                  {currentUser && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Creator</Badge>
                          <span className="font-medium">
                            {getDisplayName(currentUser)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Your share of the split
                        </p>
                      </div>
                      <div className="w-32">
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
                            placeholder="0.00"
                            disabled={loading}
                            className="pl-10 text-center"
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
                      <div key={friendId} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Friend</Badge>
                            <span className="font-medium">
                              {getDisplayName(friend)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {friend.email}
                          </p>
                        </div>
                        <div className="w-32">
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
                              placeholder="0.00"
                              disabled={loading}
                              className="pl-10 text-center"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Validation Message */}
                  {formData.totalAmount > 0 && (
                    <div
                      className={`p-3 rounded-lg border text-sm ${
                        splitCalculation.isValid
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                    >
                      {splitCalculation.isValid ? (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          Custom amounts add up perfectly!
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium">
                            Amounts don't match total:
                          </p>
                          <p>
                            Remaining:{' '}
                            {splitCalculation.remainingAmount?.toFixed(2)}{' '}
                            {formData.currency}
                            {splitCalculation.remainingAmount &&
                            splitCalculation.remainingAmount > 0
                              ? ' (need to add more)'
                              : ' (too much allocated)'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Enhanced Split Calculation Preview */}
          {formData.totalAmount > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Split Summary</h4>
              </div>

              <div className="space-y-3 text-sm">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-mono font-medium">
                      {formData.totalAmount.toFixed(2)} {formData.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Participants:</span>
                    <span>
                      You + {formData.participantIds.length} friend
                      {formData.participantIds.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Split Type:</span>
                    <Badge
                      variant={
                        formData.splitType === 'equal' ? 'default' : 'secondary'
                      }
                    >
                      {formData.splitType === 'equal' ? 'Equal' : 'Custom'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge
                      variant={
                        splitCalculation.isValid ? 'default' : 'destructive'
                      }
                    >
                      {splitCalculation.isValid ? 'Valid' : 'Invalid'}
                    </Badge>
                  </div>
                </div>

                {/* Individual Amounts */}
                {formData.participantIds.length > 0 &&
                  splitCalculation.isValid && (
                    <div className="border-t pt-3">
                      <p className="font-medium mb-2">Individual Amounts:</p>
                      <div className="space-y-1">
                        {/* Creator */}
                        {currentUser && (
                          <div className="flex justify-between">
                            <span>
                              <Badge variant="secondary" className="mr-2">
                                You
                              </Badge>
                              {getDisplayName(currentUser)}
                            </span>
                            <span className="font-mono">
                              {splitCalculation.participantAmounts[
                                currentUser.id
                              ]?.toFixed(2) || '0.00'}{' '}
                              {formData.currency}
                            </span>
                          </div>
                        )}

                        {/* Friends */}
                        {formData.participantIds.map((friendId) => {
                          const friend = getFriendById(friendId);
                          if (!friend) return null;

                          return (
                            <div
                              key={friendId}
                              className="flex justify-between"
                            >
                              <span>
                                <Badge variant="outline" className="mr-2">
                                  Friend
                                </Badge>
                                {getDisplayName(friend)}
                              </span>
                              <span className="font-mono">
                                {splitCalculation.participantAmounts[
                                  friendId
                                ]?.toFixed(2) || '0.00'}{' '}
                                {formData.currency}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Equal Split Info */}
                {formData.splitType === 'equal' &&
                  formData.participantIds.length > 0 && (
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-medium text-primary">
                        <span>Per Person (Equal):</span>
                        <span className="font-mono">
                          {perPersonAmount.toFixed(2)} {formData.currency}
                        </span>
                      </div>
                    </div>
                  )}

                {/* Warnings */}
                {formData.participantIds.length === 0 && (
                  <div className="text-amber-600 text-xs bg-amber-50 p-3 rounded border border-amber-200">
                    ⚠️ Please select at least one friend to split with
                  </div>
                )}

                {formData.splitType === 'custom' &&
                  !splitCalculation.isValid &&
                  formData.participantIds.length > 0 && (
                    <div className="text-red-600 text-xs bg-red-50 p-3 rounded border border-red-200">
                      ❌ Custom amounts don't add up to total amount
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 rounded-md bg-green-50 border border-green-200">
              <p className="text-sm text-green-600 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Split created successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={
                loading ||
                !formData.title.trim() ||
                formData.totalAmount <= 0 ||
                formData.participantIds.length === 0
              }
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Split...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Split
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
