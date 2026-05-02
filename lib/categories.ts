// lib/categories.ts

export interface MainCategory {
  id: string;
  icon: string;
  name_en: string;
  name_ru: string;
  subcategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name_en: string;
  name_ru: string;
  group?: string; // Для группировки внутри подкатегорий
}

export const MAIN_CATEGORIES: MainCategory[] = [
  {
    id: 'technical',
    icon: '🎛',
    name_en: 'Technical Production',
    name_ru: 'Техническое обеспечение',
    subcategories: [
      { id: 'sound', name_en: 'Sound', name_ru: 'Звук' },
      { id: 'lighting', name_en: 'Lighting', name_ru: 'Освещение' },
      { id: 'screens_video', name_en: 'Screens & Video', name_ru: 'Экраны и видео' },
      { id: 'stage_rigging', name_en: 'Stage & Rigging', name_ru: 'Сцена и риггинг' },
      { id: 'special_effects', name_en: 'Special Effects', name_ru: 'Спецэффекты' },
    ],
  },
  {
    id: 'transport',
    icon: '🚚',
    name_en: 'Transport & Logistics',
    name_ru: 'Транспорт и логистика',
    subcategories: [
      // Пассажирский транспорт
      { id: 'business_car', name_en: 'Business Class Car', name_ru: 'Бизнес-класс автомобиль', group: 'Пассажирский транспорт' },
      { id: 'business_van', name_en: 'Business Class Van', name_ru: 'Бизнес-класс фургон', group: 'Пассажирский транспорт' },
      { id: 'passenger_minivan', name_en: 'Passenger Minivan', name_ru: 'Пассажирский микроавтобус', group: 'Пассажирский транспорт' },
      { id: 'shuttle_transport', name_en: 'Shuttle Transport', name_ru: 'Трансферный транспорт', group: 'Пассажирский транспорт' },
      // Туровый транспорт
      { id: 'tour_bus', name_en: 'Tour Bus', name_ru: 'Туристический автобус', group: 'Туровый транспорт' },
      { id: 'sleeper_bus', name_en: 'Sleeper Bus', name_ru: 'Автобус со спальными местами', group: 'Туровый транспорт' },
      // Грузовой
      { id: 'cargo_transport', name_en: 'Cargo Transport', name_ru: 'Грузовой транспорт', group: 'Грузовой' },
      { id: 'equipment_transport', name_en: 'Equipment Transport', name_ru: 'Транспорт оборудования', group: 'Грузовой' },
      // Логистика
      { id: 'tour_logistics', name_en: 'Tour Logistics', name_ru: 'Логистика гастролей', group: 'Логистика' },
      { id: 'route_planning', name_en: 'Route Planning', name_ru: 'Планирование маршрутов', group: 'Логистика' },
      { id: 'dispatch', name_en: 'Dispatch', name_ru: 'Диспетчерское обслуживание', group: 'Логистика' },
      { id: 'freight_support', name_en: 'Freight / Cargo Support', name_ru: 'Поддержка грузов', group: 'Логистика' },
    ],
  },
  {
    id: 'catering',
    icon: '🍽',
    name_en: 'Catering & Hospitality',
    name_ru: 'Кейтеринг и обслуживание',
    subcategories: [
      { id: 'event_catering', name_en: 'Event Catering', name_ru: 'Кейтеринг для событий' },
      { id: 'vip_catering', name_en: 'VIP Catering', name_ru: 'VIP кейтеринг' },
      { id: 'backstage_catering', name_en: 'Backstage Catering', name_ru: 'Кейтеринг за сценой' },
      { id: 'artist_catering', name_en: 'Artist Catering', name_ru: 'Кейтеринг для артистов' },
      { id: 'craft_services', name_en: 'Craft Services', name_ru: 'Craft Services' },
      { id: 'bar_services', name_en: 'Bar Services', name_ru: 'Барное обслуживание' },
      { id: 'hospitality_staff', name_en: 'Hospitality Staff', name_ru: 'Персонал гостеприимства' },
      { id: 'hospitality_management', name_en: 'Hospitality Management', name_ru: 'Управление гостеприимством' },
    ],
  },
  {
    id: 'management',
    icon: '🎤',
    name_en: 'Concert Management',
    name_ru: 'Управление концертами',
    subcategories: [
      { id: 'event_production', name_en: 'Event Production', name_ru: 'Производство событий' },
      { id: 'tour_management', name_en: 'Tour Management', name_ru: 'Управление гастролями' },
      { id: 'stage_management', name_en: 'Stage Management', name_ru: 'Управление сценой' },
      { id: 'artist_management', name_en: 'Artist Management', name_ru: 'Управление артистами' },
      { id: 'technical_direction', name_en: 'Technical Direction', name_ru: 'Техническое руководство' },
      { id: 'event_coordination', name_en: 'Event Coordination', name_ru: 'Координация событий' },
      { id: 'booking_talent', name_en: 'Booking / Talent', name_ru: 'Бронирование / Таланты' },
    ],
  },
  {
    id: 'venues',
    icon: '🏟',
    name_en: 'Venues',
    name_ru: 'Площадки',
    subcategories: [
      { id: 'theater', name_en: 'Theater', name_ru: 'Театр' },
      { id: 'club', name_en: 'Club', name_ru: 'Клуб' },
      { id: 'concert_hall', name_en: 'Concert Hall', name_ru: 'Концертный зал' },
      { id: 'ice_arena', name_en: 'Ice Arena', name_ru: 'Ледовая арена' },
      { id: 'exhibition_center', name_en: 'Exhibition Center', name_ru: 'Выставочный центр' },
      { id: 'outdoor_venue', name_en: 'Outdoor Venue', name_ru: 'Открытая площадка' },
      { id: 'stadium', name_en: 'Stadium', name_ru: 'Стадион' },
      { id: 'amphitheater', name_en: 'Amphitheater', name_ru: 'Амфитеатр' },
      { id: 'festival_grounds', name_en: 'Festival Grounds', name_ru: 'Фестивальная площадка' },
      { id: 'warehouse_venue', name_en: 'Warehouse Venue', name_ru: 'Промышленное помещение' },
      { id: 'private_venue', name_en: 'Private Venue', name_ru: 'Приватное место' },
      { id: 'corporate_venue', name_en: 'Corporate Venue', name_ru: 'Корпоративное место' },
      { id: 'rooftop_venue', name_en: 'Rooftop Venue', name_ru: 'Место на крыше' },
    ],
  },
  {
    id: 'rentals',
    icon: '🎸',
    name_en: 'Rentals & Backline',
    name_ru: 'Аренда оборудования',
    subcategories: [
      { id: 'backline_rental', name_en: 'Backline Rental', name_ru: 'Аренда бэклайна' },
      { id: 'musical_instruments', name_en: 'Musical Instruments', name_ru: 'Музыкальные инструменты' },
      { id: 'dj_equipment', name_en: 'DJ Equipment', name_ru: 'DJ оборудование' },
      { id: 'audio_equipment_rental', name_en: 'Audio Equipment Rental', name_ru: 'Аренда аудиооборудования' },
      { id: 'lighting_equipment_rental', name_en: 'Lighting Equipment Rental', name_ru: 'Аренда светового оборудования' },
      { id: 'stage_equipment_rental', name_en: 'Stage Equipment Rental', name_ru: 'Аренда сценического оборудования' },
    ],
  },
  {
    id: 'media',
    icon: '🎥',
    name_en: 'Media & Content',
    name_ru: 'Медиа и контент',
    subcategories: [
      { id: 'photography', name_en: 'Photography', name_ru: 'Фотография' },
      { id: 'videography', name_en: 'Videography', name_ru: 'Видеография' },
      { id: 'live_streaming', name_en: 'Live Streaming', name_ru: 'Живая трансляция' },
      { id: 'live_broadcast', name_en: 'Live Broadcast', name_ru: 'Прямая трансляция' },
      { id: 'social_media_content', name_en: 'Social Media Content', name_ru: 'Контент для соцсетей' },
      { id: 'content_production', name_en: 'Content Production', name_ru: 'Производство контента' },
    ],
  },
  {
    id: 'staff',
    icon: '👷',
    name_en: 'Event Staff',
    name_ru: 'Персонал',
    subcategories: [
      { id: 'technicians', name_en: 'Technicians', name_ru: 'Технические специалисты' },
      { id: 'stage_crew', name_en: 'Stage Crew', name_ru: 'Сценическая команда' },
      { id: 'load_crew', name_en: 'Load-in / Load-out Crew', name_ru: 'Команда загрузки' },
      { id: 'riggers', name_en: 'Riggers', name_ru: 'Риггеры' },
      { id: 'hospitality_staff_2', name_en: 'Hospitality Staff', name_ru: 'Персонал гостеприимства' },
    ],
  },
  {
    id: 'security',
    icon: '🔒',
    name_en: 'Security',
    name_ru: 'Безопасность',
    subcategories: [
      { id: 'event_security', name_en: 'Event Security', name_ru: 'Безопасность событий' },
      { id: 'vip_security', name_en: 'VIP Security', name_ru: 'VIP безопасность' },
      { id: 'crowd_control', name_en: 'Crowd Control', name_ru: 'Контроль толпы' },
      { id: 'access_control', name_en: 'Access Control', name_ru: 'Контроль доступа' },
    ],
  },
];

// Теги (используются везде)
export const EXPERTISE_TAGS = [
  { id: 'festivals', name_ru: 'Фестивали', name_en: 'Festivals' },
  { id: 'touring', name_ru: 'Гастроли', name_en: 'Touring' },
  { id: 'arena_shows', name_ru: 'Арена-концерты', name_en: 'Arena Shows' },
  { id: 'vip', name_ru: 'VIP', name_en: 'VIP' },
  { id: 'corporate', name_ru: 'Корпоративные события', name_en: 'Corporate Events' },
  { id: 'outdoor', name_ru: 'Уличные события', name_en: 'Outdoor Events' },
  { id: 'weddings', name_ru: 'Свадьбы', name_en: 'Weddings' },
  { id: 'conferences', name_ru: 'Конференции', name_en: 'Conferences' },
  { id: 'awards', name_ru: 'Премии', name_en: 'Awards' },
  { id: 'product_launch', name_ru: 'Запуск продукта', name_en: 'Product Launch' },
  { id: 'live_music', name_ru: 'Живая музыка', name_en: 'Live Music' },
  { id: 'entertainment', name_ru: 'Развлечения', name_en: 'Entertainment' },
];

// Типы площадок (ТОЛЬКО для venues категории)
export const VENUE_TYPES = MAIN_CATEGORIES.find((cat) => cat.id === 'venues')?.subcategories || [];

// Города (централизованный список)
export const DEFAULT_CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Новосибирск',
  'Екатеринбург',
  'Сочи',
  'Самара',
  'Краснодар',
  'Уфа',
  'Пермь',
  'Волгоград',
  'Воронеж',
  'Омск',
  'Челябинск',
  'Ярославль',
  'Ростов-на-Дону',
  'Тверь',
  'Тюмень',
  'Иркутск',
  'Кемерово',
];

// Страны
export const COUNTRIES = [
  'Россия',
  'Казахстан',
  'Беларусь',
  'Украина',
  'США',
  'Великобритания',
  'Германия',
  'Франция',
  'Испания',
  'Италия',
];

// Вспомогательные функции
export function getMainCategoryById(id: string) {
  return MAIN_CATEGORIES.find((cat) => cat.id === id);
}

export function getSubcategoriesByMainId(mainId: string) {
  const category = getMainCategoryById(mainId);
  return category?.subcategories || [];
}

export function getSubcategoryById(mainId: string, subId: string) {
  const subcategories = getSubcategoriesByMainId(mainId);
  return subcategories.find((sub) => sub.id === subId);
}

export function formatCategoryName(mainId: string, lang: 'ru' | 'en' = 'ru') {
  const category = getMainCategoryById(mainId);
  return lang === 'ru' ? category?.name_ru : category?.name_en;
}

export function formatSubcategoryName(subId: string, lang: 'ru' | 'en' = 'ru') {
  for (const category of MAIN_CATEGORIES) {
    const sub = category.subcategories.find((s) => s.id === subId);
    if (sub) {
      return lang === 'ru' ? sub.name_ru : sub.name_en;
    }
  }
  return '';
}