'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Zap, Shield, Users, ExternalLink } from 'lucide-react';

interface WalletSelectionProps {
  onSelect: (walletType: 'privy' | 'phantom') => void;
}

export function WalletSelection({ onSelect }: WalletSelectionProps) {
  const [selectedWallet, setSelectedWallet] = useState<
    'privy' | 'phantom' | null
  >(null);

  const walletOptions = [
    {
      id: 'phantom' as const,
      name: 'Phantom Wallet',
      icon: '👻',
      description: 'Use your existing Phantom wallet',
      features: [
        'Your own wallet',
        'Full control of keys',
        'Works with other dApps',
        'Import existing wallet',
      ],
      pros: ['Maximum security', 'Wallet portability', 'Familiar interface'],
      recommended: true,
      color: 'purple',
    },
    {
      id: 'privy' as const,
      name: 'Embedded Wallet',
      icon: '🔐',
      description: 'Simple wallet managed by HydraPool',
      features: [
        'No setup required',
        'Automatic creation',
        'Email-based recovery',
        'Built-in integration',
      ],
      pros: ['Zero setup', 'Beginner friendly', 'Fast onboarding'],
      recommended: false,
      color: 'blue',
    },
  ];

  const handleSelect = (walletType: 'privy' | 'phantom') => {
    setSelectedWallet(walletType);
    onSelect(walletType);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Wallet</h2>
        <p className="text-gray-600">
          Select how you want to connect and make payments
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {walletOptions.map((wallet) => (
          <Card
            key={wallet.id}
            className={`border-2 cursor-pointer transition-all duration-200 ${
              selectedWallet === wallet.id
                ? `border-${wallet.color}-500 bg-${wallet.color}-50`
                : 'border-gray-200 hover:border-gray-300'
            } ${wallet.recommended ? 'ring-2 ring-green-200' : ''}`}
            onClick={() => handleSelect(wallet.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      {wallet.name}
                      {wallet.recommended && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardTitle>
                <Wallet className={`h-5 w-5 text-${wallet.color}-600`} />
              </div>
              <p className="text-sm text-gray-600 mt-2">{wallet.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Features */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Features:
                </h4>
                <ul className="space-y-1">
                  {wallet.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <div
                        className={`w-1.5 h-1.5 bg-${wallet.color}-600 rounded-full`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pros */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Benefits:
                </h4>
                <ul className="space-y-1">
                  {wallet.pros.map((pro, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-green-700"
                    >
                      <Shield className="h-3 w-3" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handleSelect(wallet.id)}
                className={`w-full ${
                  wallet.id === 'phantom'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                size="lg"
              >
                {selectedWallet === wallet.id ? (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Selected
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Choose {wallet.name}
                  </div>
                )}
              </Button>

              {wallet.id === 'phantom' && (
                <div className="text-center">
                  <a
                    href="https://phantom.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:text-purple-800 flex items-center justify-center gap-1"
                  >
                    Don't have Phantom? Download here
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Section */}
      <Card className="border border-gray-200 bg-gray-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Security Note
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Both options are secure, but they offer different levels of
                control:
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>
                  • <strong>Phantom:</strong> You control your private keys
                  completely
                </li>
                <li>
                  • <strong>Embedded:</strong> HydraPool helps manage your
                  wallet securely
                </li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                You can change your wallet choice later in your account
                settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
