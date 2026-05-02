import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// PUT: Обновить заявку (статус и т.д.)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const postingId = params.id;

    if (!postingId) {
      return NextResponse.json({ error: 'Missing posting ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('job_postings')
      .update(body)
      .eq('id', postingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating posting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('PUT /api/job-postings/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Удалить заявку
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postingId = params.id;

    if (!postingId) {
      return NextResponse.json({ error: 'Missing posting ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('job_postings')
      .delete()
      .eq('id', postingId);

    if (error) {
      console.error('Error deleting posting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/job-postings/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}