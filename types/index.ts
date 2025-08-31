import { User, Friend, Split, SplitParticipant } from '@prisma/client';

export type { User, Friend, Split, SplitParticipant };

export type UserWithFriends = User & {
  friends: (Friend & { friend: User })[];
};

export type SplitWithParticipants = Split & {
  creator: User;
  participants: (SplitParticipant & { user: User })[];
};

export type SplitParticipantWithUser = SplitParticipant & {
  user: User;
  split: Split;
};

export interface CreateSplitFormData {
  title: string;
  description?: string;
  totalAmount: number;
  participantIds: string[];
  currency?: string;
  splitType?: 'equal' | 'custom';
  customAmounts?: Record<string, number>; // userId -> amount
}

export interface SplitCalculation {
  totalAmount: number;
  totalParticipants: number;
  splitType: 'equal' | 'custom';
  participantAmounts: Record<string, number>;
  creatorAmount: number;
  isValid: boolean;
  remainingAmount?: number;
}

export interface SolanaTransaction {
  signature?: string;
  status: 'pending' | 'confirmed' | 'failed';
  amount: number;
  from: string;
  to: string;
  currency: string;
  timestamp: Date;
  splitId?: string;
  participantId?: string;
}

export interface SolanaWalletInfo {
  address: string;
  balance: number | undefined; // undefined means not loaded yet
  usdcBalance: number | undefined; // undefined means not loaded yet
  isConnected: boolean;
}

export interface PaymentRequest {
  amount: number;
  recipient: string;
  splitId: string;
  participantId: string;
  currency: string;
}

export interface PaymentResponse {
  success: boolean;
  signature?: string;
  error?: string;
  transaction?: SolanaTransaction;
}

export interface AddFriendFormData {
  email?: string;
  wallet?: string;
  username?: string;
}

export type FriendStatus = 'pending' | 'accepted' | 'declined';

export interface FriendRequest {
  id: string;
  requesterId: string;
  recipientId: string;
  status: FriendStatus;
  requestedAt: string;
  acceptedAt?: string;
  isRequester: boolean;
  otherUser: {
    id: string;
    email: string;
    username?: string;
    wallet?: string;
  };
}

export type FriendRequestAction = 'accept' | 'decline';

export interface FriendRequestActionData {
  requestId: string;
  action: FriendRequestAction;
  userId: string;
}

export interface SolanaWalletContextType {
  publicKey: string | null;
  connected: boolean;
  connecting: boolean;
  disconnect: () => void;
  sendTransaction: (transaction: unknown) => Promise<string>;
}

export interface PaymentData {
  splitId: string;
  participantId: string;
  amount: number;
  recipientWallet: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
