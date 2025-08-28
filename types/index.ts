import { User, Friend, Split, SplitParticipant } from '@prisma/client';

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
}

export interface AddFriendFormData {
  email?: string;
  wallet?: string;
  username?: string;
}



// Friend request types
export type FriendStatus = 'pending' | 'accepted' | 'blocked';

export interface FriendRequest {
  id: string;
  userId: string;
  friendId: string;
  status: FriendStatus;
  requestedAt: Date;
  acceptedAt?: Date;
  user: User;
  friend: User;
}

export interface FriendRequestAction {
  requestId: string;
  action: 'accept' | 'decline' | 'block';
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
