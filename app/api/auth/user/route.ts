import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const wallet = searchParams.get('wallet');
    const id = searchParams.get('id');

    if (!email && !wallet && !id) {
      return NextResponse.json(
        { error: 'Email, wallet, or id parameter is required' },
        { status: 400 }
      );
    }

    let query = supabase.from('users').select('*');

    if (id) {
      query = query.eq('id', id);
    } else if (email) {
      query = query.eq('email', email);
    } else if (wallet) {
      query = query.eq('wallet', wallet);
    }

    const { data: user, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return NextResponse.json({ user: null });
      }
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { email, wallet, username } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user already exists by email
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      // If user exists and we have a real wallet, update it
      if (wallet && !wallet.startsWith('pending_') && existingUser.wallet?.startsWith('pending_')) {
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ wallet })
          .eq('id', existingUser.id)
          .select('*')
          .single();

        if (updateError) {
          console.error('Supabase update error:', updateError);
          return NextResponse.json({ user: existingUser });
        }
        return NextResponse.json({ user: updatedUser });
      }
      return NextResponse.json({ user: existingUser });
    }

    // Create new user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        wallet: wallet || `pending_${Date.now()}`,
        username: username || email.split('@')[0],
      })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { id, email, wallet, username } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (email) updateData.email = email;
    if (wallet) updateData.wallet = wallet;
    if (username) updateData.username = username;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}