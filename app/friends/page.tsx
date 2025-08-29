'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import { SimpleLoginButton } from '@/components/auth/simple-login-button';
import { UserSearch } from '@/components/users/user-search';
import { FriendsList } from '@/components/friends/friends-list';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Clock, Send, X } from 'lucide-react';

export default function FriendsPage() {
  const { authenticated, ready, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  if (!ready || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading friends...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!authenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-black">
              Sign in to manage friends
            </h1>
            <p className="text-gray-600">
              Connect with friends to split expenses
            </p>
          </div>
          <SimpleLoginButton />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black">Friends</h1>
          <p className="text-gray-600">Manage your connections</p>
        </div>

        {/* Add Friend Section */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <UserPlus className="h-5 w-5" />
              Add New Friend
            </CardTitle>
            <CardDescription className="text-gray-600">
              Search for users by email or username
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserSearch
              placeholder="Search users to add as friends..."
              showAddButton={true}
              onUserSelect={(user) => {
                console.log('Selected user:', user);
                // Handle friend request logic
              }}
            />
          </CardContent>
        </Card>

        {/* Friends Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger
              value="all"
              className="flex items-center gap-2 text-black data-[state=active]:bg-white"
            >
              <Users className="h-4 w-4" />
              All Friends
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="flex items-center gap-2 text-black data-[state=active]:bg-white"
            >
              <Clock className="h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="flex items-center gap-2 text-black data-[state=active]:bg-white"
            >
              <Send className="h-4 w-4" />
              Sent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">Your Friends</CardTitle>
                <CardDescription className="text-gray-600">
                  People you can create splits with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FriendsList type="friends" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">Pending Requests</CardTitle>
                <CardDescription className="text-gray-600">
                  Friend requests waiting for your response
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FriendsList type="pending" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">Sent Requests</CardTitle>
                <CardDescription className="text-gray-600">
                  Friend requests you've sent to others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FriendsList type="sent" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-black">12</div>
              <div className="text-sm text-gray-600">Friends</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-black">8</div>
              <div className="text-sm text-gray-600">Splits</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-black">2</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
