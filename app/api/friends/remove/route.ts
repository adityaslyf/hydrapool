import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Remove friend (delete friend relation)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { relationId, userId } = body;

    if (!relationId || !userId) {
      return NextResponse.json(
        { error: 'Relation ID and user ID are required' },
        { status: 400 },
      );
    }

    // Verify the user is part of this friend relation
    const { data: relation, error: fetchError } = await supabase
      .from('friends')
      .select('*')
      .eq('id', relationId)
      .eq('status', 'accepted')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .single();

    if (fetchError || !relation) {
      return NextResponse.json(
        { error: 'Friend relation not found or unauthorized' },
        { status: 404 },
      );
    }

    // Delete the friend relation
    const { error: deleteError } = await supabase
      .from('friends')
      .delete()
      .eq('id', relationId);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove friend' },
        { status: 500 },
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Friend removed successfully' 
    });
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
