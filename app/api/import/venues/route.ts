import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Маппинг типов площадок на основные категории
const VENUE_TYPE_TO_CATEGORY: Record<string, string> = {
  theater: 'venues',
  concert_hall: 'venues',
  club: 'venues',
  arena: 'venues',
  outdoor: 'venues',
  restaurant: 'catering',
  bar: 'catering',
  default: 'venues',
};

interface VenueRow {
  venue_name?: string;
  venue_type?: string;
  city?: string;
  address?: string;
  capacity?: number;
  website?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  vk?: string;
  telegram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  confidence?: string;
  description_ru?: string;
  notes?: string;
  main_category?: string;
  subcategories?: string;
  seated_capacity?: number;
  standing_capacity?: number;
  parking?: string;
  accessibility?: string;
  status?: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const { venues } = await request.json();

    if (!Array.isArray(venues) || venues.length === 0) {
      return NextResponse.json(
        { error: 'No venues provided' },
        { status: 400 }
      );
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Обработать каждую площадку
    for (let i = 0; i < venues.length; i++) {
      const venue = venues[i];

      try {
        // Валидация
        if (!venue.venue_name || !venue.city) {
          errors.push(`Строка ${i + 2}: Отсутствует название или город`);
          failed++;
          continue;
        }

        // Определить категорию
        const mainCategory = venue.main_category || 'venues';

        // Обработать контакты (могут быть разделены ;)
        const emails = venue.email
          ? venue.email.split(';').map((e: string) => e.trim()).filter(Boolean)
          : [];
        const phones = venue.phone
          ? venue.phone.split(';').map((p: string) => p.trim()).filter(Boolean)
          : [];
        
        const socials = {
          instagram: venue.instagram || null,
          vk: venue.vk || null,
          telegram: venue.telegram || null,
          facebook: venue.facebook || null,
          youtube: venue.youtube || null,
          tiktok: venue.tiktok || null,
        };

        // Парсить подкатегории
        let subcategories = [];
        if (venue.subcategories && typeof venue.subcategories === 'string') {
          subcategories = venue.subcategories.split(',').map((s: string) => s.trim()).filter(Boolean);
        }

        // Определить вместимость
        const seatedCapacity = venue.seated_capacity || (venue.capacity && venue.venue_type === 'theater' ? venue.capacity : null);
        const standingCapacity = venue.standing_capacity || (venue.capacity && venue.venue_type !== 'theater' ? venue.capacity : null);

        // Парсить boolean поля
        const hasParking = venue.parking ? venue.parking.toLowerCase() === 'yes' : false;
        const hasAccessibility = venue.accessibility ? venue.accessibility.toLowerCase() === 'yes' : false;

        // Создать вендора
        const vendorData = {
          name: venue.venue_name.trim(),
          description: venue.description_ru || null,
          main_categories: [mainCategory],
          subcategories: subcategories,
          tags: [],
          primary_city: venue.city.trim(),
          service_cities: [venue.city.trim()],
          country: 'Россия',
          region: venue.city.trim(),
          email: emails.length > 0 ? emails[0] : null,
          phone: phones.length > 0 ? phones[0] : null,
          website: venue.website || null,
          instagram: socials.instagram,
          facebook: socials.facebook,
          youtube: socials.youtube,
          linkedin: null,
          tiktok: socials.tiktok,
          telegram: socials.telegram,
          vk: socials.vk,
          is_venue: mainCategory === 'venues',
          venue_type: venue.venue_type || 'theater',
          seated_capacity: seatedCapacity,
          standing_capacity: standingCapacity,
          max_capacity: venue.capacity || null,
          dressing_rooms: 0,
          address: venue.address || null,
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

    return NextResponse.json(
      {
        success,
        failed,
        errors: errors.slice(0, 50), // Ограничить на 50 ошибок в ответе
        total: venues.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/import/venues error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}