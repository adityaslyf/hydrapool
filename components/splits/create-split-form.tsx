'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, DollarSign, Users, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFriends } from '@/hooks/use-friends';
import type { CreateSplitFormData } from '@/types';

interface CreateSplitFormProps {
  onSplitCreated?: (splitId: string) => void;
  onCancel?: () => void;
}

export function CreateSplitForm({ onSplitCreated, onCancel }: CreateSplitFormProps) {
  const { user: currentUser } = useAuth();
  const { checkExistingRelation } = useFriends();
  
  const [formData, setFormData] = useState<CreateSplitFormData>({
    title: '',
    description: '',
    totalAmount: 0,
    participantIds: [],
    currency: 'USDC',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: keyof CreateSplitFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
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

    try {
      setLoading(true);
      setError(null);

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
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        totalAmount: 0,
        participantIds: [],
        currency: 'USDC',
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
    if (formData.totalAmount <= 0 || formData.participantIds.length === 0) return 0;
    return formData.totalAmount / (formData.participantIds.length + 1); // +1 for creator
  };

  const perPersonAmount = calculatePerPerson();

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
                onChange={(e) => handleInputChange('totalAmount', parseFloat(e.target.value) || 0)}
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

          {/* Friend Selection Placeholder */}
          <div className="space-y-2">
            <Label>Friends to Split With</Label>
            <div className="p-4 border border-dashed border-muted-foreground/25 rounded-lg text-center">
              <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground mb-2">
                Friend selection coming in Phase 4B
              </p>
              <p className="text-xs text-muted-foreground">
                You'll be able to select friends from your friends list
              </p>
            </div>
          </div>

          {/* Split Calculation Preview */}
          {formData.totalAmount > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Split Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-mono">{formData.totalAmount} {formData.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Participants:</span>
                  <span>You + {formData.participantIds.length} friends</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Per Person:</span>
                  <span className="font-mono text-primary">
                    {perPersonAmount.toFixed(2)} {formData.currency}
                  </span>
                </div>
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
              disabled={loading || !formData.title.trim() || formData.totalAmount <= 0}
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
