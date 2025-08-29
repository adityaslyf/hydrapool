'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  XCircle,
  ArrowLeft,
  CreditCard,
  Share2,
  Copy,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSolana } from '@/hooks/use-solana';
import type { SplitWithParticipants, User, PaymentRequest } from '@/types';
import { WalletInfo } from '@/components/solana/wallet-info';

interface SplitParticipantWithUser {
  id: string;
  user_id: string;
  amount_owed: number;
  paid: boolean;
  payment_status: 'pending' | 'processing' | 'confirmed' | 'failed';
  payment_transaction_id?: string;
  paid_at?: string;
  user: User;
}

interface SplitDetails extends Omit<SplitWithParticipants, 'participants'> {
  participants: SplitParticipantWithUser[];
}

export default function SplitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { sendPayment, walletInfo, isWalletConnected } = useSolana();
  const [split, setSplit] = useState<SplitDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const splitId = params.id as string;

  useEffect(() => {
    if (!splitId) return;

    const fetchSplit = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/splits/${splitId}`);
        if (!response.ok) {
          throw new Error('Split not found');
        }

        const data = await response.json();
        setSplit(data.split);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load split');
      } finally {
        setLoading(false);
      }
    };

    fetchSplit();
  }, [splitId]);

  const getCurrentUserParticipation = () => {
    if (!split || !currentUser) return null;
    return split.participants.find((p) => p.user_id === currentUser.id);
  };

  const isCreator = () => {
    return currentUser?.id === split?.creator_id;
  };

  const getDisplayName = (user: User) => {
    return user.username || user.email?.split('@')[0] || 'Unknown User';
  };

  const getPaymentStatusBadge = (status: string, paid: boolean) => {
    if (paid && status === 'confirmed') {
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    }

    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline">
            <DollarSign className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const handlePayment = async () => {
    const participation = getCurrentUserParticipation();
    if (!participation || participation.paid || !split) return;

    if (!isWalletConnected()) {
      alert('Please ensure your Solana wallet is connected.');
      return;
    }

    try {
      setPaymentLoading(true);
      setError(null);

      // Find the creator's wallet address
      const creatorWallet = split.creator?.wallet;
      if (!creatorWallet) {
        throw new Error('Creator wallet address not found');
      }

      const paymentRequest: PaymentRequest = {
        amount: participation.amount_owed,
        recipient: creatorWallet,
        splitId: split.id,
        participantId: participation.id,
        currency: split.currency || 'USDC',
      };

      const result = await sendPayment(paymentRequest);

      if (result.success && result.signature) {
        // Update the split participant status in the database
        const updateResponse = await fetch(`/api/splits/${split.id}/payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participantId: participation.id,
            transactionSignature: result.signature,
            amount: participation.amount_owed,
          }),
        });

        if (updateResponse.ok) {
          // Refresh the split data
          await fetchSplit();
          alert(
            `Payment successful! Transaction: ${result.signature.slice(0, 20)}...`,
          );
        } else {
          throw new Error('Failed to update payment status');
        }
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      alert(`Payment failed: ${errorMessage}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);

    alert('Split link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !split) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Split Not Found</h2>
                <p className="text-muted-foreground mb-4">
                  {error || 'The split you are looking for does not exist.'}
                </p>
                <Button onClick={() => router.push('/')} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentUserParticipation = getCurrentUserParticipation();
  const totalPaid = split.participants.reduce(
    (sum, p) => sum + (p.paid ? p.amount_owed : 0),
    0,
  );
  const isFullyPaid = totalPaid >= split.total_amount;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button variant="outline" onClick={copyShareLink}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Split
          </Button>
        </div>

        {/* Wallet Info for Payment */}
        {getCurrentUserParticipation() &&
          !getCurrentUserParticipation()?.paid && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your Wallet</CardTitle>
                <CardDescription>
                  Check your balance before making payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WalletInfo compact={false} />
              </CardContent>
            </Card>
          )}

        {/* Split Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{split.title}</CardTitle>
                {split.description && (
                  <CardDescription className="mt-2">
                    {split.description}
                  </CardDescription>
                )}
              </div>
              <Badge
                variant={isFullyPaid ? 'default' : 'secondary'}
                className="text-sm"
              >
                {isFullyPaid ? 'Fully Paid' : 'Active'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="font-bold text-lg">
                  {split.total_amount.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total {split.currency}
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="font-bold text-lg">
                  {split.participants.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Participants
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="font-bold text-lg">{totalPaid.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">
                  Paid {split.currency}
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                <div className="font-bold text-lg">
                  {(split.total_amount - totalPaid).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Remaining {split.currency}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current User Action */}
        {currentUserParticipation && !isCreator() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Your Share
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {currentUserParticipation.amount_owed.toFixed(2)}{' '}
                    {split.currency}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Your share of this split
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getPaymentStatusBadge(
                    currentUserParticipation.payment_status,
                    currentUserParticipation.paid,
                  )}
                  {!currentUserParticipation.paid && (
                    <div className="space-y-3">
                      <Button
                        onClick={handlePayment}
                        disabled={paymentLoading || !walletInfo?.isConnected}
                        className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                        size="lg"
                      >
                        {paymentLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing Payment...
                          </div>
                        ) : !walletInfo?.isConnected ? (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Wallet Not Connected
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Pay{' '}
                            {currentUserParticipation.amount_owed.toFixed(
                              2,
                            )}{' '}
                            {split.currency}
                          </div>
                        )}
                      </Button>

                      {/* Payment Details */}
                      <div className="text-xs text-muted-foreground">
                        <div>
                          Payment will be sent to:{' '}
                          {split.creator?.username ||
                            split.creator?.email?.split('@')[0] ||
                            'Split Creator'}
                        </div>
                        <div>Transaction fee: ~$0.01 SOL</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participants List */}
        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
            <CardDescription>
              Payment status for all participants in this split
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {split.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {getDisplayName(participant.user)
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {getDisplayName(participant.user)}
                        {participant.user_id === split.creator_id && (
                          <Badge variant="outline" className="text-xs">
                            Creator
                          </Badge>
                        )}
                        {participant.user_id === currentUser?.id && (
                          <Badge variant="secondary" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {participant.user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">
                        {participant.amount_owed.toFixed(2)} {split.currency}
                      </div>
                      {participant.paid_at && (
                        <div className="text-xs text-muted-foreground">
                          Paid{' '}
                          {new Date(participant.paid_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {getPaymentStatusBadge(
                      participant.payment_status,
                      participant.paid,
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Split Details */}
        <Card>
          <CardHeader>
            <CardTitle>Split Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created by:</span>
                <div className="font-medium">
                  {getDisplayName(split.creator)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Created on:</span>
                <div className="font-medium">
                  {new Date(split.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Currency:</span>
                <div className="font-medium">{split.currency}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="font-medium">
                  {isFullyPaid ? 'Completed' : 'Active'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
