'use client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LogOut, Wallet, Mail, User as UserIcon } from 'lucide-react';


export function UserProfile() {
  
  const {
    authenticated,
    ready,
    logout,
    user,
    walletAddress,
    privyUser,
  } = useAuth();

  if (!ready || !authenticated || !privyUser) {
    return null;
  }

  // Get email from Google account or primary email
  const googleAccount = privyUser.linkedAccounts.find(
    (account) => account.type === 'google_oauth',
  );
  const email =
    privyUser.email?.address ||
    (googleAccount as { email?: string })?.email ||
    'No email';
  const displayWalletAddress = walletAddress || 'No wallet connected';

  const displayName = user?.displayName || user?.username || email.split('@')[0];

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              Welcome back, {displayName}!
            </CardTitle>
          </div>
          <CardDescription>
            Your HydraPool account and Solana wallet
          </CardDescription>

        </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {/* Profile Information */}
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Profile</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Username: {user?.username || 'Not set'}</div>
                {user?.displayName && (
                  <div>Display Name: {user.displayName}</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Solana Wallet</p>
                {walletAddress && (
                  <div
                    className="h-2 w-2 bg-green-500 rounded-full"
                    title="Wallet connected"
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate">
                {displayWalletAddress}
              </p>
              {walletAddress && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ Ready for USDC payments on Solana Devnet
                </p>
              )}
              {!walletAddress && (
                <p className="text-xs text-amber-600 mt-1">
                  ⏳ Solana wallet being created...
                </p>
              )}
            </div>
          </div>
        </div>

        <Button onClick={logout} variant="outline" className="w-full">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </CardContent>
    </Card>


    </>
  );
}
