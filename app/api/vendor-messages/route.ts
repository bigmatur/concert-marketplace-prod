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

function normalizeText(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

// GET: Получить все сообщения для вендора
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const vendorId = searchParams.get('vendor_id');
    const unreadOnly = searchParams.get('unread') === 'true';

    if (!vendorId) {
      return NextResponse.json(
        { error: 'vendor_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('vendor_messages')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(data ?? [], { status: 200 });
  } catch (error) {
    console.error('GET /api/vendor-messages error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST: Отправить сообщение вендору
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const vendorId = normalizeText(body.vendor_id);
    const senderEmail = normalizeText(body.sender_email);
    const senderName = normalizeText(body.sender_name);
    const subject = normalizeText(body.subject) || 'Сообщение от клиента';
    const message = normalizeText(body.message);

    if (!vendorId || !senderEmail || !senderName || !message) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: vendor_id, sender_email, sender_name, message',
        },
        { status: 400 }
      );
    }

    const messageData = {
      vendor_id: vendorId,
      sender_email: senderEmail,
      sender_name: senderName,
      subject,
      message,
      is_read: false,
    };

    const { data, error } = await supabase
      .from('vendor_messages')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('POST /api/vendor-messages error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// PATCH: отметить сообщение прочитанным / непрочитанным
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const messageId = normalizeText(body.id);

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message id is required' },
        { status: 400 }
      );
    }

    const updateData: {
      is_read?: boolean;
    } = {};

    if (typeof body.is_read === 'boolean') {
      updateData.is_read = body.is_read;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('vendor_messages')
      .update(updateData)
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('PATCH /api/vendor-messages error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}