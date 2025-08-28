import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const searchTerm = query.trim().toLowerCase();

    // Search users by email, username, or wallet address
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, username, wallet, created_at')
      .or(`email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,wallet.ilike.%${searchTerm}%`)
      .limit(limit);

    if (error) {
      console.error('Supabase search error:', error);
      return NextResponse.json(
        { error: 'Database search error' },
        { status: 500 }
      );
    }

    // Transform the results to match our frontend types
    const transformedUsers = users?.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      wallet: user.wallet,
      createdAt: user.created_at,
    })) || [];

    return NextResponse.json({ 
      users: transformedUsers,
      total: transformedUsers.length 
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
