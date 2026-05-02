import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// GET /api/admin/reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const flagged = searchParams.get('flagged');
    const hidden = searchParams.get('hidden');
    const vendorId = searchParams.get('vendor_id');
    const userId = searchParams.get('user_id');

    let query = supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (flagged === 'true') {
      query = query.eq('is_flagged', true);
    }

    if (hidden === 'true') {
      query = query.eq('is_hidden', true);
    }

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('GET /api/admin/reviews error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/reviews
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, is_hidden, is_flagged, moderation_notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Review id is required' },
        { status: 400 }
      );
    }

    const updateData: {
      is_hidden?: boolean;
      is_flagged?: boolean;
      moderation_notes?: string | null;
    } = {};

    if (typeof is_hidden === 'boolean') {
      updateData.is_hidden = is_hidden;
    }

    if (typeof is_flagged === 'boolean') {
      updateData.is_flagged = is_flagged;
    }

    if (typeof moderation_notes !== 'undefined') {
      updateData.moderation_notes = moderation_notes;
    }

    const { data, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('PATCH /api/admin/reviews error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}