import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      console.error('Error loading auth users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const users = data.users.map((user) => {
      const metadata = user.user_metadata || {};
      const appMetadata = user.app_metadata || {};

      return {
        id: user.id,
        email: user.email || '',
        phone: user.phone || '',
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        confirmed_at: user.confirmed_at,
        banned_until: user.banned_until,

        full_name:
          metadata.fullName ||
          metadata.full_name ||
          metadata.name ||
          metadata.display_name ||
          '',

        role:
          appMetadata.role ||
          metadata.role ||
          'buyer',

        vendor_id:
          appMetadata.vendor_id ||
          metadata.vendor_id ||
          null,
      };
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, role, vendor_id } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    if (action === 'updateRole') {
      if (!role) {
        return NextResponse.json(
          { error: 'Missing role' },
          { status: 400 }
        );
      }

      const { data: currentUserData, error: currentUserError } =
        await supabase.auth.admin.getUserById(userId);

      if (currentUserError) {
        return NextResponse.json(
          { error: currentUserError.message },
          { status: 500 }
        );
      }

      const currentUser = currentUserData.user;

      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        app_metadata: {
          ...(currentUser.app_metadata || {}),
          role,
          vendor_id: vendor_id || currentUser.app_metadata?.vendor_id || null,
        },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data.user, { status: 200 });
    }

    if (action === 'banUser') {
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: '876000h',
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data.user, { status: 200 });
    }

    if (action === 'unbanUser') {
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: 'none',
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data.user, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PATCH /api/admin/users error:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}