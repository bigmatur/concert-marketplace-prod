import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Получить вендора по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching vendor:', error);
      return NextResponse.json(
        { error: 'Вендор не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении вендора' },
      { status: 500 }
    );
  }
}

// PUT: Обновить вендора
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log('=== UPDATE VENDOR REQUEST ===');
    console.log('Vendor ID:', params.id);
    console.log('Received body:', JSON.stringify(body, null, 2));

    // Получаем текущие данные вендора
    const { data: currentVendor, error: fetchError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError) {
      console.error('Error fetching current vendor:', fetchError);
      return NextResponse.json(
        { error: 'Вендор не найден' },
        { status: 404 }
      );
    }

    console.log('Current vendor data:', JSON.stringify(currentVendor, null, 2));

    // Helper функция для безопасного получения значения
    const getValue = (newVal: any, oldVal: any, defaultVal: any = null) => {
      if (newVal !== undefined && newVal !== null) return newVal;
      if (oldVal !== undefined && oldVal !== null) return oldVal;
      return defaultVal;
    };

    // Подготовка данных для обновления
    const vendorData: any = {
      name: getValue(body.name, currentVendor.name, ''),
      description: getValue(body.description, currentVendor.description, null),
      main_categories: getValue(body.main_categories, currentVendor.main_categories, []),
      subcategories: getValue(body.subcategories, currentVendor.subcategories, []),
      tags: getValue(body.tags, currentVendor.tags, []),
      portfolio: getValue(body.portfolio, currentVendor.portfolio, []),
      status: getValue(body.status, currentVendor.status, 'active'),
      primary_city: getValue(body.primary_city, currentVendor.primary_city, ''),
      service_cities: getValue(body.service_cities, currentVendor.service_cities, []),
      country: getValue(body.country, currentVendor.country, 'Россия'),
      region: getValue(body.region, currentVendor.region, null),
      email: getValue(body.email, currentVendor.email, null),
      phone: getValue(body.phone, currentVendor.phone, null),
      website: getValue(body.website, currentVendor.website, null),
      instagram: getValue(body.instagram, currentVendor.instagram, null),
      facebook: getValue(body.facebook, currentVendor.facebook, null),
      youtube: getValue(body.youtube, currentVendor.youtube, null),
      linkedin: getValue(body.linkedin, currentVendor.linkedin, null),
      tiktok: getValue(body.tiktok, currentVendor.tiktok, null),
      telegram: getValue(body.telegram, currentVendor.telegram, null),
      vk: getValue(body.vk, currentVendor.vk, null),
      is_venue: getValue(body.is_venue, currentVendor.is_venue, false),
      venue_type: getValue(body.venue_type, currentVendor.venue_type, null),
      seated_capacity: getValue(body.seated_capacity, currentVendor.seated_capacity, 0),
      standing_capacity: getValue(body.standing_capacity, currentVendor.standing_capacity, 0),
      max_capacity: getValue(body.max_capacity, currentVendor.max_capacity, 0),
      dressing_rooms: getValue(body.dressing_rooms, currentVendor.dressing_rooms, 0),
      address: getValue(body.address, currentVendor.address, null),
      indoor_outdoor: getValue(body.indoor_outdoor, currentVendor.indoor_outdoor, 'indoor'),
      parking: getValue(body.parking, currentVendor.parking, false),
      accessibility: getValue(body.accessibility, currentVendor.accessibility, false),
      updated_at: new Date().toISOString(),
    };

    console.log('Data to update:', JSON.stringify(vendorData, null, 2));

    const { data, error } = await supabase
      .from('vendors')
      .update(vendorData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: (error as any).details,
      });
      return NextResponse.json(
        { error: `Ошибка базы данных: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Update successful, returned data:', JSON.stringify(data, null, 2));
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Server error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { error: `Ошибка сервера: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// DELETE: Удалить вендора (опционально)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting vendor:', error);
      return NextResponse.json(
        { error: 'Ошибка при удалении вендора' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Вендор удален успешно' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении вендора' },
      { status: 500 }
    );
  }
}