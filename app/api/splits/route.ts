import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Create a new split
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 /api/splits POST: Request received');
    
    const supabase = createServerClient();
    const body = await request.json();
    
    console.log('🔍 /api/splits POST: Request body:', body);
    
    const {
      title,
      description,
      totalAmount,
      currency,
      creatorId,
      participantIds,
      participantAmounts, // New field for custom amounts
    } = body;

    console.log('🔍 /api/splits POST: Extracted fields:', {
      title,
      description,
      totalAmount,
      currency,
      creatorId,
      participantIds,
      participantAmounts,
    });

    if (!title || !totalAmount || !creatorId) {
      console.error('🚨 /api/splits POST: Missing required fields');
      return NextResponse.json(
        { error: 'Title, total amount, and creator ID are required' },
        { status: 400 },
      );
    }

    if (totalAmount <= 0) {
      console.error('🚨 /api/splits POST: Invalid total amount:', totalAmount);
      return NextResponse.json(
        { error: 'Total amount must be greater than 0' },
        { status: 400 },
      );
    }

    // Calculate per-person amount
    const totalParticipants = participantIds.length + 1; // +1 for creator
    const perPersonAmount = totalAmount / totalParticipants;

    console.log('🔍 /api/splits POST: Calculated values:', {
      totalParticipants,
      perPersonAmount,
    });

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

    console.log('🔍 /api/splits POST: Split data to insert:', splitData);

    const { data: split, error: splitError } = await supabase
      .from('splits')
      .insert(splitData)
      .select('*')
      .single();

    if (splitError) {
      console.error('🚨 /api/splits POST: Supabase split insert error:', splitError);
      return NextResponse.json(
        { error: 'Failed to create split', details: splitError.message },
        { status: 500 },
      );
    }

    console.log('✅ /api/splits POST: Split created successfully:', split);

    // Create participant records using calculated amounts
    const participants = [
      // Creator (paid = true since they're creating it)
      {
        split_id: split.id,
        user_id: creatorId,
        amount_owed: participantAmounts?.[creatorId] || perPersonAmount, // Use custom amount or fallback
        paid: true,
        payment_status: 'confirmed', // Use 'confirmed' instead of 'paid'
      },
      // Other participants
      ...participantIds.map((participantId: string) => ({
        split_id: split.id,
        user_id: participantId,
        amount_owed: participantAmounts?.[participantId] || perPersonAmount, // Use custom amount or fallback
        paid: false,
        payment_status: 'pending',
      })),
    ];

    console.log('🔍 /api/splits POST: Participants data to insert:', participants);

    const { error: participantsError } = await supabase
      .from('split_participants')
      .insert(participants);

    if (participantsError) {
      console.error('🚨 /api/splits POST: Supabase participants insert error:', participantsError);
      // Try to clean up the split if participant creation fails
      await supabase.from('splits').delete().eq('id', split.id);
      return NextResponse.json(
        { error: 'Failed to create split participants', details: participantsError.message },
        { status: 500 },
      );
    }

    console.log('✅ /api/splits POST: Participants created successfully');

    const result = {
      split,
      participants: participants.length,
      perPersonAmount,
    };

    console.log('✅ /api/splits POST: Returning success result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('🚨 /api/splits POST: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
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

    let query = supabase.from('splits').select(`
        *,
        creator:creator_id(id, email, username, display_name),
        participants:split_participants(
          id,
          user_id,
          amount_owed,
          paid,
          payment_status,
          user:user_id(id, email, username, display_name)
        )
      `);

    switch (type) {
      case 'created':
        // Get splits created by this user
        query = query.eq('creator_id', userId);
        break;

      case 'participating':
        // Get splits where user is a participant (not creator)
        query = query.neq('creator_id', userId);
        break;

      default:
        // Get all splits for this user (created or participating)
        query = query.or(
          `creator_id.eq.${userId},split_participants.user_id.eq.${userId}`,
        );
    }

    const { data: splits, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Database query error' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      splits: splits || [],
      count: splits?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching splits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
