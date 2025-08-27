import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to HydraPool
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Split bills and expenses with friends using Solana USDC
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🔐 Secure Authentication</CardTitle>
              <CardDescription>
                Login with email or social accounts and get a Solana wallet
                automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>👥 Friends System</CardTitle>
              <CardDescription>
                Add friends and easily split expenses with your social circle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💰 USDC Payments</CardTitle>
              <CardDescription>
                Fast and secure payments using Solana USDC cryptocurrency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
