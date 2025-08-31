import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
} from '@solana/spl-token';

export const USDC_MINT_ADDRESS = new PublicKey(
  '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
);

export const SOLANA_NETWORK = 'devnet';
const RPC_URLS = [
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'https://devnet.helius-rpc.com/?api-key=demo',
  'https://rpc-devnet.helius.xyz',
  'https://api.devnet.solana.com',
];

let currentRpcIndex = 0;
export const SOLANA_RPC_URL = RPC_URLS[currentRpcIndex];

export function createSolanaConnection(): Connection {
  return new Connection(RPC_URLS[currentRpcIndex], 'confirmed');
}

async function retryWithFallback<T>(
  operation: (connection: Connection) => Promise<T>,
  maxRetries: number = 2,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const connection = createSolanaConnection();
      return await operation(connection);
    } catch (error: any) {
      lastError = error;

      if (
        error.message?.includes('429') ||
        error.message?.includes('Too Many Requests')
      ) {
        currentRpcIndex = (currentRpcIndex + 1) % RPC_URLS.length;

        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1)),
        );
        continue;
      }

      break;
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

export function usdcToSmallestUnit(amount: number): number {
  return Math.floor(amount * 1_000_000); // 6 decimals
}

export function smallestUnitToUsdc(amount: number): number {
  return amount / 1_000_000; // 6 decimals
}

export async function getSolBalance(walletAddress: string): Promise<number> {
  return retryWithFallback(async (connection) => {
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  });
}

export async function getUsdcBalance(walletAddress: string): Promise<number> {
  return retryWithFallback(async (connection) => {
    const publicKey = new PublicKey(walletAddress);

    const tokenAccountAddress = await getAssociatedTokenAddress(
      USDC_MINT_ADDRESS,
      publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    try {
      const tokenAccount = await getAccount(
        connection,
        tokenAccountAddress,
        'confirmed',
        TOKEN_PROGRAM_ID,
      );
      return smallestUnitToUsdc(Number(tokenAccount.amount));
    } catch (error) {
      return 0;
    }
  });
}

export async function checkTokenAccountExists(
  walletAddress: string,
  mintAddress: PublicKey = USDC_MINT_ADDRESS,
): Promise<boolean> {
  try {
    const connection = createSolanaConnection();
    const publicKey = new PublicKey(walletAddress);

    const tokenAccountAddress = await getAssociatedTokenAddress(
      mintAddress,
      publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    try {
      await getAccount(
        connection,
        tokenAccountAddress,
        'confirmed',
        TOKEN_PROGRAM_ID,
      );
      return true;
    } catch {
      return false;
    }
  } catch (error) {
    throw new Error(
      `Failed to check token account: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function createTokenAccountIfNeeded(
  payer: PublicKey,
  owner: PublicKey,
  mintAddress: PublicKey = USDC_MINT_ADDRESS,
): Promise<{ instruction: any; tokenAccountAddress: PublicKey } | null> {
  try {
    const tokenAccountAddress = await getAssociatedTokenAddress(
      mintAddress,
      owner,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const exists = await checkTokenAccountExists(owner.toBase58(), mintAddress);

    if (!exists) {
      const instruction = createAssociatedTokenAccountInstruction(
        payer,
        tokenAccountAddress,
        owner,
        mintAddress,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      return { instruction, tokenAccountAddress };
    }

    return { instruction: null, tokenAccountAddress };
  } catch (error) {
    throw new Error(
      `Failed to create token account instruction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function createUsdcTransferTransaction(
  fromAddress: string,
  toAddress: string,
  amount: number,
): Promise<Transaction> {
  try {
    const connection = createSolanaConnection();
    const fromPublicKey = new PublicKey(fromAddress);
    const toPublicKey = new PublicKey(toAddress);

    const transferAmount = usdcToSmallestUnit(amount);

    const fromTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT_ADDRESS,
      fromPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const toTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT_ADDRESS,
      toPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const transaction = new Transaction();

    const toAccountExists = await checkTokenAccountExists(toAddress);
    if (!toAccountExists) {
      const createAccountIx = createAssociatedTokenAccountInstruction(
        fromPublicKey, // payer
        toTokenAccount,
        toPublicKey, // owner
        USDC_MINT_ADDRESS,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );
      transaction.add(createAccountIx);
    }

    const transferInstruction = createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      fromPublicKey,
      transferAmount,
      [],
      TOKEN_PROGRAM_ID,
    );

    transaction.add(transferInstruction);

    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPublicKey;

    return transaction;
  } catch (error) {
    throw new Error(
      `Failed to create transfer transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function formatWalletAddress(
  address: string,
  chars: number = 4,
): string {
  if (!address || address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export async function confirmTransaction(
  signature: string,
  commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed',
): Promise<boolean> {
  try {
    const connection = createSolanaConnection();
    const result = await connection.confirmTransaction(signature, commitment);
    return !result.value.err;
  } catch (error) {
    return false;
  }
}
