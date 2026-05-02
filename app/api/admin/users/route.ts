import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabase.from('users').select('*');

    if (role) query = query.eq('role', role);
    if (status) query = query.eq('status', status);
    if (search) query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST /api/admin/users - Create user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, role } = body;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // Create user profile
    const { data, error } = await supabase.from('users').insert({
      id: authData.user.id,
      email,
      full_name,
      role: role || 'buyer',
      status: 'active',
    });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}