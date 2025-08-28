import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Get friends and friend requests for a user
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'friends', 'pending', 'sent', 'all'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }

    let query = supabase.from('friends').select(`
        id,
        user_id,
        friend_id,
        status,
        requested_at,
        accepted_at,
        user:user_id(id, email, username, wallet),
        friend:friend_id(id, email, username, wallet)
      `);

    switch (type) {
      case 'friends':
        // Get accepted friends (both directions)
        query = query.or(
          `and(user_id.eq.${userId},status.eq.accepted),and(friend_id.eq.${userId},status.eq.accepted)`,
        );
        break;

      case 'pending':
        // Get pending requests received by this user
        query = query.eq('friend_id', userId).eq('status', 'pending');
        break;

      case 'sent':
        // Get pending requests sent by this user
        query = query.eq('user_id', userId).eq('status', 'pending');
        break;

      default:
        // Get all relations for this user
        query = query.or(`user_id.eq.${userId},friend_id.eq.${userId}`);
    }

    const { data: relations, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Database query error' },
        { status: 500 },
      );
    }

    // Transform the data to be more usable on the frontend
    const transformedData =
      relations?.map((relation) => {
        // Determine if current user is the requester or the recipient
        const isRequester = relation.user_id === userId;
        const otherUser = isRequester ? relation.friend : relation.user;

        return {
          id: relation.id,
          requesterId: relation.user_id,
          recipientId: relation.friend_id,
          status: relation.status,
          requestedAt: relation.requested_at,
          acceptedAt: relation.accepted_at,
          isRequester,
          otherUser: {
            id: otherUser.id,
            email: otherUser.email,
            username: otherUser.username,
            wallet: otherUser.wallet,
          },
        };
      }) || [];

    return NextResponse.json({
      relations: transformedData,
      count: transformedData.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
