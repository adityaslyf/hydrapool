import { User, Friend, Split, SplitParticipant } from '@prisma/client';

// Re-export basic types
export type { User, Friend, Split, SplitParticipant };

// Extended types with relations
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

// Form types
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

export interface AddFriendFormData {
  email?: string;
  wallet?: string;
  username?: string;
}

// Friend request types
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

// Solana types
export interface SolanaWalletContextType {
  publicKey: string | null;
  connected: boolean;
  connecting: boolean;
  disconnect: () => void;
  sendTransaction: (transaction: unknown) => Promise<string>;
}

// Payment types
export interface PaymentData {
  splitId: string;
  participantId: string;
  amount: number;
  recipientWallet: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
