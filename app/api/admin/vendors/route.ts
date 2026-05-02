import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🔍 Checking Supabase credentials...');
console.log('URL exists:', !!supabaseUrl);
console.log('Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
  throw new Error(`Missing Supabase credentials. URL: ${!!supabaseUrl}, Key: ${!!supabaseKey}`);
}

console.log('✅ Supabase credentials loaded');

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let query = supabase.from('vendors').select('*');

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase GET error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('GET /api/admin/vendors error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ПРОВЕРКА: это импорт или обычное создание?
    if (body.venues && Array.isArray(body.venues)) {
      // ===== ИМПОРТ МНОЖЕСТВА ВЕНДОРОВ =====
      console.log('🔄 IMPORT MODE: Processing', body.venues.length, 'venues');

      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (let i = 0; i < body.venues.length; i++) {
        const venue = body.venues[i];

        try {
          // Валидация
          if (!venue.venue_name || !venue.city) {
            errors.push(`Строка ${i + 2}: Отсутствует название или город`);
            failed++;
            continue;
          }

          // Обработать контакты (могут быть разделены ;)
          const emails = venue.email
            ? venue.email.split(';').map((e: string) => e.trim()).filter(Boolean)
            : [];
          const phones = venue.phone
            ? venue.phone.split(';').map((p: string) => p.trim()).filter(Boolean)
            : [];

          const socials = {
            instagram: venue.instagram || '',
            vk: venue.vk || '',
            telegram: venue.telegram || '',
            facebook: venue.facebook || '',
            youtube: venue.youtube || '',
            tiktok: venue.tiktok || '',
          };

          // Парсить подкатегории
          let subcategories = [];
          if (venue.subcategories && typeof venue.subcategories === 'string') {
            subcategories = venue.subcategories.split(',').map((s: string) => s.trim()).filter(Boolean);
          }

          // Определить вместимость
          const seatedCapacity = venue.seated_capacity || (venue.capacity && venue.venue_type === 'theater' ? venue.capacity : 0);
          const standingCapacity = venue.standing_capacity || (venue.capacity && venue.venue_type !== 'theater' ? venue.capacity : 0);

          // Парсить boolean поля
          const hasParking = venue.parking ? String(venue.parking).toLowerCase() === 'yes' : false;
          const hasAccessibility = venue.accessibility ? String(venue.accessibility).toLowerCase() === 'yes' : false;

          // Создать вендора
          const vendorData = {
            name: venue.venue_name.trim(),
            description: venue.description_ru || '',
            main_categories: [venue.main_category || 'venues'],
            subcategories: subcategories,
            tags: [],
            primary_city: venue.city.trim(),
            service_cities: [venue.city.trim()],
            country: 'Россия',
            region: venue.city.trim(),
            email: emails.length > 0 ? emails[0] : '',
            phone: phones.length > 0 ? phones[0] : '',
            website: venue.website || '',
            instagram: socials.instagram,
            facebook: socials.facebook,
            youtube: socials.youtube,
            linkedin: '',
            tiktok: socials.tiktok,
            telegram: socials.telegram,
            vk: socials.vk,
            is_venue: true,
            venue_type: venue.venue_type || 'theater',
            seated_capacity: seatedCapacity,
            standing_capacity: standingCapacity,
            max_capacity: venue.capacity || 0,
            dressing_rooms: 0,
            address: venue.address || '',
            indoor_outdoor: 'indoor',
            parking: hasParking,
            accessibility: hasAccessibility,
            status: venue.status || 'active',
          };

          // Сохранить в БД
          const { error } = await supabase
            .from('vendors')
            .insert([vendorData]);

          if (error) {
            errors.push(`Строка ${i + 2}: ${venue.venue_name} - ${error.message}`);
            failed++;
          } else {
            success++;
          }
        } catch (error) {
          errors.push(`Строка ${i + 2}: ${venue.venue_name} - ${error instanceof Error ? error.message : 'Unknown error'}`);
          failed++;
        }
      }

      console.log(`✅ Import completed: ${success} success, ${failed} failed`);

      return NextResponse.json(
        {
          success,
          failed,
          errors: errors.slice(0, 50),
          total: body.venues.length,
        },
        { status: 200 }
      );
    }

    // ===== ОБЫЧНОЕ СОЗДАНИЕ ОДНОГО ВЕНДОРА =====
    console.log('=== CREATE VENDOR START ===');
    console.log('Raw body:', JSON.stringify(body, null, 2));

    const vendorData: any = {
      name: String(body.name || '').trim(),
      description: String(body.description || '').trim(),
      status: String(body.status || 'active').trim(),
      primary_city: String(body.primary_city || '').trim(),
      country: String(body.country || 'Россия').trim(),
      region: String(body.region || '').trim(),
      email: String(body.email || '').trim(),
      phone: String(body.phone || '').trim(),
      website: String(body.website || '').trim(),
      instagram: String(body.instagram || '').trim(),
      facebook: String(body.facebook || '').trim(),
      youtube: String(body.youtube || '').trim(),
      linkedin: String(body.linkedin || '').trim(),
      tiktok: String(body.tiktok || '').trim(),
      telegram: String(body.telegram || '').trim(),
      vk: String(body.vk || '').trim(),
      is_venue: Boolean(body.is_venue) || false,
      venue_type: String(body.venue_type || '').trim(),
      seated_capacity: Math.max(0, parseInt(body.seated_capacity) || 0),
      standing_capacity: Math.max(0, parseInt(body.standing_capacity) || 0),
      max_capacity: Math.max(0, parseInt(body.max_capacity) || 0),
      dressing_rooms: Math.max(0, parseInt(body.dressing_rooms) || 0),
      address: String(body.address || '').trim(),
      indoor_outdoor: String(body.indoor_outdoor || 'indoor').trim(),
      parking: Boolean(body.parking) || false,
      accessibility: Boolean(body.accessibility) || false,
      main_categories: Array.isArray(body.main_categories) ? body.main_categories : [],
      subcategories: Array.isArray(body.subcategories) ? body.subcategories : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      service_cities: Array.isArray(body.service_cities) ? body.service_cities : [],
    };

    console.log('Processed vendor data:', JSON.stringify(vendorData, null, 2));

    if (!vendorData.name) {
      return NextResponse.json(
        { error: 'Название вендора обязательно' },
        { status: 400 }
      );
    }

    if (vendorData.main_categories.length === 0) {
      return NextResponse.json(
        { error: 'Выбери хотя бы одну основную категорию' },
        { status: 400 }
      );
    }

    if (!vendorData.primary_city) {
      return NextResponse.json(
        { error: 'Выбери основной город' },
        { status: 400 }
      );
    }

    console.log('Validation passed, inserting...');

    const { data, error } = await supabase
      .from('vendors')
      .insert([vendorData])
      .select();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);

      return NextResponse.json(
        {
          error: `Ошибка базы данных: ${error.message}`,
          code: error.code,
          details: error.details,
        },
        { status: 500 }
      );
    }

    console.log('✅ Vendor created successfully:', data);
    console.log('=== CREATE VENDOR END ===');

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('❌ POST /api/admin/vendors error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';

    console.error('Error stack:', errorStack);

    return NextResponse.json(
      {
        error: `Ошибка сервера: ${errorMessage}`,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
      { status: 500 }
    );
  }
}