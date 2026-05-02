import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

type SenderType = 'vendor' | 'client' | 'admin';

const allowedSenderTypes: SenderType[] = ['vendor', 'client', 'admin'];

function getDeleteColumn(userType: SenderType) {
  if (userType === 'admin') return 'deleted_by_admin';
  if (userType === 'vendor') return 'deleted_by_vendor';
  return 'deleted_by_client';
}

function getBlockColumn(userType: SenderType) {
  if (userType === 'admin') return 'blocked_by_admin';
  if (userType === 'vendor') return 'blocked_by_vendor';
  return 'blocked_by_client';
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const conversationId = searchParams.get('conversationId');
    const postingId = searchParams.get('postingId');
    const vendorId = searchParams.get('vendorId');
    const vendorEmail = searchParams.get('vendorEmail');
    const clientEmail = searchParams.get('clientEmail');
    const type = searchParams.get('type');
    const userType = searchParams.get('userType') as SenderType | null;

    if (conversationId) {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || [], { status: 200 });
    }

    if (type === 'conversations' || vendorId || vendorEmail || clientEmail || postingId) {
      let query = supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (postingId) {
        query = query.eq('posting_id', postingId);
      }

      if (vendorId) {
        query = query.eq('vendor_id', vendorId);
      }

      if (vendorEmail) {
        query = query.eq('vendor_email', vendorEmail);
      }

      if (clientEmail) {
        query = query.eq('client_email', clientEmail);
      }

      if (userType && allowedSenderTypes.includes(userType)) {
        const deleteColumn = getDeleteColumn(userType);
        query = query.or(`${deleteColumn}.is.null,${deleteColumn}.eq.false`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || [], { status: 200 });
    }

    return NextResponse.json([], { status: 200 });
  } catch (error) {
    console.error('GET /api/conversations error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'createConversation') {
      const {
        postingId,
        vendorId,
        vendorEmail,
        vendorName,
        clientEmail,
        clientName,
      } = body;

      if (!vendorId || !clientEmail || !clientName) {
        return NextResponse.json(
          {
            error: 'Missing required fields for conversation creation',
            required: ['vendorId', 'clientEmail', 'clientName'],
            received: {
              postingId,
              vendorId,
              vendorEmail,
              vendorName,
              clientEmail,
              clientName,
            },
          },
          { status: 400 }
        );
      }

      let existingQuery = supabase
        .from('conversations')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('client_email', clientEmail)
        .limit(1);

      if (postingId) {
        existingQuery = existingQuery.eq('posting_id', postingId);
      }

      const { data: existingConversations, error: existingError } = await existingQuery;

      if (existingError) {
        console.error('Error checking existing conversation:', existingError);
      }

      if (existingConversations && existingConversations.length > 0) {
        const existing = existingConversations[0];

        await supabase
          .from('conversations')
          .update({
            deleted_by_client: false,
            deleted_by_vendor: false,
            deleted_by_admin: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        return NextResponse.json(existing, { status: 200 });
      }

      const now = new Date().toISOString();

      const insertData = {
        posting_id: postingId || null,
        vendor_id: vendorId,
        vendor_email: vendorEmail || null,
        vendor_name: vendorName || null,
        client_email: clientEmail,
        client_name: clientName,
        status: 'open',
        last_message_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('conversations')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data, { status: 201 });
    }

    if (action === 'sendMessage') {
      const {
        conversationId,
        senderEmail,
        senderName,
        senderType,
        message,
        file_url,
        file_name,
      } = body;

      if (!conversationId || !senderEmail || !senderName || !senderType) {
        return NextResponse.json(
          {
            error: 'Missing required fields for message sending',
            required: ['conversationId', 'senderEmail', 'senderName', 'senderType'],
          },
          { status: 400 }
        );
      }

      if (!allowedSenderTypes.includes(senderType)) {
        return NextResponse.json(
          {
            error: 'Invalid senderType',
            allowed: allowedSenderTypes,
            received: senderType,
          },
          { status: 400 }
        );
      }

      if (!message?.trim() && !file_url) {
        return NextResponse.json(
          { error: 'Message or file is required' },
          { status: 400 }
        );
      }

      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (conversationError || !conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      const isBlocked =
        conversation.blocked_by_client ||
        conversation.blocked_by_vendor ||
        conversation.blocked_by_admin ||
        conversation.status === 'blocked';

      if (isBlocked) {
        return NextResponse.json(
          { error: 'This conversation is blocked' },
          { status: 403 }
        );
      }

      const messageData = {
        conversation_id: conversationId,
        sender_email: senderEmail,
        sender_name: senderName,
        sender_type: senderType,
        message: message?.trim() || '',
        file_url: file_url || null,
        file_name: file_name || null,
        is_read: false,
      };

      const { data: createdMessage, error: messageError } = await supabase
        .from('conversation_messages')
        .insert([messageData])
        .select()
        .single();

      if (messageError) {
        console.error('Error creating message:', messageError);
        return NextResponse.json(
          { error: messageError.message },
          { status: 500 }
        );
      }

      await supabase
        .from('conversations')
        .update({
          last_message_at: createdMessage.created_at || new Date().toISOString(),
          deleted_by_client: false,
          deleted_by_vendor: false,
          deleted_by_admin: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      return NextResponse.json(createdMessage, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('POST /api/conversations error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      conversationId,
      status,
      markAsRead,
      action,
      userType,
      blockedReason,
    } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing conversationId' },
        { status: 400 }
      );
    }

    if (markAsRead) {
      const { error } = await supabase
        .from('conversation_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (action === 'deleteConversation') {
      if (!userType || !allowedSenderTypes.includes(userType)) {
        return NextResponse.json(
          { error: 'Invalid or missing userType' },
          { status: 400 }
        );
      }

      const deleteColumn = getDeleteColumn(userType);

      const { data, error } = await supabase
        .from('conversations')
        .update({
          [deleteColumn]: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data, { status: 200 });
    }

    if (action === 'blockConversation') {
      if (!userType || !allowedSenderTypes.includes(userType)) {
        return NextResponse.json(
          { error: 'Invalid or missing userType' },
          { status: 400 }
        );
      }

      const blockColumn = getBlockColumn(userType);

      const { data, error } = await supabase
        .from('conversations')
        .update({
          [blockColumn]: true,
          status: 'blocked',
          blocked_reason: blockedReason || null,
          blocked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data, { status: 200 });
    }

    if (action === 'unblockConversation') {
      const { data, error } = await supabase
        .from('conversations')
        .update({
          blocked_by_client: false,
          blocked_by_vendor: false,
          blocked_by_admin: false,
          status: 'open',
          blocked_reason: null,
          blocked_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data, { status: 200 });
    }

    if (status) {
      const { data, error } = await supabase
        .from('conversations')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json(
      { error: 'No update parameters provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PUT /api/conversations error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}