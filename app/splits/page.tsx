'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SplitsList } from '@/components/splits/splits-list';
import { ArrowLeft, Plus } from 'lucide-react';

export default function SplitsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'created' | 'participating'>('all');

  const tabs = [
    { id: 'all' as const, label: 'All Splits', description: 'All your splits' },
    { id: 'created' as const, label: 'Created', description: 'Splits you created' },
    { id: 'participating' as const, label: 'Joined', description: 'Splits you joined' },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">My Splits</h1>
          </div>
          <Button asChild>
            <Link href="/create-split">
              <Plus className="h-4 w-4 mr-2" />
              New Split
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          <SplitsList 
            type={activeTab} 
            showCreateButton={false}
          />
        </div>
      </div>
    </div>
  );
}
