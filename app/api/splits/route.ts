import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Create a new split
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    const {
      title,
      description,
      totalAmount,
      currency,
      creatorId,
      participantIds,
      splitType,
      customAmounts,
      participantAmounts, // Legacy field for backward compatibility
    } = body;

    if (!title || !totalAmount || !creatorId) {
      return NextResponse.json(
        { error: 'Title, total amount, and creator ID are required' },
        { status: 400 },
      );
    }

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Total amount must be greater than 0' },
        { status: 400 },
      );
    }

    // Calculate per-person amount for equal splits
    const totalParticipants = participantIds.length + 1; // +1 for creator
    const perPersonAmount = totalAmount / totalParticipants;

    // Use customAmounts if splitType is 'custom', otherwise use participantAmounts or equal split
    const amounts = customAmounts || participantAmounts || {};

    // Validate custom amounts if splitType is 'custom'
    if (splitType === 'custom') {
      const allParticipantIds = [creatorId, ...participantIds];
      const totalCustomAmount = allParticipantIds.reduce((sum, id) => {
        return sum + (amounts[id] || 0);
      }, 0);

      // Allow small rounding differences (within 0.01)
      if (Math.abs(totalCustomAmount - totalAmount) > 0.01) {
        return NextResponse.json(
          { 
            error: `Custom amounts ($${totalCustomAmount.toFixed(2)}) must equal total amount ($${totalAmount.toFixed(2)})` 
          },
          { status: 400 }
        );
      }
    }

    // Create the split
    const splitData = {
      title,
      description: description || null,
      total_amount: totalAmount,
      per_share: perPersonAmount,
      currency: currency || 'USDC',
      creator_id: creatorId,
      status: 'active',
    };

    const { data: split, error: splitError } = await supabase
      .from('splits')
      .insert(splitData)
      .select('*')
      .single();

    if (splitError) {
      return NextResponse.json(
        { error: 'Failed to create split' },
        { status: 500 },
      );
    }

    // Create participant records using calculated amounts
    const participants = [
      // Creator (paid = true since they're creating it)
      {
        split_id: split.id,
        user_id: creatorId,
        amount_owed: splitType === 'custom' ? (amounts[creatorId] || 0) : perPersonAmount,
        paid: true,
        payment_status: 'confirmed', // Use 'confirmed' instead of 'paid'
      },
      // Other participants
      ...participantIds.map((participantId: string) => ({
        split_id: split.id,
        user_id: participantId,
        amount_owed: splitType === 'custom' ? (amounts[participantId] || 0) : perPersonAmount,
        paid: false,
        payment_status: 'pending',
      })),
    ];

    const { error: participantsError } = await supabase
      .from('split_participants')
      .insert(participants);

    if (participantsError) {
      // Try to clean up the split if participant creation fails
      await supabase.from('splits').delete().eq('id', split.id);
      return NextResponse.json(
        { error: 'Failed to create split participants' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      split,
      participants: participants.length,
      perPersonAmount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Get splits for a user
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'created', 'participating', 'all'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }

    let splits: any[] = [];

    if (type === 'created') {
      // Get splits created by this user
      const { data: createdSplits, error: createdError } = await supabase
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
          ),
          participants:split_participants (
            id,
            user_id,
            amount_owed,
            paid,
            payment_status,
            paid_at,
            payment_transaction_id,
            user:users!user_id (
              id,
              email,
              username,
              wallet,
              created_at
            )
          )
        `,
        )
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (createdError) {
        return NextResponse.json(
          { error: 'Failed to fetch created splits' },
          { status: 500 },
        );
      }

      splits = createdSplits || [];
    } else if (type === 'participating') {
      // Get splits where user is a participant
      const { data: participantSplits, error: participantError } =
        await supabase
          .from('split_participants')
          .select(
            `
          split:splits!split_id (
            *,
            creator:users!creator_id (
              id,
              email,
              username,
              wallet,
              created_at
            ),
            participants:split_participants (
              id,
              user_id,
              amount_owed,
              paid,
              payment_status,
              paid_at,
              payment_transaction_id,
              user:users!user_id (
                id,
                email,
                username,
                wallet,
                created_at
              )
            )
          )
        `,
          )
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

      if (participantError) {
        return NextResponse.json(
          { error: 'Failed to fetch participating splits' },
          { status: 500 },
        );
      }

      // Extract the split data from the nested structure
      splits = (participantSplits || [])
        .map((p: any) => p.split)
        .filter(Boolean);
    } else {
      // Get all splits for this user (both created and participating)

      // First get created splits
      const { data: createdSplits, error: createdError } = await supabase
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
          ),
          participants:split_participants (
            id,
            user_id,
            amount_owed,
            paid,
            payment_status,
            paid_at,
            payment_transaction_id,
            user:users!user_id (
              id,
              email,
              username,
              wallet,
              created_at
            )
          )
        `,
        )
        .eq('creator_id', userId);

      // Then get participating splits
      const { data: participantSplits, error: participantError } =
        await supabase
          .from('split_participants')
          .select(
            `
          split:splits!split_id (
            *,
            creator:users!creator_id (
              id,
              email,
              username,
              wallet,
              created_at
            ),
            participants:split_participants (
              id,
              user_id,
              amount_owed,
              paid,
              payment_status,
              paid_at,
              payment_transaction_id,
              user:users!user_id (
                id,
                email,
                username,
                wallet,
                created_at
              )
            )
          )
        `,
          )
          .eq('user_id', userId)
          .neq('splits.creator_id', userId); // Exclude splits where user is creator to avoid duplicates

      if (createdError || participantError) {
        return NextResponse.json(
          { error: 'Failed to fetch splits' },
          { status: 500 },
        );
      }

      // Combine and deduplicate
      const allCreated = createdSplits || [];
      const allParticipating = (participantSplits || [])
        .map((p: any) => p.split)
        .filter(Boolean);

      // Merge arrays and remove duplicates by ID
      const splitMap = new Map();
      [...allCreated, ...allParticipating].forEach((split) => {
        if (split && split.id) {
          splitMap.set(split.id, split);
        }
      });

      splits = Array.from(splitMap.values());

      // Sort by created_at desc
      splits.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    return NextResponse.json({
      splits: splits,
      count: splits.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
