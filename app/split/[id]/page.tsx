'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Loader2,
  Check,
  Mail,
  Wallet,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSolana } from '@/hooks/use-solana';
import { AppLayout } from '@/components/layout/app-layout';
import type { SplitWithParticipants, User, PaymentRequest } from '@/types';

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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const splitId = params?.id as string;

  const fetchSplit = useCallback(async () => {
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
  }, [splitId]);

  useEffect(() => {
    if (!splitId) return;
    fetchSplit();
  }, [splitId, fetchSplit]);

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
      showToastMessage('Please ensure your Solana wallet is connected.');
      return;
    }

    try {
      setPaymentLoading(true);
      setError(null);

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
          await fetchSplit();
          showToastMessage('Payment successful! Split updated.');
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
      showToastMessage(`Payment failed: ${errorMessage}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyShareLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      showToastMessage('Split link copied to clipboard!');
    } catch (err) {
      showToastMessage('Failed to copy link');
    }
  };

  const formatWalletAddress = (address?: string) => {
    if (!address) return 'No wallet';
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 font-medium">
              Loading split details...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !split) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Split Not Found
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              {error || 'The split you are looking for does not exist.'}
            </p>
          </div>
          <Button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  const currentUserParticipation = getCurrentUserParticipation();
  const totalPaid = split.participants.reduce(
    (sum, p) => sum + (p.paid ? p.amount_owed : 0),
    0,
  );
  const isFullyPaid = totalPaid >= split.total_amount;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Split Details
              </h1>
              <p className="text-gray-600 text-sm">
                View and manage this expense split
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={copyShareLink}
            className="w-full sm:w-auto"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Split
          </Button>
        </div>

        {/* Split Info */}
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {split.title}
                </h2>
                {split.description && (
                  <p className="text-gray-600 mb-4">{split.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Created by {getDisplayName(split.creator)}</span>
                  <span>•</span>
                  <span>{new Date(split.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Badge
                variant={isFullyPaid ? 'default' : 'secondary'}
                className={`text-sm ${isFullyPaid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}
              >
                {isFullyPaid ? 'Fully Paid' : 'Active'}
              </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div className="font-bold text-lg text-gray-900">
                  ${split.total_amount.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">Total Amount</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div className="font-bold text-lg text-gray-900">
                  {split.participants.length}
                </div>
                <div className="text-sm text-gray-500">Participants</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="font-bold text-lg text-gray-900">
                  ${totalPaid.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">Paid</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div className="font-bold text-lg text-gray-900">
                  ${(split.total_amount - totalPaid).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current User Payment Section */}
        {currentUserParticipation && !isCreator() && (
          <Card className="border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Your Share
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your portion of this split
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      ${currentUserParticipation.amount_owed.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">Amount due</div>
                  </div>
                  {getPaymentStatusBadge(
                    currentUserParticipation.payment_status,
                    currentUserParticipation.paid,
                  )}
                </div>

                {!currentUserParticipation.paid && (
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handlePayment}
                      disabled={paymentLoading || !walletInfo?.isConnected}
                      className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                      size="lg"
                    >
                      {paymentLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing Payment...
                        </div>
                      ) : !walletInfo?.isConnected ? (
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          Connect Wallet
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Pay ${currentUserParticipation.amount_owed.toFixed(2)}
                        </div>
                      )}
                    </Button>

                    {/* Payment Info */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Paying to: {getDisplayName(split.creator)}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participants List */}
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Participants
                </h3>
                <p className="text-sm text-gray-600">
                  Payment status for all members
                </p>
              </div>
            </div>

            <div className="space-y-3 divide-y divide-gray-100">
              {split.participants.map((participant) => (
                <div key={participant.id} className="pt-3 first:pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-white">
                          {getDisplayName(participant.user)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {getDisplayName(participant.user)}
                          </p>
                          {participant.user_id === split.creator_id && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              Creator
                            </Badge>
                          )}
                          {participant.user_id === currentUser?.id && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">
                              {participant.user.email}
                            </span>
                          </div>
                          {participant.user.wallet && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Wallet className="h-3 w-3" />
                              <span className="font-mono">
                                {formatWalletAddress(participant.user.wallet)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          ${participant.amount_owed.toFixed(2)}
                        </div>
                        {participant.paid_at && (
                          <div className="text-xs text-gray-500">
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
