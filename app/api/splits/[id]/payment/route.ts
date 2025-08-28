import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Update payment status for a split participant
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    const body = await request.json();

    const { participantId, transactionSignature, amount } = body;

    if (!participantId || !transactionSignature) {
      return NextResponse.json(
        { error: 'Participant ID and transaction signature are required' },
        { status: 400 },
      );
    }

    // Update the participant's payment status
    const { error: updateError } = await supabase
      .from('split_participants')
      .update({
        paid: true,
        payment_status: 'confirmed',
        payment_transaction_id: transactionSignature,
        paid_at: new Date().toISOString(),
      })
      .eq('id', participantId)
      .eq('split_id', id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
