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
import { Users, UserPlus, Clock, Send, Search, TrendingUp } from 'lucide-react';

export default function FriendsPage() {
  const { authenticated, ready, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  if (!ready || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 font-medium">Loading friends...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!authenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 px-4">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Connect with Friends
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Sign in to add friends and start splitting expenses together
            </p>
          </div>
          <SimpleLoginButton />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="px-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Friends</h1>
          <p className="text-gray-600">Manage your connections</p>
        </div>

        {/* Add Friend Section */}
        <div className="px-1">
          <Card className="border border-gray-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 text-lg">Add New Friend</CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    Search for users by email or username
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
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
        </div>

        {/* Friends Tabs */}
        <div className="px-1">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 p-1 rounded-xl">
              <TabsTrigger
                value="all"
                className="flex items-center gap-2 text-gray-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">All Friends</span>
                <span className="sm:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="flex items-center gap-2 text-gray-600 data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
              >
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Pending</span>
                <span className="sm:hidden">Pending</span>
              </TabsTrigger>
              <TabsTrigger
                value="sent"
                className="flex items-center gap-2 text-gray-600 data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Sent</span>
                <span className="sm:hidden">Sent</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card className="border border-gray-200 overflow-hidden">
                <CardHeader className="bg-blue-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-900 text-base">My Friends</CardTitle>
                        <CardDescription className="text-gray-600 text-sm">
                          People you're connected with on HydraPool
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-blue-600">1</div>
                      <div className="text-xs text-gray-500">friends</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <FriendsList />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <Card className="border border-gray-200 overflow-hidden">
                <CardHeader className="bg-orange-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-900 text-base">Pending Requests</CardTitle>
                        <CardDescription className="text-gray-600 text-sm">
                          Friend requests waiting for your response
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-orange-600">2</div>
                      <div className="text-xs text-gray-500">pending</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <FriendsList />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
              <Card className="border border-gray-200 overflow-hidden">
                <CardHeader className="bg-purple-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Send className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-900 text-base">Sent Requests</CardTitle>
                        <CardDescription className="text-gray-600 text-sm">
                          Friend requests you've sent to others
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-purple-600">0</div>
                      <div className="text-xs text-gray-500">sent</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <FriendsList />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Quick Stats */}
        <div className="px-1">
          <div className="grid grid-cols-3 gap-3">
            <Card className="border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">1</div>
                <div className="text-xs text-gray-500">Friends</div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">8</div>
                <div className="text-xs text-gray-500">Splits</div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">2</div>
                <div className="text-xs text-gray-500">Pending</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}