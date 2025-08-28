import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Send friend request
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { userId, friendId } = body;

    if (!userId || !friendId) {
      return NextResponse.json(
        { error: 'User ID and Friend ID are required' },
        { status: 400 },
      );
    }

    if (userId === friendId) {
      return NextResponse.json(
        { error: 'Cannot send friend request to yourself' },
        { status: 400 },
      );
    }

    // Check if request already exists
    const { data: existingRequest } = await supabase
      .from('friends')
      .select('*')
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
      .single();

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Friend request already exists or you are already friends' },
        { status: 409 },
      );
    }

    // Create friend request
    const { data: friendRequest, error } = await supabase
      .from('friends')
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending',
        requested_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to send friend request' },
        { status: 500 },
      );
    }

    return NextResponse.json({ friendRequest });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Accept or decline friend request
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { requestId, action, userId }: { requestId: string; action: string; userId: string } = body;

    if (!requestId || !action || !userId) {
      return NextResponse.json(
        { error: 'Request ID, action, and user ID are required' },
        { status: 400 },
      );
    }

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "accept" or "decline"' },
        { status: 400 },
      );
    }

    // Verify the user is the recipient of the friend request
    const { data: friendRequestData, error: fetchError } = await supabase
      .from('friends')
      .select('*')
      .eq('id', requestId)
      .eq('friend_id', userId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !friendRequestData) {
      return NextResponse.json(
        { error: 'Friend request not found or unauthorized' },
        { status: 404 },
      );
    }

    // Update the friend request
    const updateData: Record<string, unknown> = {
      status: action === 'accept' ? 'accepted' : 'declined',
    };

    if (action === 'accept') {
      updateData.accepted_at = new Date().toISOString();
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from('friends')
      .update(updateData)
      .eq('id', requestId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update friend request' },
        { status: 500 },
      );
    }

    return NextResponse.json({ friendRequest: updatedRequest });
  } catch (error) {
    console.error('Error updating friend request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
