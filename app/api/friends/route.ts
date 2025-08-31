import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

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
        query = query.or(
          `and(user_id.eq.${userId},status.eq.accepted),and(friend_id.eq.${userId},status.eq.accepted)`,
        );
        break;

      case 'pending':
        query = query.eq('friend_id', userId).eq('status', 'pending');
        break;

      case 'sent':
        query = query.eq('user_id', userId).eq('status', 'pending');
        break;

      default:
        query = query.or(`user_id.eq.${userId},friend_id.eq.${userId}`);
    }

    const { data: relations, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Database query error' },
        { status: 500 },
      );
    }

    const transformedData =
      relations?.map((relation) => {
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
