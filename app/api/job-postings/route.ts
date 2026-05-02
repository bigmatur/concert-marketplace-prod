import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Получить все активные объявления
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const search = searchParams.get('search');

    let query = supabase
      .from('job_postings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (id) {
      query = query.eq('id', id);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (city) {
      query = query.eq('event_city', city);
    }
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase get error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (error) {
    console.error('GET /api/job-postings error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Создать новое объявление (с загрузкой файла)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Получить текстовые поля
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const subcategoriesJson = formData.get('subcategories') as string;
    const event_city = formData.get('event_city') as string;
    const event_date = formData.get('event_date') as string;
    const guest_count = formData.get('guest_count') as string;
    const venue_name = formData.get('venue_name') as string;
    const venue_type = formData.get('venue_type') as string;
    const format = formData.get('format') as string;
    const budget_min = formData.get('budget_min') as string;
    const budget_max = formData.get('budget_max') as string;
    const organizer_name = formData.get('organizer_name') as string;
    const organizer_email = formData.get('organizer_email') as string;
    const riderFile = formData.get('rider') as File | null;

    // Валидация обязательных полей
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Название заявки обязательно' },
        { status: 400 }
      );
    }

    if (!description?.trim()) {
      return NextResponse.json(
        { error: 'Описание обязательно' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Категория обязательна' },
        { status: 400 }
      );
    }

    if (!event_city) {
      return NextResponse.json(
        { error: 'Город обязателен' },
        { status: 400 }
      );
    }

    if (!event_date) {
      return NextResponse.json(
        { error: 'Дата события обязательна' },
        { status: 400 }
      );
    }

    if (!guest_count) {
      return NextResponse.json(
        { error: 'Количество гостей обязательно' },
        { status: 400 }
      );
    }

    // Парсить подкатегории
    let subcategories = [];
    if (subcategoriesJson) {
      try {
        subcategories = JSON.parse(subcategoriesJson);
      } catch (e) {
        console.error('Error parsing subcategories:', e);
      }
    }

    let riderFileUrl: string | null = null;

    // Загружать файл если есть
    if (riderFile && riderFile.size > 0) {
      try {
        const timestamp = Date.now();
        const filename = `${timestamp}-${riderFile.name}`;
        const filePath = `job-postings/${filename}`;

        const arrayBuffer = await riderFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
          .from('job-postings-files')
          .upload(filePath, buffer, {
            contentType: riderFile.type,
            upsert: false,
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          return NextResponse.json(
            { error: `Ошибка загрузки файла: ${uploadError.message}` },
            { status: 500 }
          );
        }

        // Получить публичный URL
        const { data: publicUrlData } = supabase.storage
          .from('job-postings-files')
          .getPublicUrl(filePath);

        riderFileUrl = publicUrlData?.publicUrl || null;
        console.log('File uploaded successfully:', riderFileUrl);
      } catch (fileError) {
        console.error('File upload error:', fileError);
        return NextResponse.json(
          { error: 'Ошибка при загрузке файла' },
          { status: 500 }
        );
      }
    }

    const jobPostingData = {
      title: title.trim(),
      description: description.trim(),
      category,
      subcategories,
      event_city,
      event_date,
      guest_count: parseInt(guest_count),
      venue_name: venue_name?.trim() || null,
      venue_type: venue_type?.trim() || null,
      format: format || 'mixed',
      budget_min: budget_min ? parseFloat(budget_min) : null,
      budget_max: budget_max ? parseFloat(budget_max) : null,
      organizer_name: organizer_name?.trim() || null,
      organizer_email: organizer_email?.trim() || null,
      rider_file_url: riderFileUrl,
      status: 'active',
    };

    console.log('Creating job posting:', jobPostingData);

    const { data, error } = await supabase
      .from('job_postings')
      .insert([jobPostingData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('Job posting created successfully:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('POST /api/job-postings error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}