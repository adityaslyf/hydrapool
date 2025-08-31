import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Split ID is required' },
        { status: 400 },
      );
    }

    const { data: split, error: splitError } = await supabase
      .from('splits')
      .select(
        `
        *,
        creator:users!creator_id (
          id,
          email,
          username,
          wallet,
          created_at
        )
      `,
      )
      .eq('id', id)
      .single();

    if (splitError) {
      return NextResponse.json({ error: 'Split not found' }, { status: 404 });
    }

    if (!split) {
      return NextResponse.json({ error: 'Split not found' }, { status: 404 });
    }

    const { data: participants, error: participantsError } = await supabase
      .from('split_participants')
      .select(
        `
        *,
        user:users!user_id (
          id,
          email,
          username,
          wallet,
          created_at
        )
      `,
      )
      .eq('split_id', id)
      .order('amount_owed', { ascending: false });

    if (participantsError) {
      return NextResponse.json(
        { error: 'Failed to fetch participants' },
        { status: 500 },
      );
    }

    const splitWithParticipants = {
      ...split,
      participants: participants || [],
    };

    return NextResponse.json({
      split: splitWithParticipants,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
